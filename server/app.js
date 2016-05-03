var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var path = require('path');
var root = path.resolve(__dirname, '..')

app.get('/', function(req, res){
  res.sendFile(path.join(root, 'client/index.html'));
});

app.get('/bundle.js', function(req, res) {
  res.sendFile(path.join(root, 'client/bundle.js'));
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('message', function(msg){
    console.log('message: ' + msg);
    io.emit('message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
