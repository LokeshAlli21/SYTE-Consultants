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

const bucketName = process.env.S3_BUCKET_NAME;

// Test S3 connection
const testS3Connection = async () => {
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log('✅ Connected to AWS S3 bucket successfully');
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Optional: Add file type restrictions
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// S3 helper functions
export const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    return result.Location;
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
  } catch (err) {
    throw new Error(`S3 delete failed: ${err.message}`);
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

// Database helper functions
export const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
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
  
  console.log('✅ All AWS services connected successfully');
  return { dbConnected, s3Connected };
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

// Export the main clients
export { pool as db, s3, bucketName };
export default { 
  db: pool, 
  s3, 
  bucketName, 
  upload, 
  uploadToS3, 
  deleteFromS3, 
  getSignedUrl,
  query,
  getClient,
  initializeConnections,
  closeConnections
};