var config = require('./config')
app        = require('http').createServer(handler).listen(config.port)
io         = require('socket.io').listen(app)
path       = require('path')
fs         = require('fs')
mysql      = require('./mysql')
file       = "/index.html"
counter    = 0

db = mysql.connect(config.host, config.database, config.username, config.password)

/**
* The function used by node.js to handle a request
*/
function handler(request, response) {
	var filePath = '.' + request.url
	extname      = path.extname(filePath)
	contentType  = 'text/html'
	// Special cases
	switch (filePath) {
		case './':
			filePath = './index.html'
		break;
		case './supersecretfunction':
			counter = 0
			filePath = './index.html'
			console.log("Counter reset.")
		break;
	}
	// Static files
    switch (extname) {
        case '.js':
            contentType = 'text/javascript'
        break;
        case '.css':
            contentType = 'text/css'
        break;
    }

	fs.exists(filePath, function(exists) {
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500)
					response.end("Error loading " + filePath)
                } else {
                    response.writeHead(200, {'Content-Type': contentType });
                    response.end(content, 'utf-8')
                }
            });
        } else {
            response.writeHead(404)
            response.end("Couldn't find " + filePath)
        }
    });
}

// io.socket events
io.sockets.on("connection", function(socket) {

	// On client connection, we must send the actual count value and it last update time
	socket.emit("updateval", { val: counter }); // sends to new client
	db.query('select timestamp from updates order by timestamp desc limit 1', function(err, rows) {
		if (err)
			console.log("Error connecting to mysql on select statement.\n" + err)
		else if (rows.length > 0)
			socket.emit("updatetime", { timestamp: rows[0].timestamp });
	});
	
	// Increment event
	socket.on("incr", function(data) {
		socket.broadcast.emit("updateval", { val: counter++ }); // sends to all clients except the new connection
		var timestamp = new Date()
		db.query('insert into updates(timestamp) values(?)', [timestamp], function(err, result) {
			if (err)
				console.log("Error connecting to mysql on insert statement.\n" + err)
			else
				io.sockets.emit("updatetime", { timestamp: timestamp }); // sends to all clients
		});
	});

});

console.log("Server has started.")