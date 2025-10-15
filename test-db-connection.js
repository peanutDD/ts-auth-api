// 简单的MongoDB连接测试脚本
const { MongoClient } = require('mongodb');

// 默认连接字符串
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function testConnection() {
  try {
    console.log('正在连接到MongoDB...');
    await client.connect();
    console.log('✅ MongoDB连接成功！');
    
    // 列出所有数据库
    const databasesList = await client.db().admin().listDatabases();
    console.log('\n可用的数据库:');
    databasesList.databases.forEach(db => {
      console.log(` - ${db.name}`);
    });
    
    // 尝试访问项目数据库
    const db = client.db('ts-auth-api');
    console.log('\n成功访问 ts-auth-api 数据库');
    
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error.message);
  } finally {
    await client.close();
    console.log('\n连接已关闭');
  }
}

testConnection();