var mysql = require('mysql')

function connect(host, database, username, password) {
	var connection = mysql.createConnection({
		host     : host,
		database : database,
		user     : username,
		password : password
	});

	connection.query('CREATE TABLE IF NOT EXISTS `updates` (`timestamp` datetime NOT NULL)',
		function(err, rows) {
			if(err)
				console.log("Error connecting to database.\n" + err)
		}
	);

	return connection
}

exports.connect = connect