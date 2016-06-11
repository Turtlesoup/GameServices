var pg = require('pg');
var connectionString = process.env.DATABASE_URL;

/**
 * Creates a Leaderboard table containing an id, name, and score value for each entry
 */
function createLeaderboard()
{
    var client = new pg.Client(connectionString + '?ssl=true');
    client.connect();
    
    var queryString = 'CREATE TABLE leaderboard(id SERIAL PRIMARY KEY, name VARCHAR(40) not null, score NUMERIC(10))';
    
    var query = client.query(queryString);
    query.on('end', function() { client.end(); });
}

/**
 * @callback postScoreRequestCallback
 * @param {number} id - the id of the submitted score within the Leaderboard table.
 */

/**
 * Posts a score to the Leaderboard table and returns the id of the submitted score.
 * @param {string} name - The name to be associated with the submitted score.
 * @param {number} score - The score value.
 * @param {postScoreRequestCallback} callback - The request callback function.
 */
function postScore(name, score, callback)
{
    var client = new pg.Client(connectionString + '?ssl=true');
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

/**
 * @callback getLeaderboardRequestCallback
 * @param {Object[]} rows - the rows of the Leaderboard table corresponding to the query.
 */

/**
 * Returns the row and neighbouring rows of the ranked Leaderboard table corresponding to the given id.
 * @param {number} id - The id of the leaderboard row to retrieve.
 * @param {number} limit - the limit of the range (above and below) of ranked rows to return along with the row corresponding to the requested id.
 * @param {getLeaderboardRequestCallback} callback - The request callback function.
 */
function getLeaderboard(id, limit, callback)
{
    var client = new pg.Client(connectionString + '?ssl=true');
    client.connect();
    
    var queryString = ' WITH global_rank AS (                                                                       \
                          SELECT *, dense_rank() OVER (ORDER BY score DESC) FROM leaderboard                        \
                        )                                                                                           \
                        SELECT * FROM global_rank                                                                   \
                        WHERE dense_rank <= (select dense_rank from global_rank where id = ' + id + ')+' + limit + '\
                        AND   dense_rank >= (select dense_rank from global_rank where id = ' + id + ')-' + limit; 

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

/**
 * @callback getTopLeaderboardRequestCallback
 * @param {Object[]} rows - the rows of the Leaderboard table corresponding to the query.
 */

/**
 * Returns the top N rows of the ranked Leaderboard table where N is equal to the given parameter.
 * @param {number} num - The number of rows to retrieve.
 * @param {getTopLeaderboardRequestCallback} callback - The request callback function.
 */
function getTopLeaderboard(num, callback)
{
    var client = new pg.Client(connectionString + '?ssl=true');
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
