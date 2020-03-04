var http = require('http');

const app = require('./src/app');

const server = app.listen(process.env.PORT, function () {

  const {address:host, port} = server.address();

  console.log("App ready at http://%s:%s", host, port);
})