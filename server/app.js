var app = require('express')();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);

var path = require('path'),
    root = path.resolve(__dirname, '..');

app.get('/', function(req, res){
  res.sendFile(path.join(root, 'public/index.html'));
});

app.get('/bundle.js', function(req, res) {
  res.sendFile(path.join(root, 'public/bundle.js'));
});

var Chat = require('./chat');

chatApp = new Chat(io);
chatApp.run();

httpServer.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});
