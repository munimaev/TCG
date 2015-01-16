
var fs = require('fs');
//---
function create(request, response) {
  var nw = false;
  if ( typeof(request.session.redirectedFrom) !== 'undefined') {
    nw = true;
  }

  var locals = baseLocals ;
  if (nw) {
    locals.needsWarning = true;
  }
  else {
    locals.needsWarning = false;
  }
  locals.loggedIn = request.session.authorized ? request.session.authorized : false;
  locals.username = request.session.username ? request.session.username : 'no matter what';

  locals.wrongPassword = false;
  if (request.session.enteredWrongPassword) {
    locals.wrongPassword = request.session.enteredWrongPassword ;
    delete request.session.enteredWrongPassword ;
  }

  var page = fn(locals);
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(page);
  response.end();
}

/**
 * Processes POST request with user's name and password.
 * @param request
 * @param response
 */
function processPost(request, response) {
  //console.log('processing POST request: ', request.query.login, request.query.password, request.query.remember);
  var nextLocation = '/login' ;

  var outputFilename = __dirname + '/../../data/users.json';
  var users = JSON.parse(fs.readFileSync(outputFilename, 'utf8'));

  if (!users.hasOwnProperty(request.query.login)) {

    request.session.notification = {type:'alert', role:'danger', text:'Неверный логин'};    
  }
  else if(users[request.query.login].password === request.query.password) {
    request.session.login = request.query.login;    

    if ( typeof(request.session.redirectedFrom) === 'string') {
      nextLocation = request.session.redirectedFrom ;
      delete request.session.redirectedFrom ;
    }
    else {
      nextLocation = '/' ; //always redirect to main page
    }

    delete request.session.enteredWrongPassword;
  }
  else {
    request.session.notification = {type:'alert', role:'danger', text:'Неверный пароль'};  
    request.session.enteredWrongPassword = true;
    nextLocation = '/login';
  }

  response.writeHead(303, {'Location': nextLocation});
  response.end();
}


/**
 * Processes POST request with registration.
 * @param request
 * @param response
 */
function registerPost(request, response) {
  //console.log('processing POST request: ', request.query.login, request.query.password, request.query.remember);
  var nextLocation = '/login' ;
  for (var i in request.query) {
    console.log(i + ' = ' + request.query[i])
  }
  var outputFilename = __dirname + '/../../data/users.json';
  var users = JSON.parse(fs.readFileSync(outputFilename, 'utf8'));

  if (users.hasOwnProperty(request.query.login)) {
    request.session.notification = {type:'alert', role:'danger', text:'Логин занят'};    
  }
  else if (request.query.password !== request.query.password2) {
    request.session.notification = {type:'alert', role:'danger', text:'Пароли не совпадают.'};   
  }
  else {
    users[request.query.login] = {'password':request.query.password};
    request.session.notification = {type:'alert', role:'success', text:'Успех.'};  

    fs.writeFile(outputFilename, JSON.stringify(users, null, 2), function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("New user " + request.query.login);
      }
    });

  }

  response.writeHead(303, {'Location': nextLocation});
  response.end();
}

//---
exports.create = create ;
exports.registerPost = registerPost;
exports.processPost = processPost ;
