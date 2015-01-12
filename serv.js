var app = require('express')();
var express  = require('express');

var bodyParser = require('body-parser');
var multer = require('multer'); 
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  app.use(multer()); // for parsing multipart/form-data

var engine   = require('ejs-locals');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SG = require('./servGame');
var fs = require('fs');
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
MemoryStore = require('express/node_modules/connect/node_modules/express-session/session/memory');
var session_store = new MemoryStore();
 app.use(express.cookieParser());
 app.use(express.session({ secret: 'your secret here', store:session_store}));


app.get('/', function(req, res){
  res.render('index.ejs', { myLayout: 'main', session : req.session })
});
app.get('/game', function(req, res){
	if (req.session.login) {
    console.log('============== /game');
    var ok = false;
    for (var i in SG.StartedGames) {
        console.log(i + ' : ' + SG.StartedGames[i].loginA + ' / ' + SG.StartedGames[i].loginB + ' | ' + req.session.login)
      if (SG.StartedGames[i].loginA == req.session.login 
        || SG.StartedGames[i].loginB == req.session.login
      ) {
        ok = true;
      }
    }
    if (ok) {
      console.log('load template')
      req.session.id == req.cookies['connect.sid'];
      res.render('game.ejs', { myLayout: 'game', session : req.session })
    } else {
      res.writeHead(303, {'Location': '/lobby'});
      res.end();
    }
	}
	else {
		res.writeHead(303, {'Location': '/login'});
		res.end();
	}
});
app.get('/serv', function(req, res){
  res.sendfile(__dirname + '/serv.html');
});

var logicLogin = require('./logic/login');
app.get('/login', function(req, res){
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
		req.session.id == req.cookies['connect.sid'];
		res.render('index.ejs', { myLayout: 'lobby', session : req.session })
		//console.log('req',req)
	}
	else {
		res.writeHead(303, {'Location': '/login'});
		res.end();
	}
});

app.get('/decks', function(req, res){
  if (req.session.login) {


    var loginFileName = encodeURIComponent(req.session.login);
    var outputFilename = __dirname + '/data/decks_'+loginFileName+'.json';

    var decks = {};
    if (fs.existsSync(outputFilename)) {
      decks = JSON.parse(fs.readFileSync(outputFilename, 'utf8'));
    }

    req.session.id == req.cookies['connect.sid'];
    res.render('index.ejs', { myLayout: 'decks', session : req.session, decks : decks })
  }
  else {
    res.writeHead(303, {'Location': '/login'});
    res.end();
  }
});

app.post('/ajaxDeck', function(req, res) {
  console.log('\nreq.session.login\n' + req.session.login)
  if (req.session.login) {
    var loginFileName = encodeURIComponent(req.session.login);
    var outputFilename = __dirname + '/data/decks_'+loginFileName+'.json';
    var nameFileName = encodeURIComponent(req.param('name'));

    var decks = {};
    if (fs.existsSync(outputFilename)) {
      decks = JSON.parse(fs.readFileSync(outputFilename, 'utf8'));
    }
    var deck = req.param('deck');

    var act = req.param('act')
    if (act === 'save') {
      decks[nameFileName] = deck;
    }
    if (act === 'delete' && decks.hasOwnProperty(nameFileName)) {
      console.log(outputFilename);
      delete decks[nameFileName];
    }
    fs.writeFile(outputFilename, JSON.stringify(decks, null, 4), function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("DEck " + nameFileName + " " + act  +" to " + outputFilename);
      }
    });
  } else {
    res.end();
  }
});

app.use('/public', express.static(__dirname + '/public'));

// var usersData = {};
// io.use(function(socket, next) {
//     //handshake ok
//     usersData[socket.id] = ourUserData;
//     next();
// });
io.on('connection', function(socket){
  //console.log('\nsession_store',session_store)
  var cookie_string = socket.request.headers.cookie;
  var parsed_cookie = {};
  var obj = cookie_string.split('; ')
  for (var i in obj) {
  	var pair = obj[i].split('=');
  	parsed_cookie[pair[0]] = pair[1].trim()
  }
  var connect_sid = parsed_cookie['connect.sid'].split('.')[0].substr(4);
  //console.log('\nconnect_sid', connect_sid)
  if (connect_sid) {
    // session_store.get(connect_sid, function (error, session) {
    // 	session.connect_sid = connect_sid;
    // });
	SG.initLobbi(io, socket, session_store);
  }
  else {
	  res.writeHead(303, {'Location': '/'});
	  res.end();
  }

  socket.on('disconnect', function (req) {
  	SG.disconnect(this.id)
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
