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

var renderedRoom = false;
var loaded = false;

socket.on('userJoined', function(name){
  if(!renderedRoom) {
    $("#app").html(require("jade!../jade/room.jade"));
    renderedRoom = true;
  }

  $('#messages').append($('<li>').text(name + ' joined room.'));

  if(loaded) return;

  socket.on('userLeft', function(name){
    $('#messages').append($('<li>').text(name + ' left room.'));
  });

  socket.on('message', function(message) {
    $('#messages').append($('<li>').text(message.sender + ': ' + message.content));
  });

  $('form').submit(function(){
    socket.emit('message', $('#new-message').val());

    $('#new-message').val('');
    return false;
  });

  loaded = true;
});
