var app = require('express')();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);

var path = require('path');
var root = path.resolve(__dirname, '../');

app.get('/', function(req, res){
  res.sendFile(path.join(root, 'client/index.html'));
});

app.get('/bundle.js', function(req, res) {
  res.sendFile(path.join(root, 'client/bundle.js'));
});

var chatServer = require('./chat-server');
new chatServer(io).run();

httpServer.listen(3000, function(){
  console.log('listening on *:3000');
});
