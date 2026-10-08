'use strict';

require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const deleteExpiredOtp = require('./cron/deleteExpiredOtps');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    const app = require('./app');

    const server = http.createServer(app);
    // Keep idle connections open longer than the Next.js proxy's keep-alive pool,
    // so the proxy never reuses a socket the API is closing ("fetch failed").
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          
          const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
          
          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Socket.io CORS blocked: ' + origin));
          }
        },
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    deleteExpiredOtp.start();

    app.set('io', io);

    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
})();