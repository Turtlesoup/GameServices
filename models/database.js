var pg = require('pg');
var connectionString = process.env.DATABASE_URL; //"pg://postgres:postgres@localhost:5432/testdb"

function createLeaderboard()
{
    var client = new pg.Client(connectionString);
    client.connect();
    
    var query = client.query('CREATE TABLE leaderboard(id SERIAL PRIMARY KEY, name VARCHAR(40) not null, score NUMERIC(10))');
    query.on('end', function() { client.end(); });
}

function postScore(name, score, callback)
{
    var client = new pg.Client(connectionString);
    client.connect();
    
    var query = client.query('INSERT INTO leaderboard (id, name, score) VALUES (DEFAULT,\'' + name + '\',\'' + score + '\') RETURNING id', function(err,result)
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

module.exports.createLeaderboard = createLeaderboard;
module.exports.postScore = postScore;
