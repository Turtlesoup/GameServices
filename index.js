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

app.post('/leaderboard', function(request, response)
{
  var data = request.body;
  if(!debug)
  {
    data = encryption.decrypt(data);
  }
  
  db.getLeaderboard(data.id, data.limit, function(rows){
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify({entries : rows}));
  });
});

app.post('/postscore', function(request, response)
{
  var data = request.body;
  if(!debug)
  {
    data = encryption.decrypt(data);
  }

  db.postScore(data.name, data.score, function(id){
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify({id : id}));
  });
});

app.post('/topleaderboard', function(request, response)
{
  var data = request.body;
  if(!debug)
  {
    data = encryption.decrypt(data);
  }
  
  db.getTopLeaderboard(data.num, function(rows){
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify({entries : rows}));
  });
});



http.listen(process.env.PORT, function(){
  console.log('listening on *:'+process.env.PORT);
});