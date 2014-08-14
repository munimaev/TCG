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
  console.log('processing POST request: ', request.query.login, request.query.password, request.query.remember);

  var nextLocation = '/login' ;

  if ((request.query.login==='Thor')&&(request.query.password==='111') ||
    (request.query.login==='Odin')&&(request.query.password==='222')) {
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
    request.session.enteredWrongPassword = true;
    nextLocation = '/login';
  }

  response.writeHead(303, {'Location': nextLocation});
  response.end();
}

//---
exports.create = create ;
exports.processPost = processPost ;
