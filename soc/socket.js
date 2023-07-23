var app = require('../config');
var http = require('http');

var server = http.createServer(app);
var io = require('socket.io')(server);
var inc_count = 0;
io.on( "connection", function( socket ) {
console.log( "a user has connected!" );

socket.on( "disconnect", function() {
console.log( "user disconnected" );
});

socket.on( "inc-event", function( inc_flag ) {
inc_count += inc_flag ? 1: -1;
var f_str = inc_count + ( inc_count == 1 ? " count": " counts");

io.emit( "update-incs", f_str );
});
});