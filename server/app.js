var express = require('express');
var app = express();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);

var path = require('path');
var root = path.resolve(__dirname, '..');

app.use(express.static(path.join(root, 'public')));

var Chat = require('./chat');

var chatApp = new Chat(io);

chatApp.run();

httpServer.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
