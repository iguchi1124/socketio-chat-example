var $ = require('jquery');
var io = require('socket.io-client');
var socket = io();

var normalizeStylesheet = require('./css/normalize.css');
var applicationStylesheet = require('./less/app.less');

var lobbyTemplate = require('./jade/lobby.jade');
var roomTemplate = require('./jade/room.jade');

normalizeStylesheet;
applicationStylesheet;

var renderedLobby = false;
var renderedRoom = false;

if(!renderedLobby && !renderedRoom) {
  $('#app').html(lobbyTemplate);
  renderedLobby = true;

  $('#entry-form').submit(function(){
    socket.emit('username', $('#username').val());

    $('#username').val('');
    return false;
  });

  $('body').scrollTop($('body').prop('scrollHeight'));

  socket.on('nameExist', function(name) {
    $('#notice').text('A user who named "' + name + '" is already in the room. Please use other name.');
  });

  socket.on('nameLengthInvalid', function() {
    $('#notice').text('Please enter the name of the 3 or more characters to 15 characters or less.');
  });

  socket.on('nameHasInvalidChars', function() {
    $('#notice').text('You can use only alphanumeric and hyphen(-) and underscore(_) for username.');
  });
}

var autoScroll = function() {
  var height = $('body').prop('scrollHeight');
  if(Math.abs(height - $('body').scrollTop()) <= 1000) $('body').scrollTop(height);
}

var eventsLoaded = false;

socket.on('userJoined', function(name){
  if(renderedLobby && !renderedRoom) {
    $('#app').html(roomTemplate);
    renderedRoom = true;
  }

  $('#messages').append($('<li>').text(name + ' joined room.'));
  autoScroll();

  if(eventsLoaded) return;

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

  $('#message-form').submit(function(){
    socket.emit('message', $('#new-message').val());
    socket.emit('userFinishedTyping');

    $('#new-message').val('').blur();
    return false;
  });

  $('#new-message').on('keyup keydown', function() {
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
      $('#messages').append($('<li>', { id: 'typing-users-info' }).text(nameList[0] + ' is typing now ...'));
      autoScroll();
    } else if (typingUsersCount > 1) {
      $('#messages').append($('<li>', { id: 'typing-users-info' }).text(typingUsersCount.toString() + 'people are typing now ...'));
    } else {
      $('#typing-users-info').remove();
    }
  });

  socket.on('message', function(message) {
    $('#messages').append($('<li>').text(message.sender + ': ' + message.content));
    autoScroll();
  });

  eventsLoaded = true;
});
