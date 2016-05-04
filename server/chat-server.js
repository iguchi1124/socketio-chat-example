var _ = require('underscore');

var User = function(params) {
  var self = this;

  self.name = params.name;
  self.socket = params.socket;
}

module.exports = function(io) {
  var self = this;
  self.io = io;
  self.users = [];

  self.run = function() {
    self.io.on('connection', function(socket){
      console.log('a user connected');

      self.handleConnection(socket);

      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
    });
  }

  self.handleConnection = function(socket) {
    socket.on('username', function(name) {
      var nameBad = !name || name.length < 3 || name.length > 15;

      if(nameBad) {
        socket.emit('nameBad', name);
        return;
      }

      var nameExist = _.some(self.users, function(user) {
        return user.name == name;
      });

      if (!nameExist) {
        var newUser = new User({name: name, socket: socket});
        self.users.push(newUser);
        self.broadcastToUsers('userJoined', name);
        self.handleUserConnection(newUser);
      } else {
        socket.emit('nameExist', name);
      }
    });
  }

  self.handleUserConnection = function(user) {
    user.socket.on('disconnect', function(){
      self.users.splice(self.users.indexOf(user), 1);
    });

    user.socket.on('message', function(msg) {
      self.broadcastToUsers('message', { sender: user.name, content: msg })
    });
  }

  self.broadcastToUsers = function(event, obj) {
    _.map(self.users, function(user){
      user.socket.emit(event, obj);
    });
  }
}
