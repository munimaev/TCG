var io;
var gameSocket;
var session_store = {'s':'e'};
var Tables = {
};
var preGamesLobbi = {

}
var StartedGames = {
};
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
    gameSocket.on('lobby:tables', getTables);
    gameSocket.on('lobby:create', lobby_create);
    gameSocket.on('lobby:join', lobby_join);
    gameSocket.on('lobby:delete', lobby_delete);
    gameSocket.on('player:sit', playerSit);
    gameSocket.on('player:unsit', playerUnsit);
    gameSocket.on('imJoined',imJoined);
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
    //-----------------------------------------
    gameSocket.on('server:connected', updServerInfoPage);
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
				StartedGames[id].sesA = Tables[req.toTable].sesA
				StartedGames[id].pB   = ses.login
				StartedGames[id].sesB = req.ses
			} else {
				StartedGames[id].pB   = Tables[req.toTable].pA
				StartedGames[id].sesB = Tables[req.toTable].sesA
				StartedGames[id].pA   = ses.login
				StartedGames[id].sesA = req.ses
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
	if (!(d.b in StartedGames)) StartedGames[d.b] = {};
	var snapshot = getStartSnapshot();
	var needen = false;
	if (StartedGames[d.b].socketA && StartedGames[d.b].socketB ) {
		StartedGames[d.b] = {};
		//console.log(StartedGames[d.b])
	}

	var data = { 
    	snapshot : snapshot,
    	mySocketId: this.id,
    	table: d.b
    };
    if (d.a == "1" ) {
    	data.you = "pB";
    	data.opp = "pA";
    	StartedGames[d.b].socketB = this.id;
    	StartedGames[d.b].room = getRoomNumber(d);
    	StartedGames[d.b].roompB = StartedGames[d.b].room +"_"+this.id;
    	this.join(StartedGames[d.b].room);
    	this.join(StartedGames[d.b].roompB);
    	StartedGames[d.b].snapshot = snapshot;
    	io.sockets.in(StartedGames[d.b].roompB).emit('C_init', data); //TODO отослать только проверенному пользователю
    }
    if (d.a == "2" ) {
    	data.you = "pA";
    	data.opp = "pB";
    	StartedGames[d.b].socketA = this.id;
    	StartedGames[d.b].room = getRoomNumber(d);
    	StartedGames[d.b].roompA = StartedGames[d.b].room +"_"+this.id;
    	this.join(StartedGames[d.b].room);
    	this.join(StartedGames[d.b].roompA);
    	StartedGames[d.b].snapshot = snapshot;
    	io.sockets.in(StartedGames[d.b].roompA).emit('C_init', data); //TODO отослать только проверенному пользователю
    } else {
    	// TODO должно выкинуть в предыдущее окно
    }
    io.sockets.in(StartedGames[d.b].roomS).emit('updServerInfoPage', StartedGames[d.b]);
}

function getRoomNumber(d) {
	if (StartedGames[d.b].room) {
		return StartedGames[d.b].room;
	} else {
		return (( Math.random() * 100000 ) | 0) + "";
	}
}
function imJoined(d) {
		bothIsJoin(d);
}
function bothIsJoin(d) {
	var S = StartedGames[d.table]
	S.isNewGame = true; // TODO определить новая или не новая
	if (S.socketA && S.socketB ) {
		S.accordance = getStartAccordiance();
		S.known = getStartCards();
		S.pA = {accordance:{},known:{}}; S.pB = {accordance:{},known:{}};
		getStartAccordanceKnown(S,'pA');
		getStartAccordanceKnown(S,'pB');
		S.meta = getStartMeta(S);
		io.sockets.in(S.roompA).emit('bothIsJoin', {
			isNewGame: S.isNewGame, 
			accordance:S.pA.accordance,
			known:S.pA.known
		});
		io.sockets.in(S.roompB).emit('bothIsJoin', {
			isNewGame: S.isNewGame, 
			accordance:S.pB.accordance,
			known:S.pB.known
		});
		// TODO нужна комната для наблюдателя
	}
}

function getStartSnapshot() {
	var result = { // as Snapshot
	    activePlayer: 'pA',
	    phase: "start",
	    stop: false,
	    counters : {
	        playedNinjaActivePlayer : 0
	    },
	    pA : {
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
	            }
	        },
	        attack : {
	            team : {}
	        },
	        block : {
	            team : {
	            	// 4:['c005'],
	            	// 5:['c002','c003'],
	            	// 6:['c001','c004','c006']
	            }
	        }
	    },
	    battlefield : {},
	    stack : {

	    },
	    pB : {
	    	rewards : 0,
	    	turnCounter : 0,
	        hand: [],
	        deck: [],
	        chackra : [],
	        discard : [],
            mission : [],
            client : [],
	        village : {
	            team : {}
	        },
	        attack : {
	            team : {
	            	// 1:['c101'],
	            	// 2:['c102','c103'],
	            	// 3:['c104','c105','c106']
	        	}
	        },
	        block : {
	            team : {}
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
	for (var i = 1; i <= 23 ; i++) {
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
	    
	    
	    c101: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 0, si: 0, img: 'n1427' , elements: 'E', name : "Choji Akimichi"  },
	    c102: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 0, si: 0, img: 'n1427' , elements: 'E', name : "Choji Akimichi"  },
	    c103: {owner: 'pA', type: 'N', ec: 0, hc: 0, ah: 3, sh: 0, ai: 0, si: 0, img: 'n1427' , elements: 'E', name : "Choji Akimichi"  },
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
	    c121: {owner: 'pA', type: 'N', ec: 4, hc: 0, ah: 6, sh: 2, ai: 2, si: 0, img: 'n589' , elements: 'EF', name : "Sasuke Uchiha"},
	    c122: {owner: 'pA', type: 'N', ec: 5, hc: 1, ah: 5, sh: 4, ai: 3, si: 2, img: 'pr046' , elements: 'EF', name : "Yamato"},
	    c123: {owner: 'pA', type: 'N', ec: 5, hc: 1, ah: 7, sh: 1, ai: 4, si: 0, img: 'n844' , elements: 'EF', name : "Yugito Ni'i"},
	};
	return C;
}

function getStartMeta(S) {
	var result = {
		toNextPhase : {pA:false,pB:false}, 
		teamCounter:0,
	};

	var pXs = ['pA','pB'];
	var zones = ['village','block', 'attack'];
	for (var pX in pXs) 
		for (var zone in zones)
			for (var number in S.snapshot[pXs[pX]][zones[zone]].team)
				if (result.teamCounter <= number) result.teamCounter = number;

	return result;
}

function getStartAccordiance() {
	var pXs = ['c0','c1'];
	
	var result = {};

	for (var pX in pXs) {
		var keys = [];
		var values = [];
		for (var i = 1; i <= 23 ; i++) {
			keys.push(i < 10 ? '0' + i : ''+i)
			values.push(i < 10 ? '0' + i : ''+i)
		}
		values.sort(  function() { return Math.random()-0.5} )
		
		for (var i in keys) {
			result[pXs[pX] + keys[i]] = pXs[pX] + values[i] 
		};
	}
	console.log(result)


	return result;
}

function getStartAccordanceKnown(S,pX) {
	var result = {};
	if (!S.isNewGame) {
		var zones = [ S.snapshot[pX].hand, S.snapshot.pA.chackra, S.snapshot.pA.discard, S.snapshot.pB.chackra, S.snapshot.pB.discard ]
		for (var zone in zones) {
			for (var card in zones[zone]) {
				oneCardAccordanceКnown(S, zones[zone][card], pX)
			}
		}
		zones = [S.snapshot.pA.village, S.snapshot.pA.block, S.snapshot.pA.attack, S.snapshot.pB.village, S.snapshot.pB.block, S.snapshot.pB.attack ]
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
		S[pX].accordance[card] = S.accordance[card];
		S[pX].known[S[pX].accordance[card]] = S.known[S[pX].accordance[card]];
	}
}

function S_startDrawHand(d) {
	var table = StartedGames[d.u.table];
	var data = {upd:{}};
	// отдать информацию о верхних картах
	data.upd.known = {};
	data.upd.accordance = {};
	var deck = table.snapshot[d.u.you].deck;
	for (var i in deck) {
		if (i > 5 ) break
		data.upd.accordance[deck[i]] 
			= table[d.u.you].accordance[deck[i]] 
			= table.accordance[deck[i]];
		data.upd.known[table.accordance[deck[i]]] 
			= table[d.u.you].known[table.accordance[deck[i]]] 
			= table.known[table.accordance[deck[i]]];
	}
	Actions['Draw 6 cards']({S:table.snapshot, pX:d.u.you});
	io.sockets.in(table['room' + d.u.you]).emit('update', data);
	io.sockets.in(table.room).emit('action', {
		acts: [{'arg':{S:'get_S',pX: d.u.you}, 'act' : 'Draw 6 cards'}]
	});
	io.sockets.in(table.roomS).emit('updServerInfoPage',table);
}

function pressNextBtn(d) {
	if (Can.pressNextBtn({
		pX:d.u.you, 
		Stadies:Stadies,
		S:StartedGames[d.u.table].snapshot,
		meta: StartedGames[d.u.table].meta})) {
		var table = StartedGames[d.u.table];
		table.meta.toNextPhase[d.u.you] = true;
		var data = {
			upd:{meta:table.meta},
			acts : []
		};
		if ((Stadies[table.snapshot.phase].party == 'both' 
			&& table.meta.toNextPhase.pA 
			&& table.meta.toNextPhase.pB
		) || (Stadies[table.snapshot.phase].party == 'attacker' 
			&& table.meta.toNextPhase[table.snapshot.activePlayer]
		) || (Stadies[table.snapshot.phase].party == 'blocker' 
			&& table.meta.toNextPhase[table.snapshot.activePlayer == 'pA' ? 'pB' : 'pA']
		)){
			table.meta.toNextPhase.pA = table.meta.toNextPhase.pB = false;
			Actions['toNextPhase']({S:table.snapshot, Stadies:Stadies, Known:table.known, Accordance:table.accordance});
			data.acts.push({'arg':{S:'get_S', Stadies:'get_Stadies', Known:'get_Known', Accordance:'get_Accordance'}, 'act' : 'toNextPhase'})
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
			Accordance : table.accordance ,
			c1 : {card:d.arg.c1.card} ,
			c2 : {card:d.arg.c1.card} ,
			Known : table.known ,
			pX : d.arg.pX,
			S : table.snapshot,
        })) 
	{
		d.arg.S = table.snapshot;
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
			Accordance : table.accordance ,
			c1 : {card:d.arg.c1.card} ,
			c2 : {card:d.arg.c1.card} ,
			Known : table.known ,
			pX : d.arg.pX,
			S : table.snapshot,
        })) 
	{
		d.arg.S = table.snapshot;
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
	console.log(d.u);
	if (Can.putInPlay({
            Accordance : table.accordance,
            card: d.arg.card,
            Known: table.known,
            owner:d.arg.owner,
            pX:d.u.you,
            S:table.snapshot,
        })) {
		var arg = {
			card:d.arg.card,
			from:d.arg.from,
			owner:d.arg.owner,
			pX:d.u.you,
			S: table.snapshot,
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
		table[d.u.opp].accordance[arg.card] 
			= updA[arg.card] 
			= table.accordance[arg.card];
		table[d.u.opp].known[table.accordance[arg.card]] 
			= updK[table.accordance[arg.card]] 
			= table.known[table.accordance[arg.card]];
		io.sockets.in(table['room'+d.u.opp])
			.emit('update', {
				upd:{
					accordance:updA,
					known:updK
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
            Accordance : table.accordance,
            card: d.arg.card,
            Known: table.known,
            owner:d.arg.owner,
            pX:d.u.you,
            S:table.snapshot,
        })) 
	{
		d.arg.teamCounter = ++table.meta.teamCounter;
		d.arg.S = table.snapshot;
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
            S : table.snapshot,
            Known :  table.known,
            Accordance : table.accordance,
            card : d.arg.card,
            pX :  d.arg.pX,
            team : d.arg.team,
            from : d.arg.from,
            to : d.arg.to,
        })) 
	{
		d.arg.S = table.snapshot;
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
            S:table.snapshot,
            attackTeam : d.arg.attackTeam,
            blockTeam : d.arg.blockTeam,
            pX : d.arg.pX
    })) 
	{	
		d.arg.S = table.snapshot;
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
            Accordance : table.accordance,
            card: d.arg.card,
            Known: table.known,
            owner:d.arg.owner,
            pX:d.u.you,
            S:table.snapshot,
        })) {
		var arg = {
			card:d.arg.card,
			from:d.arg.from,
			owner:d.arg.owner,
			pX:d.u.you,
			S: table.snapshot,
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
