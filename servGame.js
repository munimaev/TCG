var io;
var gameSocket;
var Tables = {
    "123" : { pA: null, pB:null },
    "456" : { pA: null, pB:null },
    "789" : { pA: null, pB:null }
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
exports.initLobbi = function(sio, socket){
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "You are connected!" });
    gameSocket.on('lobby:tables', getTables);
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


function getTables() {
    io.emit('setTables',Tables);
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
	S.isNewGame = false; // TODO определить новая или не новая
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
	    activePlayer: 'pB',
	    phase: "block",
	    counters : {
	        playedNinjaActivePlayer : 0
	    },
	    pA : {
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
	            	4:['c007','c005'],
	            	5:['c002','c003'],
	            	6:['c004','c006']
	            }
	        }
	    },
	    battlefield : {1:5,2:6,3:4},
	    stack : {

	    },
	    pB : {
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
	            	1:['c107'],
	            	2:['c102','c103'],
	            	3:['c104','c105','c106']
	        	}
	        },
	        block : {
	            team : {}
	        }
	    },
	    statuses : {
	    	
	    }
	};
	var pu;
	for (var i = 7; i <= 50 ; i++) {
		pu = i < 10 ? "0"+i : i;
		result.pA.deck.push('c1' + pu )
		result.pB.deck.push('c0' + pu )
	}
	return result;
}

function getStartCards() {
	var C = { // as Construcors
		//Gaara
	    c001: {owner: 'pA', type: 'N', ah: 2, sh: 0, ai: 2, si: 0, img: 'n1092' , elements: 'W', name : "Kankuro" },
	    c002: {owner: 'pA', type: 'N', ah: 2, sh: 0, ai: 2, si: 0, img: 'n1092' , elements: 'W', name : "Kankuro" },
	    c003: {owner: 'pA', type: 'N', ah: 3, sh: 0, ai: 0, si: 0, img: 'n847' , elements: 'W', name : "Mizuki (Childhood)" },
	    c004: {owner: 'pA', type: 'N', ah: 3, sh: 0, ai: 0, si: 0, img: 'n847' , elements: 'W', name : "Mizuki (Childhood)" },
	    c005: {owner: 'pA', type: 'N', ah: 2, sh: 0, ai: 1, si: 0, img: 'n602' , elements: 'W', name : "Matsuri" },
	    c006: {owner: 'pA', type: 'N', ah: 0, sh: 2, ai: 0, si: 1, img: 'n1474' , elements: 'W', name : "Epidemic Prevention Officer" },
	    c007: {owner: 'pA', type: 'N', ah: 0, sh: 2, ai: 0, si: 1, img: 'n1474' , elements: 'W', name : "Epidemic Prevention Officer" },
	    c008: {owner: 'pA', type: 'N', ah: 3, sh: 3, ai: 2, si: 2, img: 'n1321' , elements: 'W', name : "Crow" },
	    c009: {owner: 'pA', type: 'N', ah: 0, sh: 2, ai: 0, si: 0, img: 'n1319' , elements: 'W', name : "Yaoki" },
	    c015: {owner: 'pA', type: 'N', ah: 0, sh: 2, ai: 0, si: 0, img: 'n1319' , elements: 'W', name : "Yaoki" },
	    c010: {owner: 'pA', type: 'N', ah: 0, sh: 2, ai: 0, si: 0, img: 'nus025' , elements: 'W', name : "Temari" },
	    c011: {owner: 'pA', type: 'N', ah: 0, sh: 2, ai: 0, si: 0, img: 'nus025' , elements: 'W', name : "Temari" },
	    c012: {owner: 'pA', type: 'N', ah: 0, sh: 3, ai: 0, si: 1, img: 'n1322' , elements: 'W', name : "Black Ant" },
	    c013: {owner: 'pA', type: 'N', ah: 0, sh: 3, ai: 0, si: 1, img: 'n1086' , elements: 'W', name : "Crow" },
	    c014: {owner: 'pA', type: 'N', ah: 3, sh: 2, ai: 1, si: 1, img: 'n180' , elements: 'W', name : "Yashamaru" },
	    c016: {owner: 'pA', type: 'N', ah: 1, sh: 3, ai: 1, si: 3, img: 'n1325' , elements: 'W', name : "Salamander" },
	    c017: {owner: 'pA', type: 'N', ah: 1, sh: 3, ai: 1, si: 3, img: 'n1325' , elements: 'W', name : "Salamander" },
	    c018: {owner: 'pA', type: 'N', ah: 5, sh: 1, ai: 5, si: 0, img: 'n1267' , elements: 'W', name : "Gaara of the Desert" },
	    c019: {owner: 'pA', type: 'N', ah: 5, sh: 1, ai: 5, si: 0, img: 'n1267' , elements: 'W', name : "Gaara of the Desert" },
	    c020: {owner: 'pA', type: 'N', ah: 3, sh: 3, ai: 3, si: 3, img: 'n1418' , elements: 'W', name : "Chiyo" },
	    c021: {owner: 'pA', type: 'N', ah: 3, sh: 3, ai: 3, si: 3, img: 'n1418' , elements: 'W', name : "Chiyo" },
	    c022: {owner: 'pA', type: 'N', ah: 3, sh: 3, ai: 3, si: 2, img: 'n1481' , elements: 'WE', name : "Kankuro" },
	    c023: {owner: 'pA', type: 'N', ah: 5, sh: 4, ai: 0, si: 3, img: 'n1484' , elements: 'W', name : "Temari" },
	    c024: {owner: 'pA', type: 'N', ah: 5, sh: 4, ai: 2, si: 3, img: 'n1420' , elements: 'W', name : "Sasori" },
	    c025: {owner: 'pA', type: 'N', ah: 5, sh: 1, ai: 3, si: 1, img: 'n130' , elements: 'W', name : "Баки" },
	    c026: {owner: 'pA', type: 'N', ah: 6, sh: 2, ai: 4, si: 2, img: 'n483' , elements: 'W', name : "Gaara of the Desert" },
	    
	    
	    c101: {owner: 'pB', type: 'N', ah: 3, sh: 0, ai: 0, si: 0, img: 'n1427' , elements: 'E', name : "Choji Akimichi"  },
	    c102: {owner: 'pB', type: 'N', ah: 3, sh: 0, ai: 0, si: 0, img: 'n1427' , elements: 'E', name : "Choji Akimichi"  },
	    c103: {owner: 'pB', type: 'N', ah: 3, sh: 0, ai: 0, si: 0, img: 'n1427' , elements: 'E', name : "Choji Akimichi"  },
	    c104: {owner: 'pB', type: 'N', ah: 3, sh: 0, ai: 2, si: 0, img: 'n1423' , elements: 'E', name : "Neji Hyuga"  },
	    c105: {owner: 'pB', type: 'N', ah: 3, sh: 0, ai: 2, si: 0, img: 'n1423' , elements: 'E', name : "Neji Hyuga"  },
	    c106: {owner: 'pB', type: 'N', ah: 3, sh: 0, ai: 2, si: 0, img: 'n1423' , elements: 'E', name : "Neji Hyuga"  },
	    c107: {owner: 'pB', type: 'N', ah: 0, sh: 0, ai: 0, si: 0, img: 'n699' , elements: 'E', name : "Koharu Utatane (Childhood)"  },
	    c108: {owner: 'pB', type: 'N', ah: 0, sh: 0, ai: 0, si: 0, img: 'n700' , elements: 'E', name : "Homura Mitomon (Childhood)"  },
	    c109: {owner: 'pB', type: 'N', ah: 0, sh: 2, ai: 0, si: 0, img: 'n1272' , elements: 'E', name : "Shiho"  },
	    c110: {owner: 'pB', type: 'N', ah: 0, sh: 2, ai: 0, si: 0, img: 'nus014' , elements: 'E', name : "Shikamaru Nara"  },
	    c111: {owner: 'pB', type: 'N', ah: 0, sh: 2, ai: 0, si: 0, img: 'nus014' , elements: 'E', name : "Shikamaru Nara"  },
	    c112: {owner: 'pB', type: 'N', ah: 1, sh: 1, ai: 1, si: 1, img: 'n348' , elements: 'E', name : "Tenten"  },
	    c113: {owner: 'pB', type: 'N', ah: 0, sh: 2, ai: 0, si: 1, img: 'n724' , elements: 'E', name : "Yoshino Nara"},
	    c113: {owner: 'pB', type: 'N', ah: 0, sh: 2, ai: 0, si: 1, img: 'n724' , elements: 'E', name : "Yoshino Nara"},
	    c114: {owner: 'pB', type: 'N', ah: 2, sh: 2, ai: 1, si: 2, img: 'n1429' , elements: 'E', name : "Hinata Hyuga"},
	    c115: {owner: 'pB', type: 'N', ah: 2, sh: 2, ai: 1, si: 2, img: 'n1366' , elements: 'E', name : "Foo"},
	    c116: {owner: 'pB', type: 'N', ah: 2, sh: 2, ai: 1, si: 2, img: 'n1366' , elements: 'E', name : "Foo"},
	    c117: {owner: 'pB', type: 'N', ah: 2, sh: 2, ai: 1, si: 2, img: 'n823' , elements: 'E', name : "Asuma Sarutobi"},
	    c118: {owner: 'pB', type: 'N', ah: 2, sh: 2, ai: 1, si: 2, img: 'n1279' , elements: 'E', name : "Inoichi Yamanaka"},
	    c119: {owner: 'pB', type: 'N', ah: 2, sh: 2, ai: 1, si: 2, img: 'n515' , elements: 'E', name : "Shikaku Nara"},
	    c120: {owner: 'pB', type: 'N', ah: 2, sh: 2, ai: 1, si: 2, img: 'n516' , elements: 'E', name : "Choza Akimichi"},
	    c121: {owner: 'pB', type: 'N', ah: 2, sh: 2, ai: 1, si: 2, img: 'n589' , elements: 'F', name : "Sasuke Uchiha"},
	    c122: {owner: 'pB', type: 'N', ah: 2, sh: 2, ai: 1, si: 2, img: 'pr046' , elements: 'F', name : "Yamato"},
	    c123: {owner: 'pB', type: 'N', ah: 2, sh: 2, ai: 1, si: 2, img: 'n844' , elements: 'F', name : "Yugito Ni'i"},
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
	var result = {
		c101 : 'c107',
		c102 : 'c106',
		c103 : 'c105',
		c104 : 'c104',
		c105 : 'c103',
		c106 : 'c102',
		c107 : 'c101',
		c001 : 'c001',
		c002 : 'c002',
		c003 : 'c003',
		c004 : 'c004',
		c005 : 'c005',
		c006 : 'c006',
		c007 : 'c007',
	};

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
