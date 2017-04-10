
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var users = {};
var connections = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


io.sockets.on('connection', function(socket){

    connections.push(socket);
    console.log("Connected: %s sockets connected", connections.length);

    socket.on('new user', function(data, callback){
      if(data in users){
        callback(false);
      }
      else{
        callback(true);
        socket.user = data;
        users[socket.user] = socket;
        updateUsers();
      }
    });

    socket.on('chat message', function(msg, callback){
      var msg = msg.trim();
      if(msg.substr(0,3) === '/p '){
        msg = msg.substr(3);
        var blank = msg.indexOf(' ');
        if(blank !== -1){
          var user = msg.substring(0, blank);
          var userMsg = msg.substring(blank + 1);
          if(user in users){
            users[user].emit('private message', {msg: msg, user: socket.user})
          }
          else{
            callback("Error! User is either invalid or offline");
          }
        }
        else{
          callback("Error! Please enter the username to send this message to");
        }
      }
      else{
    io.emit('chat message', {msg: msg, user: socket.user});
  }
  });

  function updateUsers(){
    io.sockets.emit('usernames', Object.keys(users));
  }

  socket.on('disconnect', function(data){
    if(!socket.user){
      return;
    }
    else{
      connections.pop();
      console.log("Disconnected: %s connected", connections.length);
      delete users[socket.user];
      updateUsers();
    }
  });
});

http.listen(port, function(){
  console.log('Server started on port ' + port);
});
