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
    
    var queryString = ' WITH global_rank AS (                                                            \
                          SELECT *, rank() OVER (ORDER BY score DESC) FROM leaderboard         \
                        )                                                                                \
                        SELECT * FROM global_rank                                                        \
                        WHERE rank <= (select rank from global_rank where id = ' + id + ')+' + limit + ' \
                        AND   rank >= (select rank from global_rank where id = ' + id + ')-' + limit; 

    var query = client.query(queryString, function(err, result)
    {
        if (err)
        {
            console.error('Error inserting query', err);
            throw err;
        }
        
        callback(result.rows);
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
