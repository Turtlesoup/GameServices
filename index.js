var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var encryption = require('./lib/encryption');
var leaderboard = require('./models/leaderboard');

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(request, response){
  response.send('<h1>Game Services</h1>');
});

app.post('/leaderboard', function(request, response)
{
  var data = request.body;
  if(!process.env.DEBUG)
  {
    data = encryption.decrypt(data);
  }
  
  if(data.id && data.limit)
  {
    leaderboard.getLeaderboard(data.id, data.limit, function(rows){
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({entries : rows}));
    });
  }
  else
  {
    response.end(JSON.stringify({error : "invalid parameters"}));
  }
});

app.post('/postscore', function(request, response)
{
  var data = request.body;
  if(!process.env.DEBUG)
  {
    data = encryption.decrypt(data);
  }

  if(data.name && data.score)
  {
    leaderboard.postScore(data.name, data.score, function(id){
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({id : id}));
    });
  }
  else
  {
    response.end(JSON.stringify({error : "invalid parameters"}));
  }
});

app.post('/topleaderboard', function(request, response)
{
  var data = request.body;
  if(!process.env.DEBUG)
  {
    data = encryption.decrypt(data);
  }
  
  if(data.num)
  {
    leaderboard.getTopLeaderboard(data.num, function(rows){
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({entries : rows}));
    });
  }
  else
  {
    response.end(JSON.stringify({error : "invalid parameters"}));
  }
});



http.listen(process.env.PORT, function(){
  console.log('listening on *:'+process.env.PORT);
});