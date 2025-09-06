import { createProxyMiddleware } from 'http-proxy-middleware';
import next from 'next';
import { createServer } from 'http';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '9992', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Handle VNC WebSocket proxy
      if (req.url?.startsWith('/websockify')) {
        const vncProxy = createProxyMiddleware({
          target: process.env.BYTEBOT_DESKTOP_VNC_URL || 'http://localhost:9990',
          ws: true,
          changeOrigin: true,
          pathRewrite: { '^/websockify': '/websockify' },
        });
        return vncProxy(req, res);
      }

      // Handle all other requests with Next.js
      await handle(req, res);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.on('upgrade', (req, socket, head) => {
    if (req.url?.startsWith('/websockify')) {
      const vncProxy = createProxyMiddleware({
        target: process.env.BYTEBOT_DESKTOP_VNC_URL || 'http://localhost:9990',
        ws: true,
        changeOrigin: true,
        pathRewrite: { '^/websockify': '/websockify' },
      });
      vncProxy.upgrade(req, socket as any, head);
    }
  });

  server.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
