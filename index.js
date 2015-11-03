var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var encryption = require('./lib/encryption');
var db = require('./models/database');

var debug = true;

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(request, response){
  response.send('<h1>Game Services</h1>');
});

app.post('/', function(request, response)
{
  var data = request.body;
  if(!debug)
  {
    data = encryption.decrypt(data);
  }
  
  var name = request.body.name;
  var score = request.body.score;
  
  //db.createLeaderboard();
  db.postScore(name, score, function(id){
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify({id : id}));
  });

});

http.listen(process.env.PORT, function(){
  console.log('listening on *:'+process.env.PORT);
});