import express, { Express, Request, Response, NextFunction } from 'express';

// 创建测试Express应用
const app: Express = express();

// 应用请求体解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加日志中间件查看请求信息
app.use((req, _res, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers['content-type'] || 'No Content-Type');
  console.log('Query Params:', req.query);
  console.log('Body:', req.body);
  console.log('---');
  next();
});

// 测试路由 - 验证请求体解析
app.post('/test-body', (req: Request, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body is empty or not parsed correctly',
      body: req.body,
      tip: 'Make sure to set Content-Type: application/json header'
    });
  }
  return res.json({
    success: true,
    message: 'Request body parsed successfully',
    data: req.body
  });
});

// 模拟登录路由 - 查看req.body问题
app.post('/api/users/login', (req: Request, res: Response) => {
  console.log('Login request received');
  console.log('req.body:', req.body);
  
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      throw new Error('Username or password not provided in request body');
    }
    
    res.json({
      success: true,
      message: 'Login attempt processed',
      username,
      password: '******'
    });
  } catch (error) {
    console.error('Error in login route:', error.message);
    res.status(400).json({
      success: false,
      error: error.message,
      requestBody: req.body,
      tip: 'Use POST with Content-Type: application/json and send data in request body'
    });
  }
});

// 启动服务器
const startServer = async () => {
  try {
    // 不需要连接MongoDB，只测试Express请求处理
    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`\n=== Test Server Started ===`);
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`1. Test endpoint: POST http://localhost:${PORT}/test-body`);
      console.log(`2. Login endpoint: POST http://localhost:${PORT}/api/users/login`);
      console.log(`\nINSTRUCTIONS:`);
      console.log(`- Use a tool like Postman or curl to send POST requests`);
      console.log(`- Make sure to set 'Content-Type: application/json' header`);
      console.log(`- Send data in the request body, NOT as query parameters`);
      console.log(`- Example body: {"username":"testuser","password":"password123"}`);
    });
  } catch (error) {
    console.error('Error starting test server:', error);
  }
};

startServer();