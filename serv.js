var app = require('express')();
var express  = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SG = require('./servGame');
var window = null;
app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});
app.get('/game', function(req, res){
  res.sendfile(__dirname + '/game.html');
});
app.get('/serv', function(req, res){
  res.sendfile(__dirname + '/serv.html');
});

// app.use(express.cookieDecoder());
// app.use(express.session());
app.use('/public', express.static(__dirname + '/public'));


io.on('connection', function(socket){
  SG.initLobbi(io, socket);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
