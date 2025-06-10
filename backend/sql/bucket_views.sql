-- ===== UPLOADED DOCUMENTS BUCKET VIEWS =====

-- View to get all files from uploaded-documents bucket with organized structure
CREATE OR REPLACE VIEW uploaded_documents_files AS
SELECT 
    obj.id,
    obj.name,
    obj.bucket_id,
    obj.path_tokens[1] as top_level_folder,
    obj.path_tokens as full_path_array,
    CASE 
        WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
        ELSE obj.path_tokens[1]
    END as folder,
    array_to_string(obj.path_tokens[1:array_length(obj.path_tokens, 1)-1], '/') as folder_path,
    obj.metadata->>'size' as size,
    obj.metadata->>'mimetype' as mime_type,
    obj.created_at,
    obj.updated_at,
    CONCAT(
        'https://', 
        current_setting('app.settings.supabase_url', true), 
        '/storage/v1/object/public/uploaded-documents/', 
        array_to_string(obj.path_tokens, '/')
    ) as public_url,
    array_length(obj.path_tokens, 1) as depth_level
FROM storage.objects obj
WHERE obj.bucket_id = 'uploaded-documents'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'  -- Has file extension
ORDER BY obj.created_at DESC;

-- View to get folder summary for uploaded documents
CREATE OR REPLACE VIEW uploaded_documents_folder_summary AS
SELECT 
    CASE 
        WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
        ELSE obj.path_tokens[1]
    END as folder_name,
    COUNT(*) as file_count,
    SUM(CAST(obj.metadata->>'size' AS BIGINT)) as total_size,
    MIN(obj.created_at) as oldest_file,
    MAX(obj.created_at) as newest_file,
    array_agg(DISTINCT obj.metadata->>'mimetype') as mime_types
FROM storage.objects obj
WHERE obj.bucket_id = 'uploaded-documents'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'
GROUP BY 
    CASE 
        WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
        ELSE obj.path_tokens[1]
    END
ORDER BY file_count DESC;

-- ===== USER PROFILE PHOTOS BUCKET VIEWS =====

-- View to get all user profile photos organized by role
CREATE OR REPLACE VIEW user_profile_photos AS
SELECT 
    obj.id,
    obj.name,
    obj.bucket_id,
    obj.path_tokens[1] as role_folder,
    obj.path_tokens as full_path_array,
    array_to_string(obj.path_tokens[1:array_length(obj.path_tokens, 1)-1], '/') as folder_path,
    obj.metadata->>'size' as size,
    obj.metadata->>'mimetype' as mime_type,
    obj.created_at,
    obj.updated_at,
    CONCAT(
        'https://', 
        current_setting('app.settings.supabase_url', true), 
        '/storage/v1/object/public/user-profile-photos/', 
        array_to_string(obj.path_tokens, '/')
    ) as public_url,
    array_length(obj.path_tokens, 1) as depth_level
FROM storage.objects obj
WHERE obj.bucket_id = 'user-profile-photos'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'  -- Has file extension
ORDER BY obj.created_at DESC;

-- View to get role summary for user profile photos
CREATE OR REPLACE VIEW user_profile_photos_role_summary AS
SELECT 
    obj.path_tokens[1] as role_name,
    COUNT(*) as photo_count,
    SUM(CAST(obj.metadata->>'size' AS BIGINT)) as total_size,
    MIN(obj.created_at) as oldest_photo,
    MAX(obj.created_at) as newest_photo,
    array_agg(DISTINCT obj.metadata->>'mimetype') as mime_types
FROM storage.objects obj
WHERE obj.bucket_id = 'user-profile-photos'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'
    AND array_length(obj.path_tokens, 1) > 1
GROUP BY obj.path_tokens[1]
ORDER BY photo_count DESC;

-- ===== COMBINED BUCKET VIEWS =====

-- View to get complete bucket structure overview
CREATE OR REPLACE VIEW all_buckets_structure AS
SELECT 
    'uploaded-documents' as bucket_name,
    'document' as file_type,
    CASE 
        WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
        ELSE obj.path_tokens[1]
    END as category,
    COUNT(*) as file_count,
    SUM(CAST(obj.metadata->>'size' AS BIGINT)) as total_size,
    array_agg(DISTINCT obj.metadata->>'mimetype') as mime_types
FROM storage.objects obj
WHERE obj.bucket_id = 'uploaded-documents'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'
GROUP BY 
    CASE 
        WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root'
        ELSE obj.path_tokens[1]
    END

UNION ALL

SELECT 
    'user-profile-photos' as bucket_name,
    'photo' as file_type,
    obj.path_tokens[1] as category,
    COUNT(*) as file_count,
    SUM(CAST(obj.metadata->>'size' AS BIGINT)) as total_size,
    array_agg(DISTINCT obj.metadata->>'mimetype') as mime_types
FROM storage.objects obj
WHERE obj.bucket_id = 'user-profile-photos'
    AND obj.metadata IS NOT NULL
    AND obj.name LIKE '%.%'
    AND array_length(obj.path_tokens, 1) > 1
GROUP BY obj.path_tokens[1]
ORDER BY bucket_name, file_count DESC;

-- View for overall bucket statistics
CREATE OR REPLACE VIEW bucket_statistics AS
SELECT 
    bucket_id as bucket_name,
    COUNT(*) as total_files,
    SUM(CAST(metadata->>'size' AS BIGINT)) as total_size_bytes,
    ROUND(SUM(CAST(metadata->>'size' AS BIGINT)) / 1024.0 / 1024.0, 2) as total_size_mb,
    COUNT(DISTINCT path_tokens[1]) as total_categories,
    MIN(created_at) as oldest_file,
    MAX(created_at) as newest_file,
    array_agg(DISTINCT metadata->>'mimetype') as all_mime_types
FROM storage.objects
WHERE metadata IS NOT NULL
    AND name LIKE '%.%'
    AND bucket_id IN ('uploaded-documents', 'user-profile-photos')
GROUP BY bucket_id

UNION ALL

SELECT 
    'total' as bucket_name,
    COUNT(*) as total_files,
    SUM(CAST(metadata->>'size' AS BIGINT)) as total_size_bytes,
    ROUND(SUM(CAST(metadata->>'size' AS BIGINT)) / 1024.0 / 1024.0, 2) as total_size_mb,
    COUNT(DISTINCT CONCAT(bucket_id, ':', path_tokens[1])) as total_categories,
    MIN(created_at) as oldest_file,
    MAX(created_at) as newest_file,
    array_agg(DISTINCT metadata->>'mimetype') as all_mime_types
FROM storage.objects
WHERE metadata IS NOT NULL
    AND name LIKE '%.%'
    AND bucket_id IN ('uploaded-documents', 'user-profile-photos')
ORDER BY bucket_name;

-- ===== UTILITY FUNCTIONS FOR CONTROLLERS =====

-- Function to get paginated files from uploaded-documents
CREATE OR REPLACE FUNCTION get_uploaded_documents_paginated(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 100,
    folder_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    folder TEXT,
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
        udf.id,
        udf.name,
        udf.folder,
        udf.folder_path,
        udf.size,
        udf.mime_type,
        udf.created_at,
        udf.updated_at,
        udf.public_url,
        udf.depth_level,
        COUNT(*) OVER() as total_count
    FROM uploaded_documents_files udf
    WHERE (folder_filter IS NULL OR udf.folder = folder_filter)
    ORDER BY udf.created_at DESC
    OFFSET ((page_num - 1) * page_size)
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to get paginated user photos
CREATE OR REPLACE FUNCTION get_user_photos_paginated(
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 100,
    role_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    role_folder TEXT,
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
        upp.id,
        upp.name,
        upp.role_folder,
        upp.folder_path,
        upp.size,
        upp.mime_type,
        upp.created_at,
        upp.updated_at,
        upp.public_url,
        upp.depth_level,
        COUNT(*) OVER() as total_count
    FROM user_profile_photos upp
    WHERE (role_filter IS NULL OR upp.role_folder = role_filter)
    ORDER BY upp.created_at DESC
    OFFSET ((page_num - 1) * page_size)
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to search files across both buckets
CREATE OR REPLACE FUNCTION search_all_files(
    search_term TEXT DEFAULT NULL,
    bucket_filter TEXT DEFAULT NULL,
    mime_type_filter TEXT DEFAULT NULL,
    page_num INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    bucket_name TEXT,
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
        obj.bucket_id as bucket_name,
        CASE 
            WHEN obj.bucket_id = 'uploaded-documents' THEN 
                CASE WHEN array_length(obj.path_tokens, 1) = 1 THEN 'root' ELSE obj.path_tokens[1] END
            ELSE obj.path_tokens[1]
        END as category,
        array_to_string(obj.path_tokens, '/') as full_path,
        obj.metadata->>'size' as size,
        obj.metadata->>'mimetype' as mime_type,
        obj.created_at,
        obj.updated_at,
        CONCAT(
            'https://', 
            current_setting('app.settings.supabase_url', true), 
            '/storage/v1/object/public/', 
            obj.bucket_id, 
            '/', 
            array_to_string(obj.path_tokens, '/')
        ) as public_url,
        COUNT(*) OVER() as total_count
    FROM storage.objects obj
    WHERE obj.metadata IS NOT NULL
        AND obj.name LIKE '%.%'
        AND obj.bucket_id IN ('uploaded-documents', 'user-profile-photos')
        AND (bucket_filter IS NULL OR obj.bucket_id = bucket_filter)
        AND (search_term IS NULL OR obj.name ILIKE '%' || search_term || '%')
        AND (mime_type_filter IS NULL OR obj.metadata->>'mimetype' LIKE mime_type_filter || '%')
    ORDER BY obj.created_at DESC
    OFFSET ((page_num - 1) * page_size)
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- ===== EXAMPLE QUERIES =====

-- Get all uploaded documents with pagination
-- SELECT * FROM get_uploaded_documents_paginated(1, 50);

-- Get files from specific folder
-- SELECT * FROM get_uploaded_documents_paginated(1, 50, 'contracts');

-- Get all user photos with pagination  
-- SELECT * FROM get_user_photos_paginated(1, 50);

-- Get photos from specific role
-- SELECT * FROM get_user_photos_paginated(1, 50, 'admin');

-- Get folder summary
-- SELECT * FROM uploaded_documents_folder_summary;

-- Get role summary
-- SELECT * FROM user_profile_photos_role_summary;

-- Get overall statistics
-- SELECT * FROM bucket_statistics;

-- Search across all files
-- SELECT * FROM search_all_files('contract', NULL, 'application/pdf', 1, 20);

-- Get complete bucket structure
-- SELECT * FROM all_buckets_structure;