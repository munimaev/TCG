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

//http://stackoverflow.com/questions/4641053/socket-io-and-session
var connect = require('express/node_modules/connect');
var session_store ={a:'b'};

//http://habrahabr.ru/post/145970/
 app.use(express.cookieParser());
 app.use(express.session({ secret: 'your secret here'}));

app.get('/', function(req, res){
  res.render('index.ejs', { myLayout: 'main', session : req.session })
});
app.get('/game', function(req, res){
  res.sendfile(__dirname + '/game.html');
});
app.get('/serv', function(req, res){
  res.sendfile(__dirname + '/serv.html');
});

var logicLogin = require('./logic/login');
app.get('/login', function(req, res){
	console.log(req.body);
	if (req.query.login && req.query.password) {
		logicLogin.processPost(req, res) // производим вход
	} else {
  		res.render('index.ejs', { myLayout: 'login' }) 
	}
});
app.get('/logout', function(req, res){
  delete req.session.login ;
  res.writeHead(303, {'Location': '/'});
  res.end();
});

app.get('/lobby', function(req, res){
	if (req.session.login) {
		res.render('index.ejs', { myLayout: 'lobby', session : req.session })
	}
	else {
		res.writeHead(303, {'Location': '/login'});
		res.end();
	}
});

app.use('/public', express.static(__dirname + '/public'));


io.on('connection', function(socket){
  SG.initLobbi(io, socket);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
