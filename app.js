
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var users = [];
var connections = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){

    connections.push(socket);
    console.log("Connected: %s sockets connected", connections.length);

    socket.on('new user', function(data, callback){
      if(users.indexOf(data) != -1){
        callback(false);
      }
      else{
        callback(true);
        socket.user = data;
        users.push(socket.user);
        updateUsers();
      }
    });

    socket.on('chat message', function(msg){
    io.emit('chat message', {msg: msg, user: socket.user});
  });

  function updateUsers(){
    io.sockets.emit('usernames', users);
  }

  socket.on('disconnect', function(data){
    if(!socket.user){
      return;
    }
    else{
      connections.pop();
      console.log("Disconnected: %s connected", connections.length);
      users.splice(users.indexOf(socket.user),1);
      updateUsers();
    }
  });
});

http.listen(port, function(){
  console.log('Server started on port ' + port);
});
