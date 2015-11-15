var pg = require('pg');
var connectionString = process.env.DATABASE_URL;
//var connectionString = "pg://postgres:postgres@localhost:15454/testdb";

function createLeaderboard()
{
    var client = new pg.Client(connectionString);
    client.connect();
    
    var queryString = 'CREATE TABLE leaderboard(id SERIAL PRIMARY KEY, name VARCHAR(40) not null, score NUMERIC(10))';
    
    var query = client.query(queryString);
    query.on('end', function() { client.end(); });
}

function postScore(name, score, callback)
{
    var client = new pg.Client(connectionString);
    client.connect();
    
    var queryString = 'INSERT INTO leaderboard (id, name, score) VALUES (DEFAULT,\'' + name + '\',\'' + score + '\') RETURNING id';
    
    var query = client.query(queryString, function(err, result)
    {
        if (err)
        {
            console.error('Error inserting query', err);
            throw err;
        }
        
        callback(result.rows[0].id);
    });
    
    query.on('row', function(row) {console.log(row);});
    query.on('end', function() {client.end();});
}

function getLeaderboard(id, limit, callback)
{
    var client = new pg.Client(connectionString);
    client.connect();
    
    var queryString1 = 'SELECT * FROM leaderboard WHERE id = ' + id;

    var query1 = client.query(queryString1, function(err, result1)
    {
        if (err)
        {
            console.error('Error inserting query', err);
            throw err;
        }
        
        if(limit > 0)
        {
            var playerScore = parseInt(result1.rows[0].score, 10);
            
            //callback([playerScore]);

            var queryString2 = '(SELECT * FROM leaderboard WHERE score >= '+ playerScore +' ORDER BY score ASC LIMIT '+ limit +') UNION (SELECT * FROM leaderboard WHERE score < '+ playerScore +' ORDER BY score DESC LIMIT '+ (limit - 1) +') ORDER BY score ASC';
            var query2 = client.query(queryString2, function(err, result2)
            {
                if (err)
                {
                    console.error('Error inserting query', err);
                    throw err;
                }
                
                callback(result2.rows);
            });
            query2.on('end', function() {client.end();});
        }
        else
        {
            callback(result1.rows);
        }

    });
}

function getTopLeaderboard(num, callback)
{
    var client = new pg.Client(connectionString);
    client.connect();
    
    var queryString = 'SELECT MAX(score) AS score, name FROM leaderboard GROUP BY name, score ORDER BY score DESC LIMIT '+ num;
    
    var query = client.query(queryString, function(err, result)
    {
        if (err)
        {
            console.error('Error inserting query', err);
            throw err;
        }
        
        callback(result.rows);
    });
    
    query.on('row', function(row) {console.log(row);});
    query.on('end', function() {client.end();});
}

module.exports.createLeaderboard = createLeaderboard;
module.exports.postScore = postScore;
module.exports.getLeaderboard = getLeaderboard;
module.exports.getTopLeaderboard = getTopLeaderboard;
