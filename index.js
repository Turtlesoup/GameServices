var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
});

http.listen(process.env.PORT, function(){
  console.log('listening on *:'+process.env.PORT);
});