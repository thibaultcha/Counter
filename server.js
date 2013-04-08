/**
 * Counter v1.0.1
 * https://github.com/thibaultCha/Counter
 * License: MIT
 *
 * Copyright (C) 2013 thibaultCha - A simple example of Node.js and Socket.IO
 */

var config = require('./config') // local config.js file
, http     = require('http')
, io       = require('socket.io')
, path     = require('path')
, fs       = require('fs')
, mysql    = require('./mysql')
, counter  = 0

db = mysql.connect(config.DBHOST, config.DBNAME, config.DBUSERNAME, config.DBPASSWORD)

var server = http.createServer(handler).listen(config.PORT) // creates the HTTP server
var sio    = io.listen(server) // socket.io is listening to server

/**
* The function used by `server` to handle a request
*/
function handler (request, response) {
    var filePath  = config.VIEWS + request.url
    , extension   = path.extname(filePath)
    , contentType = 'text/html'
    // Special cases
    switch (filePath) {
        case config.VIEWS + '/':
            filePath = config.VIEWS + '/' + 'index.html'
        break;
        case './supersecretfunction':
            counter = 0;
            filePath = config.VIEWS + '/' + 'index.html'
            console.log("Counter reset.")
        break;
    }
    // Serve static files
    switch (extension) {
        case '.js':
            contentType = 'text/javascript'
        break;
        case '.css':
            contentType = 'text/css'
        break;
    }

    fs.exists(filePath, function (exists) {
        if (exists) {
            fs.readFile(filePath, function (error, content) {
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

// Socket.IO events
sio.sockets.on("connection", function (socket) {

    // On client connection, we must send the actual count value and its last update time
    socket.emit("updateval", { val: counter }); // send to the socket (the new client)
    db.query('select timestamp from updates order by timestamp desc limit 1', function (err, rows) {
        if (err)
            console.log("Error connecting to mysql on select statement.\n" + err)
        else if (rows.length > 0)
            socket.emit("updatetime", { timestamp: rows[0].timestamp });
    });
    
    // Increment event
    socket.on("incr", function (data) {
        socket.broadcast.emit("updateval", { val: counter++ }); // socket is broadcasting to all others sockets
        var timestamp = new Date()
        db.query('insert into updates(timestamp) values(?)', [timestamp], function (err, result) {
            if (err)
                console.log("Error connecting to mysql on insert statement.\n" + err)
            else
                sio.sockets.emit("updatetime", { timestamp: timestamp }); // send to all sockets
        });
    });

}); // sio.sockets.on

console.log("Server running on port %d", config.PORT)
