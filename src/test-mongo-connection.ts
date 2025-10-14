import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from './config/config';

dotenv.config();

async function testMongoConnection() {
  try {
    console.log('Testing MongoDB connection with improved URL handling...');
    console.log(`Using username: ${config.superAdmin.username || 'undefined'}`);
    console.log(`Original host: ${config.db.host || 'undefined'}`);
    
    // Handle potential undefined values
    if (!config.db.host || !config.db.port || !config.db.database) {
      console.error('✗ Missing database configuration!');
      console.log(`Host: ${config.db.host}`);
      console.log(`Port: ${config.db.port}`);
      console.log(`Database: ${config.db.database}`);
      return;
    }
    
    // Remove 'mongodb://' prefix if present
    const hostWithoutPrefix = config.db.host.replace('mongodb://', '');
    console.log(`Host without prefix: ${hostWithoutPrefix}`);
    
    // Try connecting with auth using the corrected URL format
    const authMongoUrl = `mongodb://${config.superAdmin.username || ''}:${config.superAdmin.password || ''}@${hostWithoutPrefix}:${config.db.port}/${config.db.database}?authSource=admin`;
    console.log(`Auth connection string: mongodb://${config.superAdmin.username || ''}:******@${hostWithoutPrefix}:${config.db.port}/${config.db.database}?authSource=admin`);
    
    try {
      await mongoose.connect(authMongoUrl);
      console.log('✓ Authentication connection successful!');
      await mongoose.disconnect();
    } catch (authError) {
      console.error('✗ Authentication connection failed:', authError.message);
      
      // Try connecting without auth as fallback
      console.log('\nTrying connection without authentication...');
      const noAuthMongoUrl = `${config.db.host}:${config.db.port}/${config.db.database}`;
      console.log(`No-auth connection string: ${noAuthMongoUrl}`);
      
      try {
        await mongoose.connect(noAuthMongoUrl);
        console.log('✓ No-auth connection successful!');
        console.log('MongoDB is likely running without authentication enabled.');
        await mongoose.disconnect();
      } catch (noAuthError) {
        console.error('✗ No-auth connection also failed:', noAuthError.message);
        console.log('Please check your MongoDB server status and configuration.');
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testMongoConnection();