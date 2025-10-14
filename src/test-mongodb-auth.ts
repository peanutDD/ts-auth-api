import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from './config/config';

// 加载环境变量
dotenv.config();

// 配置更详细的日志记录
console.log('=== MongoDB Authentication Test ===');
console.log('Current environment:', process.env.NODE_ENV || 'development');
console.log('Database Configuration:');
console.log('  Host:', config.db.host || 'undefined');
console.log('  Port:', config.db.port || 'undefined');
console.log('  Database:', config.db.database || 'undefined');
console.log('Super Admin Credentials:');
console.log('  Username:', config.superAdmin.username || 'undefined');
console.log('  Password: ******');

// 检查必要的配置是否存在
if (!config.db.host || !config.db.port || !config.db.database) {
  console.error('❌ Error: Missing required database configuration!');
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// 测试连接函数
async function testMongoDBConnection() {
  try {
    // 测试1: 尝试无认证连接
    console.log('\n[Test 1] Trying connection without authentication...');
    let noAuthMongoUrl = '';
    if (config.db.host && config.db.host.startsWith('mongodb://')) {
      noAuthMongoUrl = `${config.db.host}:${config.db.port || '27017'}/${config.db.database}`;
    } else {
      noAuthMongoUrl = `mongodb://${config.db.host}:${config.db.port || '27017'}/${config.db.database}`;
    }
    
    await mongoose.connect(noAuthMongoUrl);
    console.log('✅ Success: Connected without authentication');
    await mongoose.disconnect();
  } catch (noAuthError) {
    console.error('❌ Failed: No-auth connection error:', noAuthError.message);
  }

  try {
    // 测试2: 使用authSource=admin进行认证
    console.log('\n[Test 2] Trying connection with authentication (authSource=admin)...');
    const hostWithoutPrefix = config.db.host && config.db.host.startsWith('mongodb://') 
      ? config.db.host.replace('mongodb://', '') 
      : config.db.host;
    
    const authMongoUrlWithAdminDb = `mongodb://${config.superAdmin.username || ''}:${config.superAdmin.password || ''}@${hostWithoutPrefix || 'localhost'}:${config.db.port || '27017'}/${config.db.database}?authSource=admin`;
    const maskedUrlWithAdminDb = `mongodb://${config.superAdmin.username || ''}:******@${hostWithoutPrefix || 'localhost'}:${config.db.port || '27017'}/${config.db.database}?authSource=admin`;
    
    console.log('Connection URL:', maskedUrlWithAdminDb);
    await mongoose.connect(authMongoUrlWithAdminDb);
    console.log('✅ Success: Connected with authentication (authSource=admin)');
    await mongoose.disconnect();
  } catch (adminDbError) {
    console.error('❌ Failed: Authentication with authSource=admin error:', adminDbError.message);
    if (adminDbError.name === 'MongoSecurityException') {
      console.error('   Details: This indicates an authentication issue with the provided credentials.');
      console.error('   Possible reasons:');
      console.error('   1. The user does not exist in the admin database');
      console.error('   2. The password is incorrect');
      console.error('   3. The user does not have sufficient privileges');
    }
  }

  try {
    // 测试3: 使用目标数据库进行认证（不指定authSource）
    console.log('\n[Test 3] Trying connection with authentication (using target database)...');
    const hostWithoutPrefix = config.db.host && config.db.host.startsWith('mongodb://') 
      ? config.db.host.replace('mongodb://', '') 
      : config.db.host;
    
    const authMongoUrlWithDb = `mongodb://${config.superAdmin.username || ''}:${config.superAdmin.password || ''}@${hostWithoutPrefix || 'localhost'}:${config.db.port || '27017'}/${config.db.database}`;
    const maskedUrlWithDb = `mongodb://${config.superAdmin.username || ''}:******@${hostWithoutPrefix || 'localhost'}:${config.db.port || '27017'}/${config.db.database}`;
    
    console.log('Connection URL:', maskedUrlWithDb);
    await mongoose.connect(authMongoUrlWithDb);
    console.log('✅ Success: Connected with authentication (using target database)');
    await mongoose.disconnect();
  } catch (dbError) {
    console.error('❌ Failed: Authentication with target database error:', dbError.message);
    if (dbError.name === 'MongoSecurityException') {
      console.error('   Details: This indicates an authentication issue with the provided credentials.');
      console.error('   Possible reasons:');
      console.error('   1. The user does not exist in the target database');
      console.error('   2. The password is incorrect');
      console.error('   3. MongoDB authentication is not enabled');
    }
  }

  // 测试4: 列出MongoDB服务器上的所有数据库（需要适当权限）
  try {
    console.log('\n[Test 4] Trying to list all databases (requires admin privileges)...');
    const hostWithoutPrefix = config.db.host && config.db.host.startsWith('mongodb://') 
      ? config.db.host.replace('mongodb://', '') 
      : config.db.host;
    
    const authMongoUrl = `mongodb://${config.superAdmin.username || ''}:${config.superAdmin.password || ''}@${hostWithoutPrefix || 'localhost'}:${config.db.port || '27017'}/admin`;
    await mongoose.connect(authMongoUrl);
    
    // 检查connection.db是否存在
    if (mongoose.connection.db) {
      const adminDb = mongoose.connection.db.admin();
      const databases = await adminDb.listDatabases();
      
      console.log('✅ Success: Connected to admin database');
      console.log('Available databases:', databases.databases.map(db => db.name));
    } else {
      console.log('⚠️ Warning: Connected but unable to access database object');
    }
    
    await mongoose.disconnect();
  } catch (listDbError) {
    console.error('❌ Failed: Error listing databases:', listDbError.message);
  }

  console.log('\n=== Test Completed ===');
  console.log('Summary:');
  if (process.env.MONGODB_URL && process.env.MONGODB_URL.includes('localhost')) {
    console.log('If you are running MongoDB locally, you may need to:');
    console.log('1. Ensure MongoDB authentication is enabled (if required)');
    console.log('2. Create a user with the correct credentials and privileges');
    console.log('3. Verify the authentication database (usually admin or the target database)');
  }
}

// 运行测试
console.log('Starting MongoDB connection tests...');
testMongoDBConnection()
  .catch(err => {
    console.error('Fatal error during tests:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });