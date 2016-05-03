module.exports = function(io) {
  var self = this;
  self.io = io;

  self.run = function() {
    self.io.on('connection', function(socket){
      console.log('a user connected');

      socket.on('disconnect', function(){
        console.log('user disconnected');
      });

      socket.on('message', function(msg){
        console.log('message: ' + msg);
        self.io.emit('message', msg);
      });
    });
  }
}
