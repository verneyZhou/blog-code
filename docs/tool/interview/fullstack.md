---
title: 前端全栈开发面试题收集
date: 2025-06-19 10:24:04
permalink: false
article: false
categories:
  - null
tags:
  - null
---

# 前端全栈开发面试题收集

## 基础理论部分

### Node.js 核心概念

**什么是Node.js？它解决了什么问题？**

Node.js是一个基于Chrome V8引擎的JavaScript运行时环境，让JavaScript能够在服务器端运行。

核心特点：
1. **单线程事件循环**：主线程是单线程的，通过事件循环处理异步操作
2. **非阻塞I/O**：所有I/O操作都是异步的，不会阻塞主线程
3. **跨平台**：可以在Windows、Linux、macOS等平台运行
4. **NPM生态**：拥有世界上最大的开源库生态系统

解决的问题：
- **统一开发语言**：前后端都使用JavaScript，降低学习成本
- **高并发处理**：通过事件驱动模型处理大量并发连接
- **快速开发**：丰富的NPM包和简洁的API设计
- **实时应用**：天然支持WebSocket等实时通信协议

**Node.js的事件循环机制是什么？**

```javascript
// 事件循环的六个阶段
const phases = {
  // 1. Timer阶段：执行setTimeout和setInterval的回调
  timers: () => {
    setTimeout(() => console.log('timer'), 0);
    setInterval(() => console.log('interval'), 1000);
  },
  
  // 2. Pending callbacks阶段：执行延迟到下一个循环迭代的I/O回调
  pendingCallbacks: () => {
    // 系统相关的回调，如TCP错误
  },
  
  // 3. Idle, prepare阶段：仅系统内部使用
  
  // 4. Poll阶段：获取新的I/O事件，执行与I/O相关的回调
  poll: () => {
    const fs = require('fs');
    fs.readFile('file.txt', (err, data) => {
      console.log('file read');
    });
  },
  
  // 5. Check阶段：执行setImmediate回调
  check: () => {
    setImmediate(() => console.log('immediate'));
  },
  
  // 6. Close callbacks阶段：执行关闭的回调函数
  closeCallbacks: () => {
    const server = require('http').createServer();
    server.on('close', () => console.log('server closed'));
  }
};

// 微任务队列优先级更高
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));

// 执行顺序：nextTick -> promise -> timer -> immediate
```

**Node.js与传统后端语言的优劣对比？**

| 对比维度 | Node.js | 传统后端(Java/C#/PHP) |
|---------|---------|----------------------|
| **并发模型** | 事件驱动，单线程+事件循环 | 多线程，每个请求一个线程 |
| **内存占用** | 低，单进程处理多请求 | 高，多线程占用更多内存 |
| **I/O处理** | 非阻塞I/O，适合I/O密集型 | 阻塞I/O，适合CPU密集型 |
| **开发效率** | 高，前后端统一语言 | 中等，需要不同技术栈 |
| **生态系统** | NPM包丰富，更新快 | 成熟稳定，企业级支持好 |
| **性能表现** | 高并发下表现优秀 | CPU密集型任务性能更好 |
| **学习成本** | 低，前端开发者易上手 | 高，需要学习新语言 |
| **错误处理** | 单线程，一个错误可能崩溃 | 多线程隔离，错误影响小 |

```javascript
// Node.js优势场景示例
const express = require('express');
const app = express();

// 处理大量并发请求
app.get('/api/users', async (req, res) => {
  // 非阻塞数据库查询
  const users = await db.users.findMany();
  res.json(users);
});

// 实时通信
const io = require('socket.io')(server);
io.on('connection', (socket) => {
  socket.on('message', (data) => {
    // 实时广播消息
    io.emit('message', data);
  });
});

// 流处理
const fs = require('fs');
const readStream = fs.createReadStream('large-file.txt');
readStream.pipe(res); // 流式传输大文件
```

## 框架原理部分

### Express框架

**Express的核心原理是什么？**

Express是一个基于Node.js的极简Web应用框架，核心原理包括：

```javascript
// 1. 中间件机制
class Express {
  constructor() {
    this.middlewares = [];
  }
  
  // 注册中间件
  use(middleware) {
    this.middlewares.push(middleware);
  }
  
  // 处理请求
  handle(req, res) {
    let index = 0;
    
    const next = (err) => {
      if (err) {
        // 错误处理
        return this.handleError(err, req, res);
      }
      
      if (index >= this.middlewares.length) {
        return res.end('Not Found');
      }
      
      const middleware = this.middlewares[index++];
      try {
        middleware(req, res, next);
      } catch (error) {
        next(error);
      }
    };
    
    next();
  }
}

// 2. 路由系统
class Router {
  constructor() {
    this.routes = [];
  }
  
  get(path, handler) {
    this.routes.push({
      method: 'GET',
      path: this.pathToRegex(path),
      handler
    });
  }
  
  pathToRegex(path) {
    // 将路径转换为正则表达式
    return new RegExp('^' + path.replace(/:\w+/g, '([^/]+)') + '$');
  }
  
  match(method, url) {
    return this.routes.find(route => 
      route.method === method && route.path.test(url)
    );
  }
}

// 3. 请求响应增强
function enhanceReqRes(req, res) {
  // 增强request对象
  req.query = parseQuery(req.url);
  req.params = {};
  
  // 增强response对象
  res.json = function(data) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
  };
  
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
}
```

**Express中间件的执行顺序？**

```javascript
const express = require('express');
const app = express();

// 1. 全局中间件（按注册顺序执行）
app.use((req, res, next) => {
  console.log('Global middleware 1');
  next();
});

app.use((req, res, next) => {
  console.log('Global middleware 2');
  next();
});

// 2. 路由级中间件
app.use('/api', (req, res, next) => {
  console.log('Route middleware');
  next();
});

// 3. 路由处理器
app.get('/api/users', 
  // 路由特定中间件
  (req, res, next) => {
    console.log('Route specific middleware');
    next();
  },
  // 最终处理器
  (req, res) => {
    console.log('Final handler');
    res.json({ users: [] });
  }
);

// 4. 错误处理中间件（必须有4个参数）
app.use((err, req, res, next) => {
  console.error('Error middleware:', err.message);
  res.status(500).json({ error: err.message });
});

// 执行顺序：
// Global middleware 1 -> Global middleware 2 -> Route middleware -> Route specific middleware -> Final handler
```

### Koa框架

**Koa的洋葱模型是什么？**

Koa的洋葱模型是指中间件的执行方式像洋葱一样，从外层到内层，再从内层到外层：

```javascript
// Koa洋葱模型实现原理
class Koa {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
  }
  
  // 核心：compose函数实现洋葱模型
  compose(middlewares) {
    return function(context, next) {
      let index = -1;
      
      function dispatch(i) {
        if (i <= index) {
          return Promise.reject(new Error('next() called multiple times'));
        }
        
        index = i;
        let fn = middlewares[i];
        
        if (i === middlewares.length) {
          fn = next;
        }
        
        if (!fn) {
          return Promise.resolve();
        }
        
        try {
          // 关键：将下一个中间件作为next参数传入
          return Promise.resolve(fn(context, () => dispatch(i + 1)));
        } catch (err) {
          return Promise.reject(err);
        }
      }
      
      return dispatch(0);
    };
  }
}

// 洋葱模型示例
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  console.log('1. 外层中间件开始');
  await next(); // 等待内层中间件执行完成
  console.log('6. 外层中间件结束');
});

app.use(async (ctx, next) => {
  console.log('2. 中间层中间件开始');
  await next();
  console.log('5. 中间层中间件结束');
});

app.use(async (ctx, next) => {
  console.log('3. 内层中间件开始');
  ctx.body = 'Hello World';
  console.log('4. 内层中间件结束');
});

// 执行顺序：1 -> 2 -> 3 -> 4 -> 5 -> 6
// 这就是洋葱模型：先进后出
```

**Koa与Express的区别？**

```javascript
// Express vs Koa 对比

// 1. 错误处理
// Express
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

// Koa
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

// 2. 异步处理
// Express（回调地狱）
app.get('/users', (req, res, next) => {
  db.getUsers((err, users) => {
    if (err) return next(err);
    res.json(users);
  });
});

// Koa（async/await）
app.use(async (ctx, next) => {
  if (ctx.path === '/users') {
    try {
      const users = await db.getUsers();
      ctx.body = users;
    } catch (err) {
      throw err;
    }
  }
});

// 3. 上下文对象
// Express
app.get('/api', (req, res) => {
  const userAgent = req.get('User-Agent');
  res.set('X-Response-Time', '100ms');
  res.json({ message: 'Hello' });
});

// Koa
app.use(async (ctx) => {
  const userAgent = ctx.get('User-Agent');
  ctx.set('X-Response-Time', '100ms');
  ctx.body = { message: 'Hello' };
});
```

## 性能优化部分

### 高并发处理

**Node.js如何处理高并发？**

```javascript
// 1. 事件驱动架构
const EventEmitter = require('events');

class ConnectionPool extends EventEmitter {
  constructor(maxConnections = 1000) {
    super();
    this.maxConnections = maxConnections;
    this.activeConnections = 0;
    this.waitingQueue = [];
  }
  
  async getConnection() {
    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      return this.createConnection();
    }
    
    // 连接池满了，加入等待队列
    return new Promise((resolve) => {
      this.waitingQueue.push(resolve);
    });
  }
  
  releaseConnection(connection) {
    this.activeConnections--;
    connection.destroy();
    
    // 处理等待队列
    if (this.waitingQueue.length > 0) {
      const resolve = this.waitingQueue.shift();
      this.activeConnections++;
      resolve(this.createConnection());
    }
  }
  
  createConnection() {
    return {
      id: Math.random().toString(36),
      destroy: () => console.log('Connection destroyed')
    };
  }
}

// 2. 集群模式
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  
  // 创建工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // 重启死掉的进程
  });
} else {
  // 工作进程
  const express = require('express');
  const app = express();
  
  app.get('/', (req, res) => {
    res.send(`Hello from worker ${process.pid}`);
  });
  
  app.listen(3000, () => {
    console.log(`Worker ${process.pid} started`);
  });
}

// 3. 流处理大数据
const fs = require('fs');
const { Transform } = require('stream');

// 处理大文件而不占用大量内存
const processLargeFile = () => {
  const readStream = fs.createReadStream('large-file.csv');
  const writeStream = fs.createWriteStream('processed-file.csv');
  
  const transformStream = new Transform({
    transform(chunk, encoding, callback) {
      // 逐块处理数据
      const processed = chunk.toString().toUpperCase();
      callback(null, processed);
    }
  });
  
  readStream
    .pipe(transformStream)
    .pipe(writeStream)
    .on('finish', () => {
      console.log('File processed successfully');
    });
};
```

**Node.js适合什么场景？不适合什么场景？**

```javascript
// 适合的场景

// 1. I/O密集型应用
const express = require('express');
const app = express();

// API网关
app.get('/api/aggregate', async (req, res) => {
  const [users, orders, products] = await Promise.all([
    fetch('http://user-service/users'),
    fetch('http://order-service/orders'),
    fetch('http://product-service/products')
  ]);
  
  res.json({
    users: await users.json(),
    orders: await orders.json(),
    products: await products.json()
  });
});

// 2. 实时应用
const io = require('socket.io')(server);
const redis = require('redis');
const client = redis.createClient();

io.on('connection', (socket) => {
  // 聊天室
  socket.on('join-room', (room) => {
    socket.join(room);
  });
  
  socket.on('message', async (data) => {
    // 消息持久化
    await client.lpush(`messages:${data.room}`, JSON.stringify(data));
    // 实时广播
    io.to(data.room).emit('message', data);
  });
});

// 3. 微服务架构
const microservice = {
  // 用户服务
  userService: express().get('/users/:id', async (req, res) => {
    const user = await db.users.findById(req.params.id);
    res.json(user);
  }),
  
  // 订单服务
  orderService: express().post('/orders', async (req, res) => {
    const order = await db.orders.create(req.body);
    // 发布事件
    eventBus.emit('order.created', order);
    res.json(order);
  })
};

// 不适合的场景

// 1. CPU密集型任务（会阻塞事件循环）
// ❌ 错误做法
app.get('/fibonacci', (req, res) => {
  const n = parseInt(req.query.n);
  const result = fibonacci(n); // 同步计算，阻塞事件循环
  res.json({ result });
});

// ✅ 正确做法：使用Worker Threads
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  app.get('/fibonacci', (req, res) => {
    const n = parseInt(req.query.n);
    const worker = new Worker(__filename, { workerData: { n } });
    
    worker.on('message', (result) => {
      res.json({ result });
    });
    
    worker.on('error', (error) => {
      res.status(500).json({ error: error.message });
    });
  });
} else {
  // Worker线程中执行CPU密集型任务
  const result = fibonacci(workerData.n);
  parentPort.postMessage(result);
}
```

### 内存管理与优化

**Node.js内存泄漏如何排查和解决？**

```javascript
// 1. 内存监控
const v8 = require('v8');
const process = require('process');

class MemoryMonitor {
  static getMemoryUsage() {
    const usage = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();
    
    return {
      // 进程内存使用
      rss: Math.round(usage.rss / 1024 / 1024) + 'MB', // 常驻内存
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB', // 堆总大小
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB', // 堆使用大小
      external: Math.round(usage.external / 1024 / 1024) + 'MB', // 外部内存
      
      // V8堆统计
      totalHeapSize: Math.round(heapStats.total_heap_size / 1024 / 1024) + 'MB',
      usedHeapSize: Math.round(heapStats.used_heap_size / 1024 / 1024) + 'MB',
      heapSizeLimit: Math.round(heapStats.heap_size_limit / 1024 / 1024) + 'MB'
    };
  }
  
  static startMonitoring(interval = 5000) {
    setInterval(() => {
      const usage = this.getMemoryUsage();
      console.log('Memory Usage:', usage);
      
      // 内存使用超过阈值时告警
      const heapUsedMB = parseInt(usage.heapUsed);
      if (heapUsedMB > 500) {
        console.warn('High memory usage detected:', heapUsedMB + 'MB');
        // 触发垃圾回收
        if (global.gc) {
          global.gc();
        }
      }
    }, interval);
  }
}

// 2. 常见内存泄漏场景及解决方案

// ❌ 场景1：全局变量累积
let globalCache = {}; // 全局缓存不断增长

app.get('/cache/:key', (req, res) => {
  globalCache[req.params.key] = req.body; // 内存泄漏
  res.json({ success: true });
});

// ✅ 解决方案：使用LRU缓存
const LRU = require('lru-cache');
const cache = new LRU({
  max: 1000, // 最大缓存数量
  ttl: 1000 * 60 * 10 // 10分钟过期
});

app.get('/cache/:key', (req, res) => {
  cache.set(req.params.key, req.body);
  res.json({ success: true });
});

// ❌ 场景2：事件监听器未清理
class DataProcessor extends EventEmitter {
  constructor() {
    super();
    this.timer = setInterval(() => {
      this.emit('data', new Date());
    }, 1000);
  }
  
  // 忘记清理定时器和事件监听器
}

// ✅ 解决方案：正确清理资源
class DataProcessor extends EventEmitter {
  constructor() {
    super();
    this.timer = setInterval(() => {
      this.emit('data', new Date());
    }, 1000);
  }
  
  destroy() {
    clearInterval(this.timer);
    this.removeAllListeners();
  }
}

// ❌ 场景3：闭包引用
function createHandler() {
  const largeData = new Array(1000000).fill('data'); // 大对象
  
  return function(req, res) {
    // 闭包持有largeData引用，即使不使用也不会被回收
    res.json({ message: 'Hello' });
  };
}

// ✅ 解决方案：避免不必要的闭包引用
function createHandler() {
  return function(req, res) {
    res.json({ message: 'Hello' });
  };
}

// 3. 内存泄漏检测工具
const heapdump = require('heapdump');

// 生成堆快照
app.get('/heapdump', (req, res) => {
  const filename = `heapdump-${Date.now()}.heapsnapshot`;
  heapdump.writeSnapshot(filename, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ filename });
    }
  });
});
```

## 数据库与ORM部分

### 数据库连接与优化

**Node.js中如何优化数据库连接？**

```javascript
// 1. 连接池管理
const mysql = require('mysql2/promise');

class DatabasePool {
  constructor(config) {
    this.pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      // 连接池配置
      connectionLimit: 10, // 最大连接数
      queueLimit: 0, // 队列限制
      acquireTimeout: 60000, // 获取连接超时时间
      timeout: 60000, // 查询超时时间
      reconnect: true, // 自动重连
      // 连接保活
      keepAliveInitialDelay: 0,
      enableKeepAlive: true
    });
    
    // 监听连接池事件
    this.pool.on('connection', (connection) => {
      console.log('New connection established:', connection.threadId);
    });
    
    this.pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }
  
  async query(sql, params) {
    const start = Date.now();
    try {
      const [rows] = await this.pool.execute(sql, params);
      const duration = Date.now() - start;
      
      // 慢查询日志
      if (duration > 1000) {
        console.warn(`Slow query detected: ${sql}, Duration: ${duration}ms`);
      }
      
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
  
  async transaction(callback) {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  async close() {
    await this.pool.end();
  }
}

// 2. 查询优化
class UserService {
  constructor(db) {
    this.db = db;
    this.cache = new Map();
  }
  
  // 批量查询优化
  async getUsersByIds(ids) {
    if (ids.length === 0) return [];
    
    // 检查缓存
    const cached = [];
    const uncachedIds = [];
    
    for (const id of ids) {
      const cachedUser = this.cache.get(`user:${id}`);
      if (cachedUser) {
        cached.push(cachedUser);
      } else {
        uncachedIds.push(id);
      }
    }
    
    // 批量查询未缓存的数据
    let uncachedUsers = [];
    if (uncachedIds.length > 0) {
      const placeholders = uncachedIds.map(() => '?').join(',');
      const sql = `SELECT * FROM users WHERE id IN (${placeholders})`;
      uncachedUsers = await this.db.query(sql, uncachedIds);
      
      // 更新缓存
      uncachedUsers.forEach(user => {
        this.cache.set(`user:${user.id}`, user);
      });
    }
    
    return [...cached, ...uncachedUsers];
  }
  
  // 分页查询优化
  async getUsersWithPagination(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    
    // 构建动态查询
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (filters.name) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }
    
    if (filters.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }
    
    // 使用索引优化的查询
    const sql = `
      SELECT id, name, email, status, created_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    
    const [users, [{ total }]] = await Promise.all([
      this.db.query(sql, params),
      this.db.query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params.slice(0, -2))
    ]);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

// 3. ORM优化（以Sequelize为例）
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  database: 'myapp',
  username: 'user',
  password: 'password',
  // 连接池配置
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // 查询日志
  logging: (sql, timing) => {
    if (timing > 1000) {
      console.warn(`Slow query: ${sql} (${timing}ms)`);
    }
  },
  // 基准测试
  benchmark: true
});

// 模型定义
const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  status: DataTypes.ENUM('active', 'inactive')
}, {
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

// 查询优化
class UserRepository {
  // N+1问题解决
  async getUsersWithPosts() {
    return User.findAll({
      include: [{
        model: Post,
        as: 'posts'
      }],
      // 预加载关联数据
      subQuery: false
    });
  }
  
  // 选择性字段查询
  async getUserSummary() {
    return User.findAll({
      attributes: ['id', 'name', 'email'], // 只查询需要的字段
      where: {
        status: 'active'
      },
      order: [['created_at', 'DESC']],
      limit: 100
    });
  }
  
  // 原生SQL优化复杂查询
  async getActiveUserStats() {
    const [results] = await sequelize.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as user_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    
    return results;
  }
}
```

## 安全与认证部分

### 身份认证与授权

**JWT认证的实现原理？**

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
    this.refreshTokens = new Map(); // 生产环境应使用Redis
  }
  
  // 生成JWT Token
  generateTokens(payload) {
    const accessToken = jwt.sign(
      payload,
      this.jwtSecret,
      { 
        expiresIn: '15m', // 访问令牌短期有效
        issuer: 'myapp',
        audience: 'myapp-users'
      }
    );
    
    const refreshToken = jwt.sign(
      { userId: payload.userId },
      this.jwtSecret,
      { 
        expiresIn: '7d', // 刷新令牌长期有效
        issuer: 'myapp'
      }
    );
    
    // 存储刷新令牌
    this.refreshTokens.set(refreshToken, {
      userId: payload.userId,
      createdAt: new Date()
    });
    
    return { accessToken, refreshToken };
  }
  
  // 验证JWT Token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }
  
  // 刷新访问令牌
  async refreshAccessToken(refreshToken) {
    if (!this.refreshTokens.has(refreshToken)) {
      throw new Error('Invalid refresh token');
    }
    
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // 生成新的访问令牌
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        this.jwtSecret,
        { expiresIn: '15m' }
      );
      
      return newAccessToken;
    } catch (error) {
      this.refreshTokens.delete(refreshToken);
      throw new Error('Invalid refresh token');
    }
  }
  
  // 登录
  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }
    
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // 记录登录日志
    await LoginLog.create({
      userId: user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      loginAt: new Date()
    });
    
    return tokens;
  }
  
  // 登出
  async logout(refreshToken) {
    this.refreshTokens.delete(refreshToken);
  }
}

// JWT中间件
const authMiddleware = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);
      
      // 检查用户是否存在
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // 角色权限检查
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };
};

// 使用示例
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json(tokens);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/profile', authMiddleware(), (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/admin', authMiddleware('admin'), (req, res) => {
  res.json({ message: 'Admin only content' });
});
```

### 安全防护

**Node.js应用如何防范常见安全威胁？**

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const xss = require('xss');

// 1. 安全头设置
app.use(helmet({
  // 内容安全策略
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  // 防止点击劫持
  frameguard: { action: 'deny' },
  // 防止MIME类型嗅探
  noSniff: true,
  // 强制HTTPS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 2. 速率限制
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    // 自定义键生成器
    keyGenerator: (req) => {
      return req.ip + ':' + req.path;
    },
    // 跳过成功请求
    skipSuccessfulRequests: true
  });
};

// 不同接口不同限制
app.use('/api/auth/login', createRateLimit(15 * 60 * 1000, 5, 'Too many login attempts'));
app.use('/api/auth/register', createRateLimit(60 * 60 * 1000, 3, 'Too many registration attempts'));
app.use('/api/', createRateLimit(15 * 60 * 1000, 100, 'Too many requests'));

// 3. 输入验证和清理
class InputValidator {
  static validateEmail(email) {
    if (!email || !validator.isEmail(email)) {
      throw new Error('Invalid email format');
    }
    return validator.normalizeEmail(email);
  }
  
  static validatePassword(password) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    if (!validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })) {
      throw new Error('Password must contain uppercase, lowercase, number and symbol');
    }
    
    return password;
  }
  
  static sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    // XSS防护
    return xss(input, {
      whiteList: {}, // 不允许任何HTML标签
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  
  static validateObjectId(id) {
    if (!validator.isMongoId(id)) {
      throw new Error('Invalid ID format');
    }
    return id;
  }
}

// 4. SQL注入防护
class SecureDatabase {
  constructor(pool) {
    this.pool = pool;
  }
  
  // 使用参数化查询
  async findUser(email) {
    // ✅ 安全的查询
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await this.pool.execute(sql, [email]);
    return rows[0];
  }
  
  // 动态查询构建
  async searchUsers(filters) {
    const allowedFields = ['name', 'email', 'status'];
    const conditions = [];
    const params = [];
    
    Object.keys(filters).forEach(key => {
      if (allowedFields.includes(key) && filters[key]) {
        conditions.push(`${key} LIKE ?`);
        params.push(`%${filters[key]}%`);
      }
    });
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT id, name, email, status FROM users ${whereClause} ORDER BY created_at DESC LIMIT 100`;
    
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }
}

// 5. 文件上传安全
const multer = require('multer');
const path = require('path');

const fileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      // 生成安全的文件名
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    // 文件类型白名单
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
    files: 5 // 最多5个文件
  }
});

// 6. 错误处理（避免信息泄露）
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // 生产环境不暴露详细错误信息
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      requestId: req.id // 用于日志追踪
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
};

app.use(errorHandler);
```

## 测试与部署部分

### 单元测试与集成测试

**Node.js应用如何进行测试？**

```javascript
// 1. 单元测试（使用Jest）
// userService.test.js
const UserService = require('../services/UserService');
const User = require('../models/User');

// Mock数据库模型
jest.mock('../models/User');

describe('UserService', () => {
  let userService;
  
  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });
  
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const mockUser = { id: 1, ...userData };
      User.create.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });
    
    it('should throw error when email already exists', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      User.create.mockRejectedValue(new Error('Email already exists'));
      
      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('Email already exists');
    });
  });
  
  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 1;
      const mockUser = { id: userId, name: 'John Doe' };
      User.findById.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
    
    it('should return null when user not found', async () => {
      // Arrange
      const userId = 999;
      User.findById.mockResolvedValue(null);
      
      // Act
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(result).toBeNull();
    });
  });
});

// 2. 集成测试
// api.test.js
const request = require('supertest');
const app = require('../app');
const db = require('../database');

describe('User API', () => {
  beforeAll(async () => {
    // 连接测试数据库
    await db.connect(process.env.TEST_DATABASE_URL);
  });
  
  afterAll(async () => {
    // 清理并关闭数据库连接
    await db.cleanup();
    await db.close();
  });
  
  beforeEach(async () => {
    // 每个测试前清理数据
    await db.clearTables(['users']);
  });
  
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        name: userData.name,
        email: userData.email
      });
      
      // 验证密码不在响应中
      expect(response.body.password).toBeUndefined();
      
      // 验证数据库中的数据
      const userInDb = await db.query('SELECT * FROM users WHERE email = ?', [userData.email]);
      expect(userInDb).toHaveLength(1);
    });
    
    it('should return 400 for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123!'
      };
      
      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);
      
      expect(response.body.error).toContain('Invalid email');
    });
  });
  
  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      // 先创建一个用户
      const user = await db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?) RETURNING *',
        ['John Doe', 'john@example.com', 'hashedpassword']
      );
      
      const response = await request(app)
        .get(`/api/users/${user[0].id}`)
        .expect(200);
      
      expect(response.body).toMatchObject({
        id: user[0].id,
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
    
    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect(404);
      
      expect(response.body.error).toBe('User not found');
    });
  });
});

// 3. 端到端测试（使用Playwright）
// e2e/user-registration.spec.js
const { test, expect } = require('@playwright/test');

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 清理测试数据
    await page.request.delete('/api/test/cleanup');
  });
  
  test('should register a new user successfully', async ({ page }) => {
    // 访问注册页面
    await page.goto('/register');
    
    // 填写表单
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    
    // 提交表单
    await page.click('[data-testid="submit-button"]');
    
    // 验证成功消息
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Registration successful');
    
    // 验证重定向到登录页面
    await expect(page).toHaveURL('/login');
  });
  
  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/register');
    
    // 提交空表单
    await page.click('[data-testid="submit-button"]');
    
    // 验证错误消息
    await expect(page.locator('[data-testid="name-error"]'))
      .toContainText('Name is required');
    await expect(page.locator('[data-testid="email-error"]'))
      .toContainText('Email is required');
    await expect(page.locator('[data-testid="password-error"]'))
      .toContainText('Password is required');
  });
});

// 4. 性能测试
// performance.test.js
const autocannon = require('autocannon');
const app = require('../app');

describe('Performance Tests', () => {
  let server;
  
  beforeAll((done) => {
    server = app.listen(0, done);
  });
  
  afterAll((done) => {
    server.close(done);
  });
  
  test('API should handle concurrent requests', async () => {
    const result = await autocannon({
      url: `http://localhost:${server.address().port}/api/users`,
      connections: 10,
      duration: 10,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // 验证性能指标
    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.latency.average).toBeLessThan(100); // 平均延迟小于100ms
    expect(result.requests.average).toBeGreaterThan(100); // 每秒处理超过100个请求
  });
});
```

## 总结

这份面试题涵盖了前端全栈开发的核心知识点：

1. **基础理论**：Node.js核心概念、事件循环机制、与传统后端的对比
2. **框架原理**：Express和Koa的实现原理、中间件机制、洋葱模型
3. **性能优化**：高并发处理、内存管理、数据库优化
4. **安全防护**：身份认证、输入验证、常见安全威胁防范
5. **测试部署**：单元测试、集成测试、性能测试

这些问题和答案基于真实的生产环境经验，涵盖了从基础概念到高级实践的各个层面，能够全面考察候选人的Node.js全栈开发能力。特别是对于有丰富前端经验转向全栈开发的工程师，这些知识点能够帮助他们更好地理解后端开发的核心思想和最佳实践。
