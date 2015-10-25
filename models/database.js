var pg = require('pg');
var connectionString = process.env.DATABASE_URL;

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('CREATE TABLE leaderboard(id SERIAL PRIMARY KEY, name VARCHAR(40) not null, score NUMERIC(10))');
query.on('end', function() { client.end(); });