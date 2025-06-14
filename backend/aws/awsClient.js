// awsClient.js
import pkg from 'pg';
const { Pool } = pkg;
import AWS from 'aws-sdk';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// AWS RDS PostgreSQL connection
const pool = new Pool({
  user: process.env.RDS_USERNAME,
  host: process.env.RDS_HOSTNAME,
  database: process.env.RDS_DB_NAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT || 5432,
  ssl: {
    rejectUnauthorized: false, // For RDS SSL connection
  },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 10000,
  max: 20, // Maximum connections in pool
  min: 2,  // Minimum connections in pool
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to AWS RDS PostgreSQL successfully');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to AWS RDS:', err.message);
    return false;
  }
};

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Single bucket name - rera-dev
const bucketName = process.env.S3_BUCKET_NAME || 'rera-dev';

// Test S3 connection
const testS3Connection = async () => {
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`✅ Connected to AWS S3 bucket '${bucketName}' successfully`);
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to AWS S3:', err.message);
    return false;
  }
};

// Multer configuration for file uploads
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit (increased for larger files)
  },
  fileFilter: (req, file, cb) => {
    // Extended file type support
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx|xls|ppt|pptx|zip|rar/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                    file.mimetype.includes('application/') || 
                    file.mimetype.includes('text/') ||
                    file.mimetype.includes('image/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not supported. Allowed: images, PDFs, documents, spreadsheets, presentations, and archives'));
    }
  }
});

// S3 helper functions for single bucket
export const uploadToS3 = async (file, key, folder = null) => {
  // Construct the full path with folder structure
  const fullKey = folder ? `${folder}/${key}` : key;
  
  const params = {
    Bucket: bucketName,
    Key: fullKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
    Metadata: {
      originalName: file.originalname,
      uploadDate: new Date().toISOString(),
      fileSize: file.size.toString()
    }
  };

  try {
    const result = await s3.upload(params).promise();
    console.log(`✅ Uploaded to S3: ${fullKey}`);
    return {
      url: result.Location,
      key: fullKey,
      bucket: bucketName,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (err) {
    throw new Error(`S3 upload failed: ${err.message}`);
  }
};

export const deleteFromS3 = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`✅ Deleted file from S3: ${key}`);
    return true;
  } catch (err) {
    throw new Error(`S3 delete failed: ${err.message}`);
  }
};

// Move file within the bucket (copy and delete)
export const moveFileInS3 = async (oldKey, newKey) => {
  try {
    // Copy to new location
    await s3.copyObject({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldKey}`,
      Key: newKey
    }).promise();

    // Delete old file
    await deleteFromS3(oldKey);
    
    console.log(`✅ Moved file from ${oldKey} to ${newKey}`);
    return true;
  } catch (err) {
    throw new Error(`S3 move failed: ${err.message}`);
  }
};

// List files in a specific folder
export const listS3Files = async (prefix = '', maxKeys = 1000) => {
  const params = {
    Bucket: bucketName,
    Prefix: prefix,
    MaxKeys: maxKeys
  };

  try {
    const result = await s3.listObjectsV2(params).promise();
    return result.Contents || [];
  } catch (err) {
    throw new Error(`S3 list failed: ${err.message}`);
  }
};

export const getSignedUrl = (key, expires = 3600) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expires // URL expires in 1 hour by default
  };

  return s3.getSignedUrl('getObject', params);
};

// Get file metadata from S3
export const getFileMetadata = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    const result = await s3.headObject(params).promise();
    return {
      size: result.ContentLength,
      lastModified: result.LastModified,
      contentType: result.ContentType,
      metadata: result.Metadata,
      etag: result.ETag
    };
  } catch (err) {
    throw new Error(`Failed to get file metadata: ${err.message}`);
  }
};

// Database helper functions
export const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// Helper function to determine file category based on path or mimetype
export const categorizeFile = (filePath, mimeType) => {
  const path = filePath.toLowerCase();
  const mime = mimeType.toLowerCase();
  
  if (path.includes('document') || path.includes('file') || mime.includes('pdf') || mime.includes('document')) {
    return 'documents';
  }
  
  if (path.includes('photo') || path.includes('image') || mime.includes('image')) {
    return 'photos';
  }
  
  if (path.includes('user') || path.includes('profile')) {
    return 'photos';
  }
  
  return 'documents'; // Default category
};

// Utility to create folder structure path
export const createFolderPath = (category, subcategory = null, userRole = null) => {
  let path = category;
  
  if (subcategory) {
    path += `/${subcategory}`;
  }
  
  if (userRole) {
    path += `/${userRole}`;
  }
  
  return path;
};

// Initialize connections
export const initializeConnections = async () => {
  console.log('🔄 Initializing AWS connections...');
  
  const dbConnected = await testConnection();
  const s3Connected = await testS3Connection();
  
  if (!dbConnected) {
    throw new Error('Failed to connect to AWS RDS');
  }
  
  if (!s3Connected) {
    throw new Error('Failed to connect to AWS S3');
  }
  
  console.log(`✅ All AWS services connected successfully to bucket: ${bucketName}`);
  return { dbConnected, s3Connected, bucketName };
};

// Graceful shutdown
export const closeConnections = async () => {
  try {
    await pool.end();
    console.log('✅ Database connections closed');
  } catch (err) {
    console.error('❌ Error closing database connections:', err);
  }
};

// Get bucket statistics
export const getBucketStats = async () => {
  try {
    const params = {
      Bucket: bucketName
    };
    
    const objects = await s3.listObjectsV2(params).promise();
    
    let totalSize = 0;
    let totalFiles = objects.Contents?.length || 0;
    const categories = {};
    
    objects.Contents?.forEach(obj => {
      totalSize += obj.Size;
      const category = categorizeFile(obj.Key, '');
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return {
      bucketName,
      totalFiles,
      totalSize: totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      categories,
      lastUpdated: new Date().toISOString()
    };
  } catch (err) {
    throw new Error(`Failed to get bucket stats: ${err.message}`);
  }
};

// Export the main clients
export { pool as db, s3, bucketName };
export default { 
  db: pool, 
  s3, 
  bucketName, 
  upload, 
  uploadToS3, 
  deleteFromS3, 
  moveFileInS3,
  listS3Files,
  getSignedUrl,
  getFileMetadata,
  categorizeFile,
  createFolderPath,
  getBucketStats,
  query,
  getClient,
  initializeConnections,
  closeConnections
};