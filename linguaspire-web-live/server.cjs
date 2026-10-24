const { serve } = require('@hono/node-server');
const app = require('./app.cjs').default;
serve({fetch:app.fetch,hostname:'0.0.0.0',port:Number(process.env.PORT || 8080)}, info => {
  console.log('LinguaSpire Web 2.9.1 listening on ' + info.port);
});
