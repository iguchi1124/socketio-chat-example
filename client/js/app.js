var $ = require("jquery");
var io = require("socket.io-client");
var socket = io();

require("style!css!less!../css/app.less");

$("#app").html(require("jade!../jade/lobby.jade"));

$('form').submit(function(){
  socket.emit('username', $('#username').val());

  $('#username').val('');
  return false;
});

$('body').scrollTop($('body').prop('scrollHeight'));

var autoScroll = function() {
  var height = $('body').prop('scrollHeight');
  if(Math.abs(height - $('body').scrollTop()) <= 1000) $('body').scrollTop(height);
}

socket.on('nameExist', function(name) {
  $('#notice').text('A user who named "' + name + '" is already in the room. Please use other name.');
});

socket.on('nameBad', function() {
  $('#notice').text('Please enter the name of the 3 or more characters to 15 characters or less.');
});

var renderedRoom = false;
var loaded = false;

socket.on('userJoined', function(name){
  if(!renderedRoom) {
    $("#app").html(require("jade!../jade/room.jade"));
    renderedRoom = true;
  }

  $('#messages').append($('<li>').text(name + ' joined room.'));
  autoScroll();

  if(loaded) return;

  socket.on('userLeft', function(name){
    $('#messages').append($('<li>').text(name + ' left room.'));
    autoScroll();
  });

  socket.on('message', function(message) {
    $('#messages').append($('<li>').text(message.sender + ': ' + message.content));
    autoScroll();
  });

  $('form').submit(function(){
    socket.emit('message', $('#new-message').val());

    $('#new-message').val('');
    return false;
  });

  loaded = true;
});
