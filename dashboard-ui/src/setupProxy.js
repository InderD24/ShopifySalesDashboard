const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // proxy /orders → Rails on :3000
  app.use(
    '/orders',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
    })
  );

  // proxy /customers_metric → same backend
  app.use(
    '/customers_metric',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
    })
  );

  // (optional) proxy any other API paths:
  // app.use(
  //   '/api',
  //   createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true })
  // );
};