var io;
var gameSocket;
var session_store = {'s':'e'};
var Tables = {
};
var preGamesLobbi = {
}
var StartedGames = {
};
var Testing = true;
exports.StartedGames = StartedGames;
var SesssionTable = {};
var Actions = require('./public/js/G/Actions.js');
var Can = require('./public/js/G/Can.js');
var Stadies = require('./public/js/G/Stadies.js');

//console.log(Stadies)

function arraySearch(array, value) {
    for ( var i in array) {
        //console.log('msg',i,array[i], value)
        if (array[i] == value) {
            return i;
        }
    }
    return null
}
/**
 * This function is called by index.js to initialize a new game instance.
 *
 * @param sio The Socket.IO library
 * @param socket The socket object for the connected client.
 */
exports.initLobbi = function(sio, socket, session_store_){
    io = sio;
    gameSocket = socket;
    session_store = session_store_;
    gameSocket.emit('connected', { message: "You are connected!" });
    //-----------------------------------------
    gameSocket.on('lobby:tables', getTables);
    gameSocket.on('lobby:games', getGames);
    gameSocket.on('lobby:create', lobby_create);
    gameSocket.on('lobby:join', lobby_join);
    gameSocket.on('lobby:delete', lobby_delete);
    gameSocket.on('player:sit', playerSit);
    gameSocket.on('player:unsit', playerUnsit);
    gameSocket.on('imJoined',imJoined);
    gameSocket.on('newLeader',newLeader);
    gameSocket.on('preStackDone',preStackDone);
    //-----------------------------------------
    gameSocket.on('initGame', S_init);
    gameSocket.on('startDrawHand', S_startDrawHand);
    gameSocket.on('charge', charge);
    gameSocket.on('pressNextBtn', pressNextBtn);
    gameSocket.on('putInPlay', putInPlay);
    gameSocket.on('removeFromTeam', removeFromTeam);
    gameSocket.on('addToTeam', addToTeam);
    gameSocket.on('changeInTeam', changeInTeam);
    gameSocket.on('moveTeamToAttack', moveTeamToAttack);
    gameSocket.on('block', block);
    gameSocket.on('drawCardAtStartTurn', drawCardAtStartTurn);
    //-----------------------------------------
    // gameSocket.on('server:connected', updServerInfoPage);
}

exports.disconnect = function(sok) {
	for (var i in Tables) {
		if (Tables[i].sokA == sok ) {
			delete Tables[i];
			getTables();
			break;
		}
	}
	for (var i in StartedGames) {
		var end = false;
		if ('socketA' in StartedGames[i] && StartedGames[i].socketA == sok) {
			console.log('ANULL')
			StartedGames[i].socketA = null;
			end = true;
		}
		if ('socketB' in StartedGames[i] && StartedGames[i].socketB == sok) {
			console.log('BNULL')
			StartedGames[i].socketB = null;
			end = true;
		}
		if ('socketA' in StartedGames[i] 
			&& !StartedGames[i].socketA 
			&& 'socketB' in StartedGames[i]
			&&  !StartedGames[i].socketB) {
			console.log('DELL')
			console.log('socketA' in StartedGames[i] 
			, !StartedGames[i].socketA 
			, 'socketB' in StartedGames[i]
			, !StartedGames[i].socketB)
			delete StartedGames[i];
		}
		if (end) break;
	}
}

function lobby_create(req) {
	var ses = JSON.parse(session_store.sessions[req.ses]);
	for (var i in Tables) {
		if (Tables[i].pA == ses.login || Tables[i].pB == ses.login ) {
			return;
		}
	}
	Tables[getNewObjectId(Tables)] = {'pA': ses.login , 'sesA': req.ses, 'sokA': this.id};
	getTables();
}
function lobby_join(req) {
	var ses = JSON.parse(session_store.sessions[req.ses]);
	for (var i in Tables) {
		if (Tables[i].pA == ses.login ) {
			req.table = i;
			lobby_delete(req)
		}
	}
	if (Tables[req.toTable]) {
		if (Tables[req.toTable].sokA) {
			var id = getNewObjectId(StartedGames)
			StartedGames[id] = {};
			if (Math.random() > 0.5) {
				StartedGames[id].pA   = Tables[req.toTable].pA
				StartedGames[id].loginA   = Tables[req.toTable].pA
				StartedGames[id].sesA = Tables[req.toTable].sesA
				SesssionTable[Tables[req.toTable].sesA] = id;
				StartedGames[id].loginB   = ses.login;
				StartedGames[id].pB   = ses.login;
				StartedGames[id].sesB = req.ses;
				SesssionTable[req.ses] = id;
			} else {
				StartedGames[id].loginB   = Tables[req.toTable].pA
				StartedGames[id].pB   = Tables[req.toTable].pA
				StartedGames[id].sesB = Tables[req.toTable].sesA
				SesssionTable[Tables[req.toTable].sesA] = id;
				StartedGames[id].loginA   = ses.login;
				StartedGames[id].pA   = ses.login;
				StartedGames[id].sesA = req.ses;
				SesssionTable[req.ses] = id;
			}
			this.emit('startGame',{"key":'alert'})
			io.sockets.in(Tables[req.toTable].sokA).emit('startGame',{"key":'alert'});
		}
		req.table = req.toTable;
		lobby_delete(req, true);
	}
	console.log(StartedGames)
}
function lobby_delete(req, forced) {
	var ses = JSON.parse(session_store.sessions[req.ses]);

	if (forced
		|| (Tables[req.table] 
			&& (Tables[req.table].pA == ses.login 
				|| Tables[req.table].pB == ses.login) )

	){	
		delete Tables[req.table];
		getTables();
	}
}

function getNewObjectId(obj) {
	var result = 1;
	while(obj[result]) {
		result++;
	}
	return result;
}

function getTables() {
	var data = {};
	for (var i in Tables) {
		data[i] = {pA:Tables[i].pA, pB:Tables[i].pB}
	}
    io.emit('setTables',data);
}

function getGames() {
	var data = {};
	for (var i in StartedGames) {
		data[i] = {pA:StartedGames[i].loginA, pB:StartedGames[i].loginB}
	}
    io.emit('setGames',data);
}

function playerSit(d) {
	if (d.pX) {
		Tables[d.id][d.pX] = d.user;
	    if (Tables[d.id].pA && Tables[d.id].pB) {
	    	// second
			this.emit('sitInLobby',{"key":preGamesLobbi[d.id].key})
			this.join(preGamesLobbi[d.id].key);
			io.sockets.in(preGamesLobbi[d.id].key).emit('startGame', { some: 'data' });

	    } else {
	    	// first
			preGamesLobbi[d.id] = {
				key: ( Math.random() * 100000 ) | 0
			};
			this.emit('sitInLobby',{"key":preGamesLobbi[d.id].key})
			this.join(preGamesLobbi[d.id].key.toString());
		}
	}
    io.emit('setTables',Tables);
}
function playerUnsit(d) {
	if (d.pX && Tables[d.id][d.pX] == d.user) {
		Tables[d.id][d.pX] = null;
		this.emit('unsitInLobby')
		this.leave(preGamesLobbi[d.id].key.toString());
	} 
	if (!Tables[d.id].pA && !Tables[d.id].pB) {
		delete preGamesLobbi[d.id]
	}
    io.emit('setTables',Tables);
}

/*
	Server
 */

function updServerInfoPage (d) {
	if (!(d.b in StartedGames)) StartedGames[d.b] = {};
	if (!StartedGames[d.b].roomS ) {
	    StartedGames[d.b].roomS = StartedGames[d.b].room +"_"+this.id;
    	this.join(StartedGames[d.b].roomS);
	}
	var info = StartedGames[d.b]
	this.emit('updServerInfoPage',info);
}

/*
	G
 */

function S_init(d) {
	console.log('\nS_init')
	//console.log(StartedGames);
	var tableId = SesssionTable[d.ses];
	var table = StartedGames[tableId];
	// console.log(SesssionTable)
	// console.log(d)
	// console.log(tableId)
	// console.log(table)
	if (!table) {
		console.log('goOut')
		this.emit('goOut');
		return;
	}
	var Snapshot = getStartSnapshot(table);
	var data = { 
    	Snapshot : Snapshot,
    	mySocketId: this.id,
    	table: tableId
    };
    if (table.sesB == d.ses) {
    	data.you = "pB";
    	data.opp = "pA";
    	StartedGames[tableId].socketB = this.id;
    	StartedGames[tableId].room = getRoomNumber(tableId);
    	StartedGames[tableId].roompB = StartedGames[tableId].room +"_"+this.id;
    	this.join(StartedGames[tableId].room);
    	this.join(StartedGames[tableId].roompB);
    	StartedGames[tableId].Snapshot = Snapshot;
    	io.sockets.in(StartedGames[tableId].roompB).emit('C_init', data); //TODO отослать только проверенному пользователю
    }
    if (table.sesA == d.ses) {
    	data.you = "pA";
    	data.opp = "pB";
    	StartedGames[tableId].socketA = this.id;
    	StartedGames[tableId].room = getRoomNumber(tableId);
    	StartedGames[tableId].roompA = StartedGames[tableId].room +"_"+this.id;
    	this.join(StartedGames[tableId].room);
    	this.join(StartedGames[tableId].roompA);
    	StartedGames[tableId].Snapshot = Snapshot;
    	io.sockets.in(StartedGames[tableId].roompA).emit('C_init', data); //TODO отослать только проверенному пользователю
    } else {
    	// TODO должно выкинуть в предыдущее окно
    }
   // io.sockets.in(StartedGames[d.b].roomS).emit('updServerInfoPage', StartedGames[d.b]);
}

function getRoomNumber(d) {
	if (StartedGames[d].room) {
		return StartedGames[d].room;
	} else {
		return (( Math.random() * 100000 ) | 0) + "";
	}
}
function imJoined(d) {
	console.log('\nimJoined')
		bothIsJoin(d);
}
function bothIsJoin(d) {
	console.log('\nbothIsJoin')
	var S = StartedGames[d.table]
	if (S.socketA && S.socketB ) {
		S.Accordance = getStartAccordiance(S);
		S.Known = getStartCards();
		S.pA = {Accordance:{},Known:{}}; S.pB = {Accordance:{},Known:{}};
		getStartAccordanceKnown(S,'pA');
		getStartAccordanceKnown(S,'pB');
		S.meta = getStartMeta(S);
		io.sockets.in(S.roompA).emit('bothIsJoin', {
			isNewGame: S.Snapshot.pA.isNewGame, 
			Accordance:S.pA.Accordance,
			Known:S.pA.Known
		});
		io.sockets.in(S.roompB).emit('bothIsJoin', {
			isNewGame: S.Snapshot.pB.isNewGame, 
			Accordance:S.pB.Accordance,
			Known:S.pB.Known
		});
		// TODO нужна комната для наблюдателя
	}
}

function getStartSnapshot(table) {
	if (table.Snapshot) {
		return table.Snapshot;
	}
	var result = { // as Snapshot
	    activePlayer: 'pA',
	    phase: "block",
	    stop: false,
	    turnNumber: 0,
	    counters : {
	        playedNinjaActivePlayer : 0
	    },
	    pA : {
	    	isDrawCardAtStartTurn : false,
	    	isNewGame : false,
	    	rewards : 0,
	    	turnCounter : 0,
	        hand: [],
	        deck: [],
	        chackra : [],
	        discard : [],
            mission : [],
            client : [],
	        village : {
	            team : {
	            	1:['c106'],
	            	3:['c104','c105']
	            }
	        },
	        attack : {
	            team : {
	            	2:['c102','c101','c103'],
	            }
	        },
	        block : {
	            team : {}
	        }
	    },
	    battlefield : {
	    	2:5
	    },
	    stack : {

	    },
	    pB : {
	    	isNewGame : false,
	    	rewards : 0,
	    	turnCounter : 0,
	        hand: [],
	        deck: [],
	        chackra : [],
	        discard : [],
            mission : [],
            client : [],
	        village : {
	            team : {
	            	// 4:['c005'],
	            	6:['c001','c004','c006']
	        	}
	        },
	        attack : {
	            team : {}
	        },
	        block : {
	            team : {
	            	5:['c002','c003','c005'],
	            }
	        }
	    },
	    statuses : {
			// c002: {
			// 	injured: true
			// },
			// c006: {
			// 	injured: true
			// },
			// c001: {
			// 	injured: true
			// }
	    }
	};
	var pu;
	for (var i = 7; i <= 23 ; i++) {
		pu = i < 10 ? "0"+i : i;
		result.pA.deck.push('c1' + pu )
		result.pB.deck.push('c0' + pu )
	}
	return result;
}

function getStartCards() {
	var C = { // as Construcors
		//Gaara
	    c001: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 2, sh: 0, ai: 2, si: 0, img: 'n1092' , elements: 'W', name : "Kankuro" },
	    c002: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 2, sh: 0, ai: 2, si: 0, img: 'n1092' , elements: 'W', name : "Kankuro" },
	    c003: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 0, si: 0, img: 'n847' , elements: 'W', name : "Mizuki (Childhood)" },
	    c004: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 0, si: 0, img: 'n847' , elements: 'W', name : "Mizuki (Childhood)" },
	    c005: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 2, sh: 0, ai: 1, si: 0, img: 'n602' , elements: 'W', name : "Matsuri" },
	    c006: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 0, sh: 2, ai: 0, si: 1, img: 'n1474' , elements: 'W', name : "Epidemic Prevention Officer" },
	    c007: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 0, sh: 2, ai: 0, si: 1, img: 'n1474' , elements: 'W', name : "Epidemic Prevention Officer" },
	    c008: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 3, sh: 3, ai: 2, si: 2, img: 'n1321' , elements: 'W', name : "Crow" },
	    c009: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 0, sh: 2, ai: 0, si: 0, img: 'n1319' , elements: 'W', name : "Yaoki" },
	    c015: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 0, sh: 2, ai: 0, si: 0, img: 'n1319' , elements: 'W', name : "Yaoki" },
	    c010: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 0, sh: 2, ai: 0, si: 0, img: 'nus025' , elements: 'W', name : "Temari" },
	    c011: {owner: 'pB', type: 'N', ec: 0, hc: 0, ah: 0, sh: 2, ai: 0, si: 0, img: 'nus025' , elements: 'W', name : "Temari" },
	    c012: {owner: 'pB', type: 'N', ec: 1, hc: 0, ah: 0, sh: 3, ai: 0, si: 1, img: 'n1322' , elements: 'W', name : "Black Ant" },
	    c013: {owner: 'pB', type: 'N', ec: 1, hc: 0, ah: 0, sh: 3, ai: 0, si: 1, img: 'n1086' , elements: 'W', name : "Crow" },
	    c014: {owner: 'pB', type: 'N', ec: 2, hc: 0, ah: 3, sh: 2, ai: 1, si: 1, img: 'n180' , elements: 'W', name : "Yashamaru" },
	    c016: {owner: 'pB', type: 'N', ec: 2, hc: 0, ah: 1, sh: 3, ai: 1, si: 3, img: 'n1325' , elements: 'W', name : "Salamander" },
	    c017: {owner: 'pB', type: 'N', ec: 2, hc: 0, ah: 1, sh: 3, ai: 1, si: 3, img: 'n1325' , elements: 'W', name : "Salamander" },
	    c018: {owner: 'pB', type: 'N', ec: 2, hc: 0, ah: 5, sh: 1, ai: 5, si: 0, img: 'n1267' , elements: 'W', name : "Gaara of the Desert" },
	    c019: {owner: 'pB', type: 'N', ec: 2, hc: 0, ah: 5, sh: 1, ai: 5, si: 0, img: 'n1267' , elements: 'W', name : "Gaara of the Desert" },
	    c020: {owner: 'pB', type: 'N', ec: 4, hc: 0, ah: 3, sh: 3, ai: 3, si: 3, img: 'n1418' , elements: 'W', name : "Chiyo" },
	    c021: {owner: 'pB', type: 'N', ec: 4, hc: 0, ah: 3, sh: 3, ai: 3, si: 3, img: 'n1418' , elements: 'W', name : "Chiyo" },
	    c022: {owner: 'pB', type: 'N', ec: 4, hc: 0, ah: 3, sh: 3, ai: 3, si: 2, img: 'n1481' , elements: 'WE', name : "Kankuro" },
	    c023: {owner: 'pB', type: 'N', ec: 5, hc: 1, ah: 5, sh: 4, ai: 0, si: 3, img: 'n1484' , elements: 'W', name : "Temari" },
	    c024: {owner: 'pB', type: 'N', ec: 5, hc: 1, ah: 5, sh: 4, ai: 2, si: 3, img: 'n1420' , elements: 'W', name : "Sasori" },
	    c025: {owner: 'pB', type: 'N', ec: 5, hc: 1, ah: 5, sh: 1, ai: 3, si: 1, img: 'n130' , elements: 'W', name : "Баки" },
	    c026: {owner: 'pB', type: 'N', ec: 5, hc: 1, ah: 6, sh: 2, ai: 4, si: 2, img: 'n483' , elements: 'W', name : "Gaara of the Desert" },
	    
	    
	    c121: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 0, si: 0, img: 'n1427' , elements: 'E', name : "Choji Akimichi"  },
	    c122: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 0, si: 0, img: 'n1427' , elements: 'E', name : "Choji Akimichi"  },
	    c123: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 0, si: 0, img: 'n1427' , elements: 'E', name : "Choji Akimichi"  },
	    c104: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 2, si: 0, img: 'n1423' , elements: 'E', name : "Neji Hyuga"  },
	    c105: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 2, si: 0, img: 'n1423' , elements: 'E', name : "Neji Hyuga"  },
	    c106: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 2, si: 0, img: 'n1423' , elements: 'E', name : "Neji Hyuga"  },
	    c107: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 0, sh: 0, ai: 0, si: 0, img: 'n699' , elements: 'E', name : "Koharu Utatane (Childhood)"  },
	    c108: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 0, sh: 0, ai: 0, si: 0, img: 'n700' , elements: 'E', name : "Homura Mitomon (Childhood)"  },
	    c109: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 0, sh: 2, ai: 0, si: 0, img: 'n1272' , elements: 'E', name : "Shiho"  },
	    c110: {owner: 'pA', type: 'N', ec: 1, hc: 0, ah: 0, sh: 2, ai: 0, si: 0, img: 'nus014' , elements: 'E', name : "Shikamaru Nara"  },
	    c111: {owner: 'pA', type: 'N', ec: 1, hc: 0, ah: 0, sh: 2, ai: 0, si: 0, img: 'nus014' , elements: 'E', name : "Shikamaru Nara"  },
	    c112: {owner: 'pA', type: 'N', ec: 1, hc: 0, ah: 1, sh: 1, ai: 1, si: 1, img: 'n348' , elements: 'E', name : "Tenten"  },
	    c113: {owner: 'pA', type: 'N', ec: 1, hc: 0, ah: 0, sh: 2, ai: 0, si: 1, img: 'n724' , elements: 'E', name : "Yoshino Nara"},
	    c113: {owner: 'pA', type: 'N', ec: 1, hc: 0, ah: 0, sh: 2, ai: 0, si: 1, img: 'n724' , elements: 'E', name : "Yoshino Nara"},
	    c114: {owner: 'pA', type: 'N', ec: 2, hc: 0, ah: 2, sh: 2, ai: 1, si: 2, img: 'n1429' , elements: 'E', name : "Hinata Hyuga"},
	    c115: {owner: 'pA', type: 'N', ec: 3, hc: 0, ah: 4, sh: 3, ai: 1, si: 1, img: 'n1366' , elements: 'E', name : "Foo"},
	    c116: {owner: 'pA', type: 'N', ec: 3, hc: 0, ah: 2, sh: 2, ai: 1, si: 2, img: 'n1366' , elements: 'E', name : "Foo"},
	    c117: {owner: 'pA', type: 'N', ec: 4, hc: 0, ah: 6, sh: 2, ai: 2, si: 0, img: 'n823' , elements: 'E', name : "Asuma Sarutobi"},
	    c118: {owner: 'pA', type: 'N', ec: 4, hc: 0, ah: 4, sh: 3, ai: 1, si: 3, img: 'n1279' , elements: 'E', name : "Inoichi Yamanaka"},
	    c119: {owner: 'pA', type: 'N', ec: 4, hc: 0, ah: 5, sh: 3, ai: 0, si: 0, img: 'n515' , elements: 'E', name : "Shikaku Nara"},
	    c120: {owner: 'pA', type: 'N', ec: 4, hc: 0, ah: 6, sh: 0, ai: 0, si: 0, img: 'n516' , elements: 'E', name : "Choza Akimichi"},
	    c101: {owner: 'pA', type: 'N', ec: 4, hc: 0, ah: 6, sh: 2, ai: 2, si: 0, img: 'n589' , elements: 'EF', name : "Sasuke Uchiha"},
	    c102: {owner: 'pA', type: 'N', ec: 5, hc: 1, ah: 5, sh: 4, ai: 3, si: 2, img: 'pr046' , elements: 'EF', name : "Yamato"},
	    c103: {owner: 'pA', type: 'N', ec: 5, hc: 1, ah: 7, sh: 1, ai: 4, si: 0, img: 'n844' , elements: 'EF', name : "Yugito Ni'i"},
	};
	return C;
}

function getStartMeta(S) {
	if (S.meta) return S.meta;
	var result = {
		toNextPhase : {pA:false,pB:false}, 
		teamCounter:0,
	};

	var pXs = ['pA','pB'];
	var zones = ['village','block', 'attack'];
	for (var pX in pXs) 
		for (var zone in zones)
			for (var number in S.Snapshot[pXs[pX]][zones[zone]].team)
				if (result.teamCounter <= number) result.teamCounter = number;

	return result;
}

function getStartAccordiance(S) {
	if (S.Accordance) return S.Accordance;
	var pXs = ['c0','c1'];
	
	var result = {};

	for (var pX in pXs) {
		var keys = [];
		var values = [];
		for (var i = 1; i <= 23 ; i++) {
			keys.push(i < 10 ? '0' + i : ''+i)
			values.push(i < 10 ? '0' + i : ''+i)
		}

		if (!Testing) values.sort(  function() { return Math.random()-0.5} )
		
		for (var i in keys) {
			result[pXs[pX] + keys[i]] = pXs[pX] + values[i] 
		};
	}
	//console.log(result)


	return result;
}

function getStartAccordanceKnown(S,pX) {
	var result = {};
	if (!S.isNewGame) {
		var zones = [ S.Snapshot[pX].hand, S.Snapshot.pA.chackra, S.Snapshot.pA.discard, S.Snapshot.pB.chackra, S.Snapshot.pB.discard ]
		for (var zone in zones) {
			for (var card in zones[zone]) {
				oneCardAccordanceКnown(S, zones[zone][card], pX)
			}
		}
		zones = [S.Snapshot.pA.village, S.Snapshot.pA.block, S.Snapshot.pA.attack, S.Snapshot.pB.village, S.Snapshot.pB.block, S.Snapshot.pB.attack ]
		for (var zone in zones) {
			for (var t in zones[zone].team) {
				for (var card in zones[zone].team[t]) {
					oneCardAccordanceКnown(S, zones[zone].team[t][card], pX)
				}
			}
		}
	}
	return result;
}
function oneCardAccordanceКnown(S, card, arr) {
	var arr = arr || ['pA', 'pB'] // TODО наблюдатель
	if (typeof(arr) === 'string') arr = [arr];
	for (var i in arr) {
		var pX = arr[i];
		S[pX].Accordance[card] = S.Accordance[card];
		S[pX].Known[S[pX].Accordance[card]] = S.Known[S[pX].Accordance[card]];
	}
}

function S_startDrawHand(d) {
	console.log('startDrawHand')
	var table = StartedGames[d.u.table];
	var data = {upd:{}};
	// отдать информацию о верхних картах
	data.upd.Known = {};
	data.upd.Accordance = {};
	var deck = table.Snapshot[d.u.you].deck;
	for (var i in deck) {
		if (i > 5 ) break
		data.upd.Accordance[deck[i]] 
			= table[d.u.you].Accordance[deck[i]] 
			= table.Accordance[deck[i]];
		data.upd.Known[table.Accordance[deck[i]]] 
			= table[d.u.you].Known[table.Accordance[deck[i]]] 
			= table.Known[table.Accordance[deck[i]]];
	}
	Actions['Draw X cards']({S:table.Snapshot, pX:d.u.you});
	io.sockets.in(table['room' + d.u.you]).emit('update', data);
	io.sockets.in(table.room).emit('action', {
		acts: [{'arg':{S:'get_S',pX: d.u.you}, 'act' : 'Draw X cards'}]
	});
	//io.sockets.in(table.roomS).emit('updServerInfoPage',table);
}

function pressNextBtn(d) {
	if (Can.pressNextBtn({
		pX:d.u.you, 
		Stadies:Stadies,
		S:StartedGames[d.u.table].Snapshot,
		meta: StartedGames[d.u.table].meta})) {
		var table = StartedGames[d.u.table];
		table.meta.toNextPhase[d.u.you] = true;
		var data = {
			upd:{meta:table.meta},
			acts : [],
			stackPrep : {}
 		};
		if ((Stadies[table.Snapshot.phase].party == 'both' 
			&& table.meta.toNextPhase.pA 
			&& table.meta.toNextPhase.pB
		) || (Stadies[table.Snapshot.phase].party == 'attacker' 
			&& table.meta.toNextPhase[table.Snapshot.activePlayer]
		) || (Stadies[table.Snapshot.phase].party == 'blocker' 
			&& table.meta.toNextPhase[table.Snapshot.activePlayer == 'pA' ? 'pB' : 'pA']
		)){
			table.meta.toNextPhase.pA = table.meta.toNextPhase.pB = false;
			var actReuslt = Actions['toNextPhase']({S:table.Snapshot, Stadies:Stadies, Known:table.Known, Accordance:table.Accordance});
			console.log(actReuslt);
			data.stackPrep = actReuslt;
			table.stackPrep = actReuslt;
			table.stackPreppA = table.stackPreppB = null;
			//data.acts.push({'arg':{S:'get_S', Stadies:'get_Stadies', Known:'get_Known', Accordance:'get_Accordance'}, 'act' : 'toNextPhase'})
		} 
		else {
			table.meta.toNextPhase[d.u.opp] = false;
			data.acts.push({'arg':{}, 'act' : 'updTable'})
		}
		data.upd.meta = table.meta;
		io.sockets.in(table.room).emit('updact', data);

	} else {
	}
	// TODO возможно надо реагировать
}

function addToTeam(d) {
	var table = StartedGames[d.u.table];
		//console.log(d.arg)
	if (Can.orgAddToTeam({
			Accordance : table.Accordance ,
			c1 : {card:d.arg.c1.card} ,
			c2 : {card:d.arg.c1.card} ,
			Known : table.Known ,
			pX : d.arg.pX,
			S : table.Snapshot,
        })) 
	{
		d.arg.S = table.Snapshot;
		Actions['addToTeam'](d.arg);
		d.arg.S = 'get_S';
		var data = {
			acts : [{'arg':d.arg, 'act' : 'addToTeam'}]
		}		
		io.sockets.in(table.room).emit('updact', data);
	} else {
		console.log('bad addToTeam')
	}
	// TODO возможно надо реагировать
}
function changeInTeam(d) {
	var table = StartedGames[d.u.table];
	if (Can.orgChangeInTeam({
			Accordance : table.Accordance ,
			c1 : {card:d.arg.c1.card} ,
			c2 : {card:d.arg.c1.card} ,
			Known : table.Known ,
			pX : d.arg.pX,
			S : table.Snapshot,
        })) 
	{
		d.arg.S = table.Snapshot;
		Actions['organisation'](d.arg);
		d.arg.S = 'get_S';
		var data = {
			acts : [{'arg':d.arg, 'act' : 'organisation'}]
		}		
		io.sockets.in(table.room).emit('updact', data);
	} else {
		console.log('bad changeInTeam')
	}
	// TODO возможно надо реагировать
}
function putInPlay(d) {
	var table = StartedGames[d.u.table];
	//console.log(d.u);
	if (Can.putInPlay({
            Accordance : table.Accordance,
            card: d.arg.card,
            Known: table.Known,
            owner:d.arg.owner,
            pX:d.u.you,
            S:table.Snapshot,
        })) {
		var arg = {
			card:d.arg.card,
			from:d.arg.from,
			owner:d.arg.owner,
			pX:d.u.you,
			S: table.Snapshot,
			to:'village',
		}
		arg.teamCounter = ++table.meta.teamCounter;
		Actions['moveCardToZone'](arg);
		arg.S = 'get_S';
		var data = {
			acts : [{'arg':arg, 'act' : 'moveCardToZone'}]
		}
		
		// Информация для противиника о новой карте
		var updA = {}
		var updK = {}
		table[d.u.opp].Accordance[arg.card] 
			= updA[arg.card] 
			= table.Accordance[arg.card];
		table[d.u.opp].Known[table.Accordance[arg.card]] 
			= updK[table.Accordance[arg.card]] 
			= table.Known[table.Accordance[arg.card]];
		io.sockets.in(table['room'+d.u.opp])
			.emit('update', {
				upd:{
					Accordance:updA,
					Known:updK
				}
			});
		
		io.sockets.in(table.room).emit('updact', data);
	} else {
		console.log('bad')
	}
	// TODO возможно надо реагировать
}

function removeFromTeam(d) {
	var table = StartedGames[d.u.table];
	if (Can.removeFromTeam({
            Accordance : table.Accordance,
            card: d.arg.card,
            Known: table.Known,
            owner:d.arg.owner,
            pX:d.u.you,
            S:table.Snapshot,
        })) 
	{
		d.arg.teamCounter = ++table.meta.teamCounter;
		d.arg.S = table.Snapshot;
		Actions['removeFromTeam'](d.arg);
		d.arg.S = 'get_S';
		var data = {
			acts : [{'arg':d.arg, 'act' : 'removeFromTeam'}]
		}		
		io.sockets.in(table.room).emit('updact', data);
	} 
	else {
		console.log('bad')
	}
	// TODO возможно надо реагировать
}

function moveTeamToAttack(d) {
	var table = StartedGames[d.u.table];
	if (Can.moveTeamToAttack({
            S : table.Snapshot,
            Known :  table.Known,
            Accordance : table.Accordance,
            card : d.arg.card,
            pX :  d.arg.pX,
            team : d.arg.team,
            from : d.arg.from,
            to : d.arg.to,
        })) 
	{
		d.arg.S = table.Snapshot;
		Actions['moveTeamToAttack'](d.arg);
		d.arg.S = 'get_S';
		var data = {
			acts : [{'arg':d.arg, 'act' : 'moveTeamToAttack'}]
		}		
		io.sockets.in(table.room).emit('updact', data);
	} 
	else {
		console.log('moveTeamToAttack bad')
	}
	// TODO возможно надо реагировать
}

function block(d) {
	var table = StartedGames[d.u.table];
	if (Can.block({
            S:table.Snapshot,
            attackTeam : d.arg.attackTeam,
            blockTeam : d.arg.blockTeam,
            pX : d.arg.pX
    })) 
	{	
		d.arg.S = table.Snapshot;
		Actions['block'](d.arg);
		d.arg.S = 'get_S';
		var data = {
			acts : [{'arg':d.arg, 'act' : 'block'}]
		}		
		io.sockets.in(table.room).emit('updact', data);
	} 
	else {
		console.log('block bad')
	}
	// TODO возможно надо реагировать
}

function charge(d) {
	var table = StartedGames[d.u.table];
	if (Can.charge({
            Accordance : table.Accordance,
            card: d.arg.card,
            Known: table.Known,
            owner:d.arg.owner,
            pX:d.u.you,
            S:table.Snapshot,
        })) {
		var arg = {
			card:d.arg.card,
			from:d.arg.from,
			owner:d.arg.owner,
			pX:d.u.you,
			S: table.Snapshot,
			to:'chackra',
		}
		Actions['moveCardToZone'](arg);
		arg.S = 'get_S';
		var data = {
			acts : [{'arg':arg, 'act' : 'moveCardToZone'}]
		}
		io.sockets.in(table.room).emit('updact', data);
	} else {
		console.log('bad')
	}
	// TODO возможно надо реагировать
}

function drawCardAtStartTurn(d) {
	var table = StartedGames[d.u.table];
	if (Can.drawCardAtStartTurn({
            Accordance : table.Accordance,
            Known: table.Known,
            pX:d.u.you,
            S:table.Snapshot,
        })) {
		var arg = {
			pX:d.u.you,
			S: table.Snapshot,
			count: 1,
		}
		var drawenCardId = table.Snapshot[d.u.you].deck[0];
		Actions['Draw X cards'](arg);
		arg.S = 'get_S';
	
		var data = {
			upd : {	Accordance:{}, Known:{}	},
			acts : [{'arg':arg, 'act' : 'Draw X cards'}]
		}
		io.sockets.in(table['room'+d.u.opp]).emit('updact', data);
		data.upd.Accordance[drawenCardId] 
			= table[d.u.you].Accordance[drawenCardId] 
			= table.Accordance[drawenCardId];
		data.upd.Known[table.Accordance[drawenCardId]] 
			= table[d.u.you].Known[table.Accordance[drawenCardId]] 
			= table.Known[table.Accordance[drawenCardId]];
		io.sockets.in(table['room'+d.u.you]).emit('updact', data);
	} else {
		console.log('bad')
	}
	// TODO возможно надо реагировать
}

function getUniversalObject(tableID, obj) {
	var table = StartedGames[tableID];
    var res = {
        Accordance : table.Accordance,
        Known : table.Known,
        S : table.Snapshot,
    }
    var obj = obj || {};
    for (var i in obj) {
        res[i] = obj[i];
    }
    return res;
}

function newLeader(d) {
	console.log('on newLeader')
	var table = StartedGames[d.u.table];
	if (Can.newLeader( getUniversalObject(d.u.table, d.arg))) {
		var arg = {
			card : d.arg.cardId,
			team : d.arg.team,
			zone : d.arg.zone,
			pX : d.arg.pX,
			S: table.Snapshot,
		}
		Actions.newLeader(arg);
		arg.S = 'get_S';
	
		var data = {
			acts : [{'arg':arg, 'act' : 'newLeader'}]
		}
		io.sockets.in(table['room']).emit('newLeader', data);
	} else {
		console.log('bad newLeader')
	}
	// TODO возможно надо реагировать
}

function preStackDone(d) {
	console.log('on preStackDone')
	var table = StartedGames[d.u.table];
	table['stackPrep' + d.u.you] = true;
	if (table.stackPreppA && table.stackPreppB) {
		var actReuslt = Actions.preStackDone( table.stackPrep, getUniversalObject(d.u.table, {pX:d.u.you}));
		console.log(actReuslt)
		table.stackPrep = actReuslt;
		table.stackPreppA = table.stackPreppB = null;
		io.sockets.in(table.room).emit('updact', {'stackPrep':actReuslt});
	}
}
