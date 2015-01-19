var SessionTable = {};
var io, session_store, StartedGames, Tables;

/**
 * Функция для проброса объекта io из родительского модуля.
 * @param  {[type]} sio [description]
 * @return {[type]}     [description]
 */
exports.initialize = function(_io, _session_store, _StartedGames, _Tables) {
    io = _io;
    session_store = _session_store;
    StartedGames = _StartedGames;
    Tables = _Tables;
}



function getTables() {
    var data = {};
    for (var i in Tables) {
        data[i] = {
            pA: Tables[i].pA,
            pB: Tables[i].pB
        }
    }
    console.log(data)
    io.emit('setTables', data);
}
exports.getTables = getTables;


/**
 * Функция вывзвает при отключении пользователя от сервера. Проверяет была ли от этого сокета запущена игра, и, если была и если второй второй игрок не подкючен к этой игре, уничтоажает игру.
 * @param  {String} sok Идентификактор сокета
 * @return {[type]}     [description]
 */
exports.disconnect = function (sok) {
    var i;
    for (i in Tables) {
        if (Tables[i].sokA == sok) {
            delete Tables[i];
            getTables();
            break;
        }
    }
    for (i in StartedGames) {
        var end = false;
        if ('socketA' in StartedGames[i] && StartedGames[i].socketA == sok) {
            console.log('ANULL');
            StartedGames[i].socketA = null;
            end = true;
        }
        if ('socketB' in StartedGames[i] && StartedGames[i].socketB == sok) {
            console.log('BNULL');
            StartedGames[i].socketB = null;
            end = true;
        }
        if ('socketA' in StartedGames[i] && !StartedGames[i].socketA && 'socketB' in StartedGames[i] && !StartedGames[i].socketB) {
            console.log('DELL');
            console.log('socketA' in StartedGames[i], !StartedGames[i].socketA, 'socketB' in StartedGames[i], !StartedGames[i].socketB);
            delete StartedGames[i];
        }
        if (end) {
            break;
        }
    }
}



function cretaeTable(req) {
    var ses = JSON.parse(session_store.sessions[req.ses]);
    for (var i in Tables) {
        if (Tables[i].pA == ses.login || Tables[i].pB == ses.login) {
            return;
        }
    }
    Tables[getNewObjectId(Tables)] = {
        'pA': ses.login,
        'sesA': req.ses,
        'sokA': this.id,
        'deckpA': req.myDeck
    };
    getTables();
}
exports.cretaeTable = cretaeTable;



function getNewObjectId(obj) {
    var result = 1;
    while (obj[result]) {
        result++;
    }
    return result;
}



function joinToTable(req) {
    var ses = JSON.parse(session_store.sessions[req.ses]);
    for (var i in Tables) {
        if (Tables[i].pA == ses.login) {
            req.table = i;
            deleteTable(req)
        }
    }
    if (Tables[req.toTable]) {
        if (Tables[req.toTable].sokA) {
            var id = getNewObjectId(StartedGames)
            StartedGames[id] = {};
            if (Math.random() > 0.5) {
                StartedGames[id].pA = Tables[req.toTable].pA
                StartedGames[id].loginA = Tables[req.toTable].pA
                StartedGames[id].sesA = Tables[req.toTable].sesA
                StartedGames[id].deckpA = Tables[req.toTable].deckpA
                SessionTable[Tables[req.toTable].sesA] = id;
                StartedGames[id].loginB = ses.login;
                StartedGames[id].pB = ses.login;
                StartedGames[id].sesB = req.ses;
                StartedGames[id].deckpB = req.myDeck;
                SessionTable[req.ses] = id;
            } else {
                StartedGames[id].loginB = Tables[req.toTable].pA
                StartedGames[id].pB = Tables[req.toTable].pA
                StartedGames[id].sesB = Tables[req.toTable].sesA
                StartedGames[id].deckpB = Tables[req.toTable].deckpA
                SessionTable[Tables[req.toTable].sesA] = id;
                StartedGames[id].loginA = ses.login;
                StartedGames[id].pA = ses.login;
                StartedGames[id].sesA = req.ses;
                StartedGames[id].deckpA = req.myDeck;
                SessionTable[req.ses] = id;
            }
            this.emit('startGame', {
                "key": 'alert'
            })
            io.sockets.in(Tables[req.toTable].sokA).emit('startGame', {
                "key": 'alert'
            });
        }
        req.table = req.toTable;
        deleteTable(req, true);
    }
    console.log(StartedGames)
}
exports.joinToTable = joinToTable;



function deleteTable(req, forced) {
    var ses = JSON.parse(session_store.sessions[req.ses]);

    if (forced || (Tables[req.table] && (Tables[req.table].pA == ses.login || Tables[req.table].pB == ses.login))

    ) {
        delete Tables[req.table];
        getTables();
    }
}
exports.deleteTable = deleteTable;



function getTableForSession(session) {
    return SessionTable[session];
}
exports.getTableForSession = getTableForSession;



function getGames() {
    var data = {};
    for (var i in StartedGames) {
        data[i] = {
            pA: StartedGames[i].loginA,
            pB: StartedGames[i].loginB
        }
    }
    io.emit('setGames', data);
}
exports.getGames = getGames;
