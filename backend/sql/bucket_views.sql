-- ===== SINGLE AWS S3 BUCKET VIEWS - RERA-DEV =====

-- View to get all files from rera-dev bucket with organized structure
CREATE OR REPLACE VIEW rera_dev_files AS
SELECT 
    obj.id,
    obj.name,
    obj.bucket_id,
    obj.path_tokens[1] as category,
    obj.path_tokens as full_path_array,
    CASE 
        WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
        WHEN obj.path_tokens[1] IN ('documents', 'uploaded-documents', 'files') THEN 'documents'
        WHEN obj.path_tokens[1] IN ('photos', 'profile-photos', 'user-photos', 'images') THEN 'photos'
        ELSE obj.path_tokens[1]
    END as file_type,
    array_to_string(obj.path_tokens[1:array_length(obj.path_tokens, 1)-1], '/') as folder_path,
    obj.metadata->>'size' as size,
    obj.metadata->>'mimetype' as mime_type,
    obj.created_at,
    obj.updated_at,
    CONCAT(
        'https://', 
        current_setting('app.settings.aws_s3_url', true), 
        '/', 
        obj.bucket_id,
        '/',
        array_to_string(obj.path_tokens, '/')
    ) as public_url,
    array_length(obj.path_tokens, 1) as depth_level
FROM storage.objects obj
WHERE obj.bucket_id = 'rera-dev'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'  -- Has file extension
ORDER BY obj.created_at DESC;

-- View to get category summary for rera-dev bucket
CREATE OR REPLACE VIEW rera_dev_category_summary AS
SELECT 
    CASE 
        WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
        WHEN obj.path_tokens[1] IN ('documents', 'uploaded-documents', 'files') THEN 'documents'
        WHEN obj.path_tokens[1] IN ('photos', 'profile-photos', 'user-photos', 'images') THEN 'photos'
        ELSE obj.path_tokens[1]
    END as category_name,
    obj.path_tokens[1] as original_folder,
    COUNT(*) as file_count,
    SUM(CAST(obj.metadata->>'size' AS BIGINT)) as total_size,
    MIN(obj.created_at) as oldest_file,
    MAX(obj.created_at) as newest_file,
    array_agg(DISTINCT obj.metadata->>'mimetype') as mime_types,
    array_agg(DISTINCT obj.path_tokens[2]) FILTER (WHERE array_length(obj.path_tokens, 1) > 2) as subfolders
FROM storage.objects obj
WHERE obj.bucket_id = 'rera-dev'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'
GROUP BY 
    CASE 
        WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
        WHEN obj.path_tokens[1] IN ('documents', 'uploaded-documents', 'files') THEN 'documents'
        WHEN obj.path_tokens[1] IN ('photos', 'profile-photos', 'user-photos', 'images') THEN 'photos'
        ELSE obj.path_tokens[1]
    END,
    obj.path_tokens[1]
ORDER BY file_count DESC;

-- View to get document files specifically
CREATE OR REPLACE VIEW rera_dev_documents AS
SELECT 
    obj.id,
    obj.name,
    obj.bucket_id,
    obj.path_tokens[1] as main_folder,
    obj.path_tokens[2] as sub_folder,
    obj.path_tokens as full_path_array,
    array_to_string(obj.path_tokens[1:array_length(obj.path_tokens, 1)-1], '/') as folder_path,
    obj.metadata->>'size' as size,
    obj.metadata->>'mimetype' as mime_type,
    obj.created_at,
    obj.updated_at,
    CONCAT(
        'https://', 
        current_setting('app.settings.aws_s3_url', true), 
        '/', 
        obj.bucket_id,
        '/',
        array_to_string(obj.path_tokens, '/')
    ) as public_url,
    array_length(obj.path_tokens, 1) as depth_level
FROM storage.objects obj
WHERE obj.bucket_id = 'rera-dev'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'
    AND obj.path_tokens[1] IN ('documents', 'uploaded-documents', 'files')
ORDER BY obj.created_at DESC;

-- View to get photo files specifically
CREATE OR REPLACE VIEW rera_dev_photos AS
SELECT 
    obj.id,
    obj.name,
    obj.bucket_id,
    obj.path_tokens[1] as main_folder,
    obj.path_tokens[2] as role_or_category,
    obj.path_tokens as full_path_array,
    array_to_string(obj.path_tokens[1:array_length(obj.path_tokens, 1)-1], '/') as folder_path,
    obj.metadata->>'size' as size,
    obj.metadata->>'mimetype' as mime_type,
    obj.created_at,
    obj.updated_at,
    CONCAT(
        'https://', 
        current_setting('app.settings.aws_s3_url', true), 
        '/', 
        obj.bucket_id,
        '/',
        array_to_string(obj.path_tokens, '/')
    ) as public_url,
    array_length(obj.path_tokens, 1) as depth_level
FROM storage.objects obj
WHERE obj.bucket_id = 'rera-dev'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'
    AND (obj.path_tokens[1] IN ('photos', 'profile-photos', 'user-photos', 'images')
         OR obj.metadata->>'mimetype' LIKE 'image/%')
ORDER BY obj.created_at DESC;

-- View for overall bucket statistics
CREATE OR REPLACE VIEW rera_dev_statistics AS
SELECT 
    'rera-dev' as bucket_name,
    COUNT(*) as total_files,
    SUM(CAST(metadata->>'size' AS BIGINT)) as total_size_bytes,
    ROUND(SUM(CAST(metadata->>'size' AS BIGINT)) / 1024.0 / 1024.0, 2) as total_size_mb,
    ROUND(SUM(CAST(metadata->>'size' AS BIGINT)) / 1024.0 / 1024.0 / 1024.0, 2) as total_size_gb,
    COUNT(DISTINCT path_tokens[1]) as total_main_folders,
    COUNT(DISTINCT CONCAT(path_tokens[1], '/', path_tokens[2])) FILTER (WHERE array_length(path_tokens, 1) > 2) as total_subfolders,
    MIN(created_at) as oldest_file,
    MAX(created_at) as newest_file,
    array_agg(DISTINCT metadata->>'mimetype') as all_mime_types,
    COUNT(*) FILTER (WHERE metadata->>'mimetype' LIKE 'image/%') as image_files,
    COUNT(*) FILTER (WHERE metadata->>'mimetype' = 'application/pdf') as pdf_files,
    COUNT(*) FILTER (WHERE metadata->>'mimetype' LIKE 'application/vnd.openxmlformats-officedocument%') as office_files,
    COUNT(*) FILTER (WHERE metadata->>'mimetype' LIKE 'text/%') as text_files
FROM storage.objects
WHERE metadata IS NOT NULL
    AND name LIKE '%.%'
    AND bucket_id = 'rera-dev';

-- ===== UTILITY FUNCTIONS FOR SINGLE BUCKET =====

-- Function to get paginated files from rera-dev bucket
CREATE OR REPLACE FUNCTION get_rera_dev_files_paginated(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 100,
    category_filter TEXT DEFAULT NULL,
    folder_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    folder_path TEXT,
    size TEXT,
    mime_type TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    public_url TEXT,
    depth_level INTEGER,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rdf.id,
        rdf.name,
        rdf.category,
        rdf.folder_path,
        rdf.size,
        rdf.mime_type,
        rdf.created_at,
        rdf.updated_at,
        rdf.public_url,
        rdf.depth_level,
        COUNT(*) OVER() as total_count
    FROM rera_dev_files rdf
    WHERE (category_filter IS NULL OR rdf.category = category_filter)
        AND (folder_filter IS NULL OR rdf.folder_path LIKE '%' || folder_filter || '%')
    ORDER BY rdf.created_at DESC
    OFFSET ((page_num - 1) * page_size)
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to get documents with pagination
CREATE OR REPLACE FUNCTION get_rera_dev_documents_paginated(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 100,
    subfolder_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    main_folder TEXT,
    sub_folder TEXT,
    folder_path TEXT,
    size TEXT,
    mime_type TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    public_url TEXT,
    depth_level INTEGER,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rdd.id,
        rdd.name,
        rdd.main_folder,
        rdd.sub_folder,
        rdd.folder_path,
        rdd.size,
        rdd.mime_type,
        rdd.created_at,
        rdd.updated_at,
        rdd.public_url,
        rdd.depth_level,
        COUNT(*) OVER() as total_count
    FROM rera_dev_documents rdd
    WHERE (subfolder_filter IS NULL OR rdd.sub_folder = subfolder_filter)
    ORDER BY rdd.created_at DESC
    OFFSET ((page_num - 1) * page_size)
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to get photos with pagination
CREATE OR REPLACE FUNCTION get_rera_dev_photos_paginated(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 100,
    role_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    main_folder TEXT,
    role_or_category TEXT,
    folder_path TEXT,
    size TEXT,
    mime_type TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    public_url TEXT,
    depth_level INTEGER,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rdp.id,
        rdp.name,
        rdp.main_folder,
        rdp.role_or_category,
        rdp.folder_path,
        rdp.size,
        rdp.mime_type,
        rdp.created_at,
        rdp.updated_at,
        rdp.public_url,
        rdp.depth_level,
        COUNT(*) OVER() as total_count
    FROM rera_dev_photos rdp
    WHERE (role_filter IS NULL OR rdp.role_or_category = role_filter)
    ORDER BY rdp.created_at DESC
    OFFSET ((page_num - 1) * page_size)
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to search files in rera-dev bucket
CREATE OR REPLACE FUNCTION search_rera_dev_files(
    search_term TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL,
    mime_type_filter TEXT DEFAULT NULL,
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    full_path TEXT,
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
        obj.id,
        obj.name,
        CASE 
            WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
            WHEN obj.path_tokens[1] IN ('documents', 'uploaded-documents', 'files') THEN 'documents'
            WHEN obj.path_tokens[1] IN ('photos', 'profile-photos', 'user-photos', 'images') THEN 'photos'
            ELSE obj.path_tokens[1]
        END as category,
        array_to_string(obj.path_tokens, '/') as full_path,
        obj.metadata->>'size' as size,
        obj.metadata->>'mimetype' as mime_type,
        obj.created_at,
        obj.updated_at,
        CONCAT(
            'https://', 
            current_setting('app.settings.aws_s3_url', true), 
            '/', 
            obj.bucket_id,
            '/',
            array_to_string(obj.path_tokens, '/')
        ) as public_url,
        COUNT(*) OVER() as total_count
    FROM storage.objects obj
    WHERE obj.metadata IS NOT NULL
        AND obj.name LIKE '%.%'
        AND obj.bucket_id = 'rera-dev'
        AND (category_filter IS NULL OR 
             CASE 
                WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
                WHEN obj.path_tokens[1] IN ('documents', 'uploaded-documents', 'files') THEN 'documents'
                WHEN obj.path_tokens[1] IN ('photos', 'profile-photos', 'user-photos', 'images') THEN 'photos'
                ELSE obj.path_tokens[1]
             END = category_filter)
        AND (search_term IS NULL OR obj.name ILIKE '%' || search_term || '%')
        AND (mime_type_filter IS NULL OR obj.metadata->>'mimetype' LIKE mime_type_filter || '%')
    ORDER BY obj.created_at DESC
    OFFSET ((page_num - 1) * page_size)
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- ===== EXAMPLE QUERIES =====

-- Get all files with pagination
-- SELECT * FROM get_rera_dev_files_paginated(1, 50);

-- Get files from specific category
-- SELECT * FROM get_rera_dev_files_paginated(1, 50, 'documents');

-- Get documents with pagination  
-- SELECT * FROM get_rera_dev_documents_paginated(1, 50);

-- Get documents from specific subfolder
-- SELECT * FROM get_rera_dev_documents_paginated(1, 50, 'contracts');

-- Get photos with pagination
-- SELECT * FROM get_rera_dev_photos_paginated(1, 50);

-- Get photos from specific role/category
-- SELECT * FROM get_rera_dev_photos_paginated(1, 50, 'admin');

-- Get category summary
-- SELECT * FROM rera_dev_category_summary;

-- Get overall statistics
-- SELECT * FROM rera_dev_statistics;

-- Search across all files
-- SELECT * FROM search_rera_dev_files('contract', 'documents', 'application/pdf', 1, 20);

-- Get all files organized by category
-- SELECT category, COUNT(*) as file_count FROM rera_dev_files GROUP BY category;