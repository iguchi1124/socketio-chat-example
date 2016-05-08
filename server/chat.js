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
  self.typingUsers = [];

  self.run = function() {
    self.io.on('connection', function(socket){

      self.handleConnection(socket);
    });
  }

  self.handleConnection = function(socket) {
    socket.on('username', function(name) {
      var reg = /^([a-zA-Z0-9]|\_|\-)*$/;

      if(!reg.test(name)) {
        socket.emit('nameHasInvalidChars');
        return;
      }

      var nameLengthInvalid = !name || name.length < 3 || name.length > 15;

      if(nameLengthInvalid) {
        socket.emit('nameLengthInvalid');
        return;
      }

      var nameExist = _.some(self.users, function(user) {
        return user.name == name;
      });

      if (!nameExist) {
        var newUser = new User({name: name, socket: socket});
        self.users.push(newUser);
        self.broadcastToAllUsers('userJoined', name);
        self.handleUserConnection(newUser);
      } else {
        socket.emit('nameExist', name);
      }
    });
  }

  self.handleUserConnection = function(user) {
    self.broadcastToAllUsers('usersNameList', nameList(self.users));
    self.broadcastToAllUsers('typingUsers', nameList(self.typingUsers));

    user.socket.on('disconnect', function(){
      self.users = removeUserFromUsers(self.users, user);
      self.typingUsers = removeUserFromUsers(self.typingUsers, user);

      self.broadcastToAllUsers('userLeft', user.name);
      self.broadcastToAllUsers('usersNameList', nameList(self.users));
      self.broadcastToAllUsers('typingUsers', nameList(self.typingUsers));
    });

    user.socket.on('message', function(msg) {
      var msgReg = /^\s*$/;
      var nameReg = /^([a-zA-Z0-9]|\_|\-)*$/;

      if(msgReg.test(msg)) return;

      var msgParts = msg.split(/\s|\:|\,/);
      var privateListeners = [];

      _.each(msgParts, function(part) {
        if(part.length > 3 && part.length <= 16 && part[0] == '@') {
          var name = part.substr(1);

          if(!nameReg.test(name)) return;

          var u = _.find(self.users, function(i) {
            return i.name == name;
          });

          if(u == null) return;

          var userExist = _.some(privateListeners, function(i) {
            return i.name == u.name;
          });

          if(!userExist) privateListeners.push(u);
        }
      });

      if(privateListeners.length > 0) {
        var senderExistInPrivateListeners = _.some(privateListeners, function(u) {
          return u == user;
        });

        if(!senderExistInPrivateListeners) privateListeners.push(user);

        _.each(privateListeners, function(u) {
          u.socket.emit('privateMessage', { sender: user.name, content: msg });
        });
      } else {
        self.broadcastToAllUsers('message', { sender: user.name, content: msg });
      }
    });

    user.socket.on('userIsTyping', function(){
      var nameExist = _.some(self.typingUsers, function(typingUser) {
        return typingUser.name == user.name;
      });

      if(!nameExist) self.typingUsers.push(user);

      self.broadcastToAllUsers('typingUsers', nameList(self.typingUsers));
    });

    user.socket.on('userCanceledTyping', function(){
      self.typingUsers = removeUserFromUsers(self.typingUsers, user);

      self.broadcastToAllUsers('typingUsers', nameList(self.typingUsers));
    });

    user.socket.on('userFinishedTyping', function(){
      self.typingUsers = removeUserFromUsers(self.typingUsers, user);

      self.broadcastToAllUsers('typingUsers', nameList(self.typingUsers));
    });
  }

  self.broadcastToAllUsers = function(event, obj) {
    _.each(self.users, function(user){
      user.socket.emit(event, obj);
    });
  }

  var nameList = function(users) {
    return _.map(users, function(user){
      return user.name;
    });
  }

  var removeUserFromUsers = function(users, userToRemove) {
    return _.filter(users, function(user){
      return user != userToRemove;
    });
  }
}
