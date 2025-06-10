-- ===== ENHANCED UPLOADED DOCUMENTS BUCKET VIEWS FOR NESTED FOLDERS =====

-- Enhanced view to handle nested folder structures
CREATE OR REPLACE VIEW uploaded_documents_files_nested AS
SELECT 
    obj.id,
    obj.name,
    obj.bucket_id,
    obj.path_tokens,
    
    -- Root level folder (first directory)
    obj.path_tokens[1] as root_folder,
    
    -- Parent folder (direct parent)
    CASE 
        WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
        WHEN array_length(obj.path_tokens, 1) = 2 THEN obj.path_tokens[1]
        ELSE obj.path_tokens[array_length(obj.path_tokens, 1) - 1]
    END as parent_folder,
    
    -- Full folder path (excluding filename)
    array_to_string(obj.path_tokens[1:array_length(obj.path_tokens, 1)-1], '/') as full_folder_path,
    
    -- Nested level depth
    array_length(obj.path_tokens, 1) - 1 as folder_depth,
    
    -- Folder hierarchy as array
    obj.path_tokens[1:array_length(obj.path_tokens, 1)-1] as folder_hierarchy,
    
    obj.metadata->>'size' as size,
    obj.metadata->>'mimetype' as mime_type,
    obj.created_at,
    obj.updated_at,
    CONCAT(
        'https://', 
        current_setting('app.settings.supabase_url', true), 
        '/storage/v1/object/public/uploaded-documents/', 
        array_to_string(obj.path_tokens, '/')
    ) as public_url
FROM storage.objects obj
WHERE obj.bucket_id = 'uploaded-documents'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'  -- Has file extension
ORDER BY obj.created_at DESC;

-- Recursive folder structure view
CREATE OR REPLACE VIEW uploaded_documents_folder_tree AS
WITH RECURSIVE folder_tree AS (
    -- Base case: get all unique folder paths
    SELECT DISTINCT
        array_to_string(path_tokens[1:level], '/') as folder_path,
        path_tokens[level] as folder_name,
        level as depth,
        CASE 
            WHEN level = 1 THEN 'root'
            ELSE array_to_string(path_tokens[1:level-1], '/')
        END as parent_path,
        path_tokens[1:level] as path_array
    FROM (
        SELECT 
            path_tokens,
            generate_series(1, array_length(path_tokens, 1) - 1) as level
        FROM storage.objects 
        WHERE bucket_id = 'uploaded-documents' 
            AND metadata IS NOT NULL 
            AND name LIKE '%.%'
    ) paths
)
SELECT 
    ft.folder_path,
    ft.folder_name,
    ft.depth,
    ft.parent_path,
    ft.path_array,
    
    -- Count files directly in this folder (not subfolders)
    COALESCE(direct_files.file_count, 0) as direct_file_count,
    
    -- Count total files including subfolders
    COALESCE(total_files.total_file_count, 0) as total_file_count,
    
    -- Total size of files in this folder and subfolders
    COALESCE(total_files.total_size, 0) as total_size,
    
    -- Check if folder has subfolders
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM folder_tree ft2 
            WHERE ft2.parent_path = ft.folder_path
        ) THEN true 
        ELSE false 
    END as has_subfolders

FROM folder_tree ft

-- Count direct files (files directly in this folder, not subfolders)
LEFT JOIN (
    SELECT 
        array_to_string(path_tokens[1:array_length(path_tokens, 1)-1], '/') as folder_path,
        COUNT(*) as file_count
    FROM storage.objects
    WHERE bucket_id = 'uploaded-documents'
        AND metadata IS NOT NULL
        AND name LIKE '%.%'
    GROUP BY array_to_string(path_tokens[1:array_length(path_tokens, 1)-1], '/')
) direct_files ON direct_files.folder_path = ft.folder_path

-- Count total files (including subfolders)
LEFT JOIN (
    SELECT 
        array_to_string(path_tokens[1:depth], '/') as folder_path,
        COUNT(*) as total_file_count,
        SUM(CAST(metadata->>'size' AS BIGINT)) as total_size
    FROM (
        SELECT 
            so.path_tokens,
            so.metadata,
            generate_series(1, array_length(so.path_tokens, 1) - 1) as depth
        FROM storage.objects so
        WHERE so.bucket_id = 'uploaded-documents'
            AND so.metadata IS NOT NULL
            AND so.name LIKE '%.%'
    ) expanded
    GROUP BY array_to_string(path_tokens[1:depth], '/')
) total_files ON total_files.folder_path = ft.folder_path

ORDER BY ft.depth, ft.folder_name;

-- ===== ENHANCED FUNCTIONS FOR NESTED FOLDER SUPPORT =====

-- Function to get files with nested folder support
CREATE OR REPLACE FUNCTION get_files_by_folder_path(
    folder_path_param TEXT DEFAULT NULL,
    include_subfolders BOOLEAN DEFAULT FALSE,
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    root_folder TEXT,
    parent_folder TEXT,
    full_folder_path TEXT,
    folder_depth INTEGER,
    folder_hierarchy TEXT[],
    size TEXT,
    mime_type TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    public_url TEXT,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        udf.id,
        udf.name,
        udf.root_folder,
        udf.parent_folder,
        udf.full_folder_path,
        udf.folder_depth,
        udf.folder_hierarchy,
        udf.size,
        udf.mime_type,
        udf.created_at,
        udf.updated_at,
        udf.public_url,
        COUNT(*) OVER() as total_count
    FROM uploaded_documents_files_nested udf
    WHERE (
        folder_path_param IS NULL OR
        (include_subfolders = TRUE AND udf.full_folder_path LIKE folder_path_param || '%') OR
        (include_subfolders = FALSE AND udf.full_folder_path = folder_path_param)
    )
    ORDER BY udf.folder_depth, udf.created_at DESC
    OFFSET ((page_num - 1) * page_size)
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to get folder structure tree
CREATE OR REPLACE FUNCTION get_folder_tree(
    parent_path_param TEXT DEFAULT NULL,
    max_depth INTEGER DEFAULT NULL
)
RETURNS TABLE (
    folder_path TEXT,
    folder_name TEXT,
    depth INTEGER,
    parent_path TEXT,
    path_array TEXT[],
    direct_file_count BIGINT,
    total_file_count BIGINT,
    total_size BIGINT,
    has_subfolders BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ft.folder_path,
        ft.folder_name,
        ft.depth,
        ft.parent_path,
        ft.path_array,
        ft.direct_file_count,
        ft.total_file_count,
        ft.total_size,
        ft.has_subfolders
    FROM uploaded_documents_folder_tree ft
    WHERE (
        parent_path_param IS NULL OR
        ft.parent_path = parent_path_param
    )
    AND (max_depth IS NULL OR ft.depth <= max_depth)
    ORDER BY ft.depth, ft.folder_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get breadcrumb navigation
CREATE OR REPLACE FUNCTION get_folder_breadcrumbs(folder_path_param TEXT)
RETURNS TABLE (
    level INTEGER,
    folder_name TEXT,
    folder_path TEXT,
    is_current BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH path_parts AS (
        SELECT 
            unnest(string_to_array(folder_path_param, '/')) as part,
            generate_subscripts(string_to_array(folder_path_param, '/'), 1) as level
    ),
    breadcrumbs AS (
        SELECT 
            pp.level,
            pp.part as folder_name,
            array_to_string(
                (string_to_array(folder_path_param, '/'))[1:pp.level], 
                '/'
            ) as folder_path,
            pp.level = array_length(string_to_array(folder_path_param, '/'), 1) as is_current
        FROM path_parts pp
    )
    SELECT 
        0 as level,
        'Home' as folder_name,
        '' as folder_path,
        folder_path_param = '' as is_current
    
    UNION ALL
    
    SELECT * FROM breadcrumbs
    ORDER BY level;
END;
$$ LANGUAGE plpgsql;

-- Function to search files with folder context
CREATE OR REPLACE FUNCTION search_files_with_folders(
    search_term TEXT DEFAULT NULL,
    folder_path_filter TEXT DEFAULT NULL,
    include_subfolders BOOLEAN DEFAULT TRUE,
    mime_type_filter TEXT DEFAULT NULL,
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    full_folder_path TEXT,
    folder_hierarchy TEXT[],
    folder_depth INTEGER,
    size TEXT,
    mime_type TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    public_url TEXT,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        udf.id,
        udf.name,
        udf.full_folder_path,
        udf.folder_hierarchy,
        udf.folder_depth,
        udf.size,
        udf.mime_type,
        udf.created_at,
        udf.updated_at,
        udf.public_url,
        COUNT(*) OVER() as total_count
    FROM uploaded_documents_files_nested udf
    WHERE (search_term IS NULL OR udf.name ILIKE '%' || search_term || '%')
        AND (mime_type_filter IS NULL OR udf.mime_type LIKE mime_type_filter || '%')
        AND (
            folder_path_filter IS NULL OR
            (include_subfolders = TRUE AND udf.full_folder_path LIKE folder_path_filter || '%') OR
            (include_subfolders = FALSE AND udf.full_folder_path = folder_path_filter)
        )
    ORDER BY udf.folder_depth, udf.created_at DESC
    OFFSET ((page_num - 1) * page_size)
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- ===== EXAMPLE QUERIES FOR TESTING =====

-- Get all folders in tree structure
-- SELECT * FROM get_folder_tree();

-- Get immediate children of a specific folder
-- SELECT * FROM get_folder_tree('documents/contracts');

-- Get files in a specific folder (not including subfolders)
-- SELECT * FROM get_files_by_folder_path('documents/contracts', false);

-- Get files in a folder including all subfolders
-- SELECT * FROM get_files_by_folder_path('documents', true);

-- Get breadcrumb navigation for a folder
-- SELECT * FROM get_folder_breadcrumbs('documents/contracts/2024');

-- Search files with folder filtering
-- SELECT * FROM search_files_with_folders('invoice', 'documents/invoices', true);