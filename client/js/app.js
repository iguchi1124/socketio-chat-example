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

  $('form').submit(function(){
    socket.emit('message', $('#new-message').val());
    socket.emit('userFinishedTyping');

    $('#new-message').val('').blur();
    return false;
  });

  $("#new-message").on('keyup keydown', function() {
    if(this.value.length > 0) {
      socket.emit('userIsTyping');
    } else {
      socket.emit('userCanceledTyping');
    }
  });

  socket.on('typingUsers', function(nameList) {
    if($('#typing-users-info') != null) $('#typing-users-info').remove();

    var typingUsersCount = nameList.length;

    if(typingUsersCount == 1) {
      $('#messages').append($('<li>', { id: 'typing-users-info' }).text(nameList[0] + " is typing now ..."));
      autoScroll();
    } else if (typingUsersCount > 1) {
      $('#messages').append($('<li>', { id: 'typing-users-info' }).text(typingUsersCount.toString() + "people are typing now ..."));
    } else {
      $('#typing-users-info').remove();
    }
  });

  socket.on('message', function(message) {
    $('#messages').append($('<li>').text(message.sender + ': ' + message.content));
    autoScroll();
  });

  loaded = true;
});
