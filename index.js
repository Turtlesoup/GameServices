var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var pg = require('pg');

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({extended: true})); 

app.get('/', function(request, response){
  response.send('<h1>Game Services</h1>');
});

app.post('/', function(request, response)
{
  var score = request.body.score;
  console.dir(score);
  
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.end(JSON.stringify({score : score}));
});

http.listen(process.env.PORT, function(){
  console.log('listening on *:'+process.env.PORT);
});