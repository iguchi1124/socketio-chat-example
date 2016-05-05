var $ = require("jquery");
var io = require("socket.io-client");
var socket = io();

var stylesheet = require("../css/app.less"),
    lobbyTemplate = require("../jade/lobby.jade"),
    roomTemplate = require("../jade/room.jade");

stylesheet;

$("#app").html(lobbyTemplate);

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
    $("#app").html(roomTemplate);
    renderedRoom = true;
  }

  $('#messages').append($('<li>').text(name + ' joined room.'));
  autoScroll();

  if(loaded) return;

  socket.on('userLeft', function(name){
    $('#messages').append($('<li>').text(name + ' left room.'));
    autoScroll();
  });

  socket.on('usersNameList', function(nameList){
    $('#user-list').html('');

    nameList.forEach(function(name) {
      $('#user-list').append($('<li>').text(name));
    });
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
