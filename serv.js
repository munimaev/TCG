var app = require('express')();
var express  = require('express');
var engine   = require('ejs-locals');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SG = require('./servGame');
var window = null;

// Установка рендера - http://robdodson.me/blog/2012/05/31/how-to-use-ejs-in-express/
//app.use(partials());

//https://github.com/publicclass/express-partials
//app.use(partials());

app.engine('ejs', engine);
app.set('view engine', 'ejs'); 

//http://habrahabr.ru/post/145970/
 app.use(express.cookieParser());
 app.use(express.session({ secret: 'your secret here'}));

app.get('/', function(req, res){
  res.render('index.ejs', { login: null })
  //res.sendfile(__dirname + '/index.html');
});
app.get('/game', function(req, res){
  res.sendfile(__dirname + '/game.html');
});
app.get('/serv', function(req, res){
  res.sendfile(__dirname + '/serv.html');
});

app.use('/public', express.static(__dirname + '/public'));


io.on('connection', function(socket){
  SG.initLobbi(io, socket);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
