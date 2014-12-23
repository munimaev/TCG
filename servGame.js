var io;
var gameSocket;
var session_store = {
	's': 'e'
};
var Tables = {};
var preGamesLobbi = {}
var StartedGames = {};
var Testing = false;
var Load = true;
exports.StartedGames = StartedGames;
var SesssionTable = {};
var Actions = require('./public/js/G/Actions.js');
var Can = require('./public/js/G/Can.js');
var Stadies = require('./public/js/G/Stadies.js');
var fs = require('fs');
var colors = require('colors');

//console.log(Stadies)

function arraySearch(array, value) {
	for (var i in array) {
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
exports.initLobbi = function(sio, socket, session_store_) {
	io = sio;
	gameSocket = socket;
	session_store = session_store_;
	gameSocket.emit('connected', {
		message: "You are connected!"
	});
	//-----------------------------------------
	gameSocket.on('lobby:tables', getTables);
	gameSocket.on('lobby:games', getGames);
	gameSocket.on('lobby:create', lobby_create);
	gameSocket.on('lobby:join', lobby_join);
	gameSocket.on('lobby:delete', lobby_delete);
	gameSocket.on('player:sit', playerSit);
	gameSocket.on('player:unsit', playerUnsit);
	gameSocket.on('imJoined', imJoined);
	gameSocket.on('newLeader', newLeader);
	gameSocket.on('preStackDone', preStackDone);
	gameSocket.on('addAnswers', addAnswers);
	gameSocket.on('save', saveGame);
	gameSocket.on('getS', getS);
	gameSocket.on('known', known);
	gameSocket.on('activateEffect', activateEffect);
	//gameSocket.on('load',loadGame);
	//-----------------------------------------
	gameSocket.on('initGame', S_init);
	gameSocket.on('startDrawHand', S_startDrawHand);
	gameSocket.on('charge', charge);
	gameSocket.on('pressNextBtn', pressNextBtn);
	gameSocket.on('putInPlay', putInPlay);
	gameSocket.on('playJutsu', playJutsu);
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
		if (Tables[i].sokA == sok) {
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
		if ('socketA' in StartedGames[i] && !StartedGames[i].socketA && 'socketB' in StartedGames[i] && !StartedGames[i].socketB) {
			console.log('DELL')
			console.log('socketA' in StartedGames[i], !StartedGames[i].socketA, 'socketB' in StartedGames[i], !StartedGames[i].socketB)
			delete StartedGames[i];
		}
		if (end) break;
	}
}

function lobby_create(req) {
	var ses = JSON.parse(session_store.sessions[req.ses]);
	for (var i in Tables) {
		if (Tables[i].pA == ses.login || Tables[i].pB == ses.login) {
			return;
		}
	}
	Tables[getNewObjectId(Tables)] = {
		'pA': ses.login,
		'sesA': req.ses,
		'sokA': this.id
	};
	getTables();
}

function lobby_join(req) {
	var ses = JSON.parse(session_store.sessions[req.ses]);
	for (var i in Tables) {
		if (Tables[i].pA == ses.login) {
			req.table = i;
			lobby_delete(req)
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
				SesssionTable[Tables[req.toTable].sesA] = id;
				StartedGames[id].loginB = ses.login;
				StartedGames[id].pB = ses.login;
				StartedGames[id].sesB = req.ses;
				SesssionTable[req.ses] = id;
			} else {
				StartedGames[id].loginB = Tables[req.toTable].pA
				StartedGames[id].pB = Tables[req.toTable].pA
				StartedGames[id].sesB = Tables[req.toTable].sesA
				SesssionTable[Tables[req.toTable].sesA] = id;
				StartedGames[id].loginA = ses.login;
				StartedGames[id].pA = ses.login;
				StartedGames[id].sesA = req.ses;
				SesssionTable[req.ses] = id;
			}
			this.emit('startGame', {
				"key": 'alert'
			})
			io.sockets.in(Tables[req.toTable].sokA).emit('startGame', {
				"key": 'alert'
			});
		}
		req.table = req.toTable;
		lobby_delete(req, true);
	}
	console.log(StartedGames)
}

function lobby_delete(req, forced) {
	var ses = JSON.parse(session_store.sessions[req.ses]);

	if (forced || (Tables[req.table] && (Tables[req.table].pA == ses.login || Tables[req.table].pB == ses.login))

	) {
		delete Tables[req.table];
		getTables();
	}
}

function getNewObjectId(obj) {
	var result = 1;
	while (obj[result]) {
		result++;
	}
	return result;
}

function getTables() {
	var data = {};
	for (var i in Tables) {
		data[i] = {
			pA: Tables[i].pA,
			pB: Tables[i].pB
		}
	}
	io.emit('setTables', data);
}

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

function playerSit(d) {
	if (d.pX) {
		Tables[d.id][d.pX] = d.user;
		if (Tables[d.id].pA && Tables[d.id].pB) {
			// second
			this.emit('sitInLobby', {
				"key": preGamesLobbi[d.id].key
			})
			this.join(preGamesLobbi[d.id].key);
			io.sockets.in(preGamesLobbi[d.id].key).emit('startGame', {
				some: 'data'
			});

		} else {
			// first
			preGamesLobbi[d.id] = {
				key: (Math.random() * 100000) | 0
			};
			this.emit('sitInLobby', {
				"key": preGamesLobbi[d.id].key
			})
			this.join(preGamesLobbi[d.id].key.toString());
		}
	}
	io.emit('setTables', Tables);
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
	io.emit('setTables', Tables);
}

/*
	Server
 */

function updServerInfoPage(d) {
	if (!(d.b in StartedGames)) StartedGames[d.b] = {};
	if (!StartedGames[d.b].roomS) {
		StartedGames[d.b].roomS = StartedGames[d.b].room + "_" + this.id;
		this.join(StartedGames[d.b].roomS);
	}
	var info = StartedGames[d.b]
	this.emit('updServerInfoPage', info);
}

/*
	G
 */

function S_init(d) {
	//console.log('\nS_init')
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
		Snapshot: Snapshot,
		mySocketId: this.id,
		table: tableId
	};
	if (table.sesB == d.ses) {
		data.you = "pB";
		data.opp = "pA";
		StartedGames[tableId].socketB = this.id;
		StartedGames[tableId].room = getRoomNumber(tableId);
		StartedGames[tableId].roompB = StartedGames[tableId].room + "_" + this.id;
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
		StartedGames[tableId].roompA = StartedGames[tableId].room + "_" + this.id;
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
		return ((Math.random() * 100000) | 0) + "";
	}
}

function imJoined(d) {
	// console.log('\nimJoined')
	bothIsJoin(d);
}

function bothIsJoin(d) {
	// console.log('\nbothIsJoin')
	var table = StartedGames[d.table]
		// console.log('table.socketA && table.socketB', table.socketA , table.socketB, table.bothIsJoin, Testing)
	if (table.socketA && table.socketB && !table.bothIsJoin) {
		console.log("Otdal kajdomu")
		table.bothIsJoin = true;
		table.pA = {
			Accordance: {},
			Known: {}
		};
		table.pB = {
			Accordance: {},
			Known: {}
		};
		table.Accordance = getStartAccordiance(table);
		table.Known = getStartCards();
		getStartAccordanceKnown(table, 'pA');
		getStartAccordanceKnown(table, 'pB');
		table.meta = getStartMeta(table);
		var dataTopA = {
				isNewGame: table.Snapshot.pA.isNewGame,
				Accordance: table.pA.Accordance,
				Known: table.pA.Known,
				check: 2
			}
			//console.log(dataTopA)
		io.sockets.in(table.roompA).emit('bothIsJoin', dataTopA);
		var dataTopB = {
				isNewGame: table.Snapshot.pB.isNewGame,
				Accordance: table.pB.Accordance,
				Known: table.pB.Known,
				check: 1
			}
			//console.log(dataTopB)
		io.sockets.in(table.roompB).emit('bothIsJoin', dataTopB);
		// TODO нужна комната для наблюдателя
	} else if (Testing || table.bothIsJoin) {
		// console.log("Otdal odnomu",table[d.you].Accordance)
		io.sockets.in(table['room' + d.you]).emit('bothIsJoin', {
			isNewGame: table.Snapshot[d.you].isNewGame,
			Accordance: table[d.you].Accordance,
			Known: table[d.you].Known
		});
	}
}

function getStartSnapshot(table) {
	if (table.Snapshot) {
		return table.Snapshot;
	}
	if (Load) {
		var obj = JSON.parse(fs.readFileSync(__dirname + '/tmp/my.json', 'utf8'));
		return obj.S;
	}
	var result = { // as Snapshot
		activePlayer: 'pA',
		phase: "mission",
		stop: false,
		turnNumber: 0,
		counters: {
			playedNinjaActivePlayer: 0
		},
		pA: {
			counters: {
				playedMission: 0
			},
			isDrawCardAtStartTurn: false,
			isNewGame: true,
			rewards: 0,
			turnCounter: 0,
			hand: [],
			deck: [],
			chackra: [],
			discard: [],
			mission: [],
			client: [],
			village: {
				team: {}
			},
			attack: {
				team: {}
			},
			block: {
				team: {}
			}
		},
		battlefield: {},
		stack: [],
		pB: {
			counters: {
				playedMission: 0
			},
			isDrawCardAtStartTurn: false,
			isNewGame: true,
			rewards: 0,
			turnCounter: 0,
			hand: [],
			deck: [],
			chackra: [],
			discard: [],
			mission: [],
			client: [],
			village: {
				team: {}
			},
			attack: {
				team: {}
			},
			block: {
				team: {}
			}
		},
		statuses: {}
	};

	var deckpA = [];
	var deckpB = [];



	var pXs = {
		'pA': 'c0',
		'pB': 'c1'
	};
	for (var pX in pXs) {
		var count = 1;
		for (var i in Decks[pX]) {
			for (var j = 1; j <= Decks[pX][i].count; j++) {
				var number = pXs[pX] + (count < 10 ? '0' + count : '' + count);
				result[pX].deck.push(number)
				count++;
			}
		}
	}

	return result;
}

var CardBase = require('./public/js/G/CardBase.js');

var Decks = {
	//earth
	pA: [{
		"count": 2,
		"number": "j517"
	},{
		"count": 2,
		"number": "j697"
	},{
		"count": 2,
		"number": "j710"
	},{
		"count": 2,
		"number": "j890"
	}, {
		"count": 2,
		"number": "m466"
	}, {
		"count": 2,
		"number": "m589"
	}, {
		"count": 2,
		"number": "m673"
	}, {
		"count": 2,
		"number": "m777"
	}, {
		"count": 2,
		"number": "m821"
	}, {
		"count": 2,
		"number": "m859"
	}, {
		"count": 2,
		"number": "n1279"
	}, {
		"count": 2,
		"number": "n1366"
	}, {
		"count": 2,
		"number": "n1423"
	}, {
		"count": 3,
		"number": "n1427"
	}, {
		"count": 1,
		"number": "n1429"
	}, {
		"count": 1,
		"number": "n348"
	}, {
		"count": 1,
		"number": "n515"
	}, {
		"count": 1,
		"number": "n516"
	}, {
		"count": 1,
		"number": "n589"
	}, {
		"count": 1,
		"number": "n699"
	}, {
		"count": 1,
		"number": "n700"
	}, {
		"count": 1,
		"number": "n724"
	}, {
		"count": 1,
		"number": "n823"
	}, {
		"count": 1,
		"number": "n844"
	}, {
		"count": 2,
		"number": "nus014"
	}, {
		"count": 1,
		"number": "pr046"
	}, ],
	//wind
	pB: [{
		"count": 2,
		"number": "j504"
	},{
		"count": 2,
		"number": "j447"
	},{
		"count": 2,
		"number": "j631"
	},{
		"count": 2,
		"number": "j914"
	},{
		"count": 1,
		"number": "j100"
	},{
		"count": 1,
		"number": "m424"
	},{
		"count": 1,
		"number": "m843"
	},{
		"count": 1,
		"number": "m375"
	},{
		"count": 1,
		"number": "m815"
	},{
		"count": 1,
		"number": "m633"
	}, {
		"count": 1,
		"number": "n1086"
	}, {
		"count": 2,
		"number": "n1092"
	}, {
		"count": 2,
		"number": "n1267"
	}, {
		"count": 1,
		"number": "n130"
	}, {
		"count": 2,
		"number": "n1319"
	}, {
		"count": 1,
		"number": "n1321"
	}, {
		"count": 1,
		"number": "n1322"
	}, {
		"count": 2,
		"number": "n1325"
	}, {
		"count": 2,
		"number": "n1418"
	}, {
		"count": 1,
		"number": "n1420"
	}, {
		"count": 2,
		"number": "n1474"
	}, {
		"count": 1,
		"number": "n1481"
	}, {
		"count": 1,
		"number": "n1484"
	}, {
		"count": 1,
		"number": "n180"
	}, {
		"count": 1,
		"number": "n483"
	}, {
		"count": 1,
		"number": "n602"
	}, {
		"count": 2,
		"number": "n847"
	}, {
		"count": 2,
		"number": "nus025"
	}, ]
};

function getStartCards() {
	var result = {};

	
	// 	console.log(CardBase)


	var pXs = {
		'pA': 'c0',
		'pB': 'c1'
	};


	function rec(input, output) {
		for (var i in output) {
			if (typeof output[i] == 'object') {
				if (output[i].length) {
					input[i] = rec([], output[i]);
				}
				else {
					input[i] = rec({}, output[i]);  
				}
			}
			else {
				input[i] = output[i];
			}
		}
		return input;
	}

	var Known = rec({}, CardBase)

	for (var card in Known) {
		if ('effect' in Known[card]){
			for (var type in Known[card]['effect']) {
				for (var subType in Known[card]['effect'][type]) {
					for (var index in Known[card]['effect'][type][subType]) {
						if ('ciclingCheck' in Known[card]['effect'][type][subType][index]) {
							Known[card]['effect'][type][subType][index]['ciclingCheck'] 
								= Actions.setCicling(Known[card]['effect'][type][subType][index]['ciclingCheck']);
						}
					}
				}
			}
		}
	}


	for (var pX in pXs) {
		var oboidennie = [];
		var count = 1;
		for (var i in Decks[pX]) {

			for (var j = 1; j <= Decks[pX][i].count; j++) {
				var number = pXs[pX] + (count < 10 ? '0' + count : '' + count);
				result[number] = {};

				for (var prop in Known[Decks[pX][i].number]) {
					result[number][prop] = Known[Decks[pX][i].number][prop];
				}

				result[number].owner = pX;
				count++;
			}
		}
	}


	

	return result;
}

function getStartMeta(S) {
	if (S.meta) return S.meta;
	var result = {
		toNextPhase: {
			pA: false,
			pB: false
		},
		teamCounter: 0,
	};

	var pXs = ['pA', 'pB'];
	var zones = ['village', 'block', 'attack'];
	for (var pX in pXs)
		for (var zone in zones)
			for (var number in S.Snapshot[pXs[pX]][zones[zone]].team)
				if (result.teamCounter <= number) result.teamCounter = number;
	// console.log(('getStartMeta ' + result.teamCounter).bold)
	return result;
}


function getStartAccordiance(S) {
	if (S.Accordance) return S.Accordance;
	var pXs = {
		'pA': 'c0',
		'pB': 'c1'
	};

	var result = {};

	if (Load) {
		var obj = JSON.parse(fs.readFileSync(__dirname + '/tmp/my.json', 'utf8'));
		return obj.Accordance;
	}

	for (var pX in pXs) {
		var keys = [];
		var values = [];
		var count = 1;
		for (var i in Decks[pX]) {
			for (var j = 1; j <= Decks[pX][i].count; j++) {
				keys.push(count < 10 ? '0' + count : '' + count)
				values.push(count < 10 ? '0' + count : '' + count)
				count++;
			}
		}

		values.sort(function() {
			return Math.random() - 0.5
		})
		for (var i in keys) {
			result[pXs[pX] + keys[i]] = pXs[pX] + values[i];
		};
	}
	console.log(result)
	return result;
}

function getStartAccordanceKnown(Table, pX) {
	// console.log('***getStartAccordanceKnown',!Table.isNewGame)
	var result = {};
	if (!Table.isNewGame) {
		var zones = [
			Table.Snapshot[pX].hand, 
			Table.Snapshot.pA.chackra, 
			Table.Snapshot.pA.discard, 
			Table.Snapshot.pA.mission, 
			Table.Snapshot.pB.chackra, 
			Table.Snapshot.pB.discard, 
			Table.Snapshot.pB.mission
		]
		for (var zone in zones) {
			for (var card in zones[zone]) {
				oneCardAccordanceКnown(Table, zones[zone][card], pX)
			}
		}
		zones = [
			Table.Snapshot.pA.village, 
			Table.Snapshot.pA.block, 
			Table.Snapshot.pA.attack, 
			Table.Snapshot.pB.village, 
			Table.Snapshot.pB.block, 
			Table.Snapshot.pB.attack
		]
		for (var zone in zones) {
			for (var t in zones[zone].team) {
				for (var card in zones[zone].team[t]) {
					oneCardAccordanceКnown(Table, zones[zone].team[t][card], pX)
				}
			}
		}
		// console.log('-> ' + Table.Snapshot.stack )
		for (var card in Table.Snapshot.stack) {
			// console.log('-> ' + Table.Snapshot.stack[card].card )
			oneCardAccordanceКnown(Table, Table.Snapshot.stack[card].card)
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
	var table = StartedGames[d.u.table];
	console.log('startDrawHand', d.u.you, d.u.opp)
	if (!table.Snapshot[d.u.you].isNewGame) return;
	table.Snapshot[d.u.you].isNewGame = false;
	var data = {
		upd: {}
	};
	// отдать информацию о верхних картах
	data.upd.Known = {};
	data.upd.Accordance = {};
	var deck = table.Snapshot[d.u.you].deck;
	for (var i in deck) {
		if (i > 5) break
		data.upd.Accordance[deck[i]] = table[d.u.you].Accordance[deck[i]] = table.Accordance[deck[i]];
		data.upd.Known[table.Accordance[deck[i]]] = table[d.u.you].Known[table.Accordance[deck[i]]] = table.Known[table.Accordance[deck[i]]];
	}

	console.log('OTDAL')

	var actReuslt = {
		'startDrawHand': [{
			player: d.u.you,
			numberOfCard: 6
		}]
	};
	data.stackPrep = actReuslt;
	table.stackPrep = actReuslt;
	table['stackPrep' + d.u.you] = null;
	//io.sockets.in(table.room).emit('updact', data);

	// Actions['Draw X cards']({S:table.Snapshot, pX:d.u.you});
	io.sockets.in(table['room' + d.u.you]).emit('updact', data);
	// io.sockets.in(table['room' + d.u.opp]).emit('updact', {stackPrep:actReuslt});
	// io.sockets.in(table['room' + d.u.you]).emit('update', data);
	// io.sockets.in(table.room).emit('action', {
	// 	acts: [{'arg':{S:'get_S',pX: d.u.you}, 'act' : 'Draw X cards'}]
	// });
	//io.sockets.in(table.roomS).emit('updServerInfoPage',table);
}
/**
 * [pressNextBtn description]
 * @param  {[type]} d [description]
 * @return {[type]} d.u [description]
 * @return {[type]} d.transferInitiativeFrom Этот элемент указывает на то закончил ли игрок ход или просто передал инициативу.
 * Содержит игрока последним передавшим инициативу. Если игрок что то делает в свою инициативу то это значение становиться  null
 * Если что то делает  то pA или pB. Это являеться маркером совершонного действия, если маркер передан,
 * то согласие не переход в селдующую фазу у оппонента снимаеться.
 * а текущему игроу передаеться ответ на сброс флага передачи инициативы.
 * Соотвественно необходимо рассмотреть варинаты
 *
 */
function pressNextBtn(d) {
	if (Can.pressNextBtn({
		pX: d.u.you,
		Stadies: Stadies,
		S: StartedGames[d.u.table].Snapshot,
		meta: StartedGames[d.u.table].meta
	})) {
		var table = StartedGames[d.u.table];
		// console.log('pressNextBtn'.red)
		// console.log(d)
		if (d.transferInitiative) {
			table.meta.toNextPhase[d.u.opp] = false;
		}
		table.meta.toNextPhase[d.u.you] = true;
		var data = {
			upd: {
				meta: table.meta
			},
			acts: [],
			stackPrep: {}
		};
		if ((Stadies[table.Snapshot.phase].party == 'both' && table.meta.toNextPhase.pA && table.meta.toNextPhase.pB) || (Stadies[table.Snapshot.phase].party == 'attacker' && table.meta.toNextPhase[table.Snapshot.activePlayer]) || (Stadies[table.Snapshot.phase].party == 'blocker' && table.meta.toNextPhase[table.Snapshot.activePlayer == 'pA' ? 'pB' : 'pA'])) {
			// console.log("table.Snapshot.stack".red)
			// console.log(table.Snapshot.stack)
			if (table.Snapshot.stack.length) {
				table.meta.toNextPhase.pA = table.meta.toNextPhase.pB = false;
				LoadStack(table);
				var actReuslt = {
					'prepareStartStack': [{}]
				};
				data.stackPrep = actReuslt;
				table.stackPrep = actReuslt;
				table.stackPreppA = table.stackPreppB = null;
				// console.log('table.meta'.red)
				// console.log(table.meta)
			} else {
				table.meta.toNextPhase.pA = table.meta.toNextPhase.pB = false;
				var actReuslt = {
					'toNextPhase': [{
						phase: 'next'
					}]
				};
				data.stackPrep = actReuslt;
				table.stackPrep = actReuslt;
				table.stackPreppA = table.stackPreppB = null;
			}
		} else {
			// console.log("table.Snapshot.stack".red)
			// console.log(table.Snapshot.stack)
			table.meta.toNextPhase[d.u.opp] = false;
			data.acts.push({
				'arg': {},
				'act': 'updTable'
			})
		}
		data.upd.meta = table.meta;
		io.sockets.in(table.room).emit('updact', data);

	} else {}
	// TODO возможно надо реагировать
}

function LoadStack(table) {
	// table.meta.loadStack = true;
	var len = table.Snapshot.stack.length;
	// var jutsuObj = table.Snapshot.stack[ len - 1 ];
	// table.stack.splice(0, 0, {
	// 	resolveJutsuInStack: [jutsuObj]
	// });
	for (var j = table.Snapshot.stack.length - 1; j >= 0; j--) {
		var jutsuObj = table.Snapshot.stack[j];
		table.stack.splice(0, 0, {
			resolveJutsuInStack: [jutsuObj]
		});
	}
	// console.log("\n\ntable.stack")
	// console.log(table.stack)
}

function addToTeam(d) {
	var table = StartedGames[d.u.table];
	//console.log(d.arg)
	if (Can.orgAddToTeam({
		c1: {
			card: d.arg.c1.card
		},
		c2: {
			card: d.arg.c1.card
		},
		pX: d.arg.pX
	}, getUniversalObject(d.u.table))) {
		d.arg.S = table.Snapshot;
		Actions['addToTeam'](d.arg, getUniversalObject(d.u.table));
		d.arg.S = 'get_S';
		var data = {
			acts: [{
				'arg': d.arg,
				'act': 'addToTeam'
			}]
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
		c1: {
			card: d.arg.c1.card
		},
		c2: {
			card: d.arg.c1.card
		},
		pX: d.arg.pX,
	}, getUniversalObject(d.u.table))) {
		d.arg.S = table.Snapshot;
		Actions['organisation'](d.arg, getUniversalObject(d.u.table));
		d.arg.S = 'get_S';
		var data = {
			acts: [{
				'arg': d.arg,
				'act': 'organisation'
			}]
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
		card: d.arg.card,
		owner: d.arg.owner,
		pX: d.u.you,
	}, getUniversalObject(d.u.table))) {
		var args = {
			card: d.arg.card,
			cardInArray: null,
			cause: 'play',
			from: 'hand',
			pX: d.u.you,
			team: null,
		}
		if (table.Known[table.Accordance[d.arg.card]].type == "N") {
			args.to = 'village';
		}
		if (table.Known[table.Accordance[d.arg.card]].type == "M") {
			args.to = 'stack';
		}
		var data = {};
		args.teamCounter = ++table.meta.teamCounter;
		var actReuslt = Actions.preparePutCardinPlay(args, getUniversalObject(d.u.table));
		data.stackPrep = actReuslt;
		table.stackPrep = actReuslt;
		table.stackPreppA = table.stackPreppB = null;
		var upds = getUpdatesForPlayers(table, actReuslt);
		delete actReuslt.applyUpd;

		io.sockets.in(table.roompA).emit('updact', {
			'stackPrep': actReuslt,
			upd: upds.pA
		});
		io.sockets.in(table.roompB).emit('updact', {
			'stackPrep': actReuslt,
			upd: upds.pB
		});

		//io.sockets.in(table.room).emit('updact', data);
	} else {
		console.log('bad putInPlay')
	}
	// TODO возможно надо реагировать
}

function playJutsu(d) {
	var table = StartedGames[d.u.table];
	//console.log(d.u);
	if (Can.playJutsu({
		card: d.arg.card,
		owner: d.arg.owner,
		pX: d.u.you,
	}, getUniversalObject(d.u.table))) {
		var args = {
			card: d.arg.card,
			cause: 'play',
			from: d.arg.from,
			pX: d.u.you,
			to: d.arg.to,
		}
		var data = {};
		var actReuslt = Actions.preparePlayJutsu(args, getUniversalObject(d.u.table));
		data.stackPrep = actReuslt;
		table.stackPrep = actReuslt;
		table.stackPreppA = table.stackPreppB = null;
		var upds = getUpdatesForPlayers(table, actReuslt);
		delete actReuslt.applyUpd;

		io.sockets.in(table.roompA).emit('updact', {
			'stackPrep': actReuslt,
			upd: upds.pA
		});
		io.sockets.in(table.roompB).emit('updact', {
			'stackPrep': actReuslt,
			upd: upds.pB
		});
	} else {
		console.log('bad playJutsu')
	}
}


function removeFromTeam(d) {
	var table = StartedGames[d.u.table];
	if (Can.removeFromTeam({
		Accordance: table.Accordance,
		card: d.arg.card,
		Known: table.Known,
		owner: d.arg.owner,
		pX: d.u.you,
		S: table.Snapshot,
	})) {
		d.arg.teamCounter = ++table.meta.teamCounter;
		d.arg.S = table.Snapshot;
		Actions['removeFromTeam'](d.arg, getUniversalObject(d.u.table));
		d.arg.S = 'get_S';
		var data = {
			acts: [{
				'arg': d.arg,
				'act': 'removeFromTeam'
			}]
		}
		io.sockets.in(table.room).emit('updact', data);
	} else {
		console.log('bad')
	}
	// TODO возможно надо реагировать
}

function moveTeamToAttack(d) {
	var table = StartedGames[d.u.table];
	if (Can.moveTeamToAttack({
		S: table.Snapshot,
		Known: table.Known,
		Accordance: table.Accordance,
		card: d.arg.card,
		pX: d.arg.pX,
		team: d.arg.team,
		from: d.arg.from,
		to: d.arg.to,
	})) {
		d.arg.S = table.Snapshot;
		Actions['moveTeamToAttack'](d.arg);
		d.arg.S = 'get_S';
		var data = {
			acts: [{
				'arg': d.arg,
				'act': 'moveTeamToAttack'
			}]
		}
		io.sockets.in(table.room).emit('updact', data);
	} else {
		console.log('moveTeamToAttack bad')
	}
	// TODO возможно надо реагировать
}

function block(d) {
	var table = StartedGames[d.u.table];
	if (Can.block({
		S: table.Snapshot,
		attackTeam: d.arg.attackTeam,
		blockTeam: d.arg.blockTeam,
		pX: d.arg.pX
	})) {
		d.arg.S = table.Snapshot;
		Actions['block'](d.arg);
		d.arg.S = 'get_S';
		var data = {
			acts: [{
				'arg': d.arg,
				'act': 'block'
			}]
		}
		io.sockets.in(table.room).emit('updact', data);
	} else {
		console.log('block bad')
	}
	// TODO возможно надо реагировать
}

function charge(d) {
	var table = StartedGames[d.u.table];
	if (Can.charge({
		card: d.arg.card,
		owner: d.arg.owner,
		pX: d.u.you,
	}, getUniversalObject(d.u.table))) {
		var args = {
				card: d.arg.card,
				cardInArray: null,
				cause: 'charge',
				from: 'hand',
				pX: d.u.you,
				team: null,
				to: 'chackra',
			}
			// Actions['moveCardToZone'](arg);
			// arg.S = 'get_S';
			// var data = {
			// 	acts : [{'arg':arg, 'act' : 'moveCardToZone'}]
			// }
			// io.sockets.in(table.room).emit('updact', data);

		var data = {};
		var actReuslt = Actions.prepareCharge(args, getUniversalObject(d.u.table));
		data.stackPrep = actReuslt;
		table.stackPrep = actReuslt;
		table.stackPreppA = table.stackPreppB = null;
		var upds = getUpdatesForPlayers(table, actReuslt);
		delete actReuslt.applyUpd;

		io.sockets.in(table.roompA).emit('updact', {
			'stackPrep': actReuslt,
			upd: upds.pA
		});
		io.sockets.in(table.roompB).emit('updact', {
			'stackPrep': actReuslt,
			upd: upds.pB
		});

	} else {
		console.log('bad')
	}
	// TODO возможно надо реагировать
}

function activateEffect(d) {
	console.log(('-> ' + d.arg.card + ' ' + d.arg.effectKey).cyan)
	var o = getUniversalObject(d.u.table);
	if (o.Known[o.Accordance[d.arg.card]]
		&& o.Known[o.Accordance[d.arg.card]].effect
		&& o.Known[o.Accordance[d.arg.card]].effect.activate
		&& o.Known[o.Accordance[d.arg.card]].effect.activate[d.arg.effectKey]
		&& o.Known[o.Accordance[d.arg.card]].effect.activate[d.arg.effectKey].can
	){
		var canResult = o.Known[o.Accordance[d.arg.card]].effect.activate[d.arg.effectKey].can(d.arg, o);
		if (!canResult.result) {
			console.log(canResult.cause.red)
			return;
		}
		

		var table = StartedGames[d.u.table];
		var data = {};
		var actReuslt = o.Known[o.Accordance[d.arg.card]].effect.activate[d.arg.effectKey].prepareEffect(d.arg, o);
		data.stackPrep = actReuslt;
		table.stackPrep = actReuslt;
		table.stackPreppA = table.stackPreppB = null;
		var upds = getUpdatesForPlayers(table, actReuslt);
		// console.log('upds',upds)
		delete actReuslt.applyUpd;
		var dataA = {
			'stackPrep': actReuslt,
		};
		if (upds && upds.pA) {
			dataA.upd = upds.pA
		}
		// console.log('dataA',dataA)
		io.sockets.in(table.roompA).emit('updact', dataA);

		var dataB = {
			'stackPrep': actReuslt,
		};
		if (upds && upds.pB) {
			dataB.upd = upds.pB
		}
		// console.log('dataB',dataB)
		io.sockets.in(table.roompB).emit('updact', dataB);

	}
	else {
		return;
	} 
}

function drawCardAtStartTurn(d) {
	var table = StartedGames[d.u.table];
	if (Can.drawCardAtStartTurn({
		Accordance: table.Accordance,
		Known: table.Known,
		pX: d.u.you,
		S: table.Snapshot,
	})) {
		var arg = {
			pX: d.u.you,
			S: table.Snapshot,
			count: 1,
		}
		var drawenCardId = table.Snapshot[d.u.you].deck[0];
		Actions['Draw X cards'](arg);
		arg.S = 'get_S';

		var data = {
			upd: {
				Accordance: {},
				Known: {}
			},
			acts: [{
				'arg': arg,
				'act': 'Draw X cards'
			}]
		}
		io.sockets.in(table['room' + d.u.opp]).emit('updact', data);
		data.upd.Accordance[drawenCardId] = table[d.u.you].Accordance[drawenCardId] = table.Accordance[drawenCardId];
		data.upd.Known[table.Accordance[drawenCardId]] = table[d.u.you].Known[table.Accordance[drawenCardId]] = table.Known[table.Accordance[drawenCardId]];
		io.sockets.in(table['room' + d.u.you]).emit('updact', data);
	} else {
		console.log('bad')
	}
	// TODO возможно надо реагировать
}
/**
 * Возвращает "универсальный объект". в этом объекте храняться как снимок игры 
 * так и данные карт 
 * @param  {Number} tableID индификатор стола
 * @param  {Object} obj     Необязательный параметр свойства которого будут 
 * добавлены в возвражемый объект. 
 * @return {Object} 
 * {\n
 *    Accordance: table.Accordance,\n
 *	  Known: table.Known,\n
 *	  S: table.Snapshot,\n
 * 	  Meta: table.Meta,\n
 * 	  Stadies: Stadies,\n
 * } \n
 */
function getUniversalObject(tableID, obj) {
	var table = StartedGames[tableID];
	var res = {
		Accordance: table.Accordance,
		Known: table.Known,
		S: table.Snapshot,
		Meta: table.meta,
		Stadies: Stadies,
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
	if (Can.newLeader(getUniversalObject(d.u.table, d.arg))) {
		var arg = {
			card: d.arg.cardId,
			team: d.arg.team,
			zone: d.arg.zone,
			pX: d.arg.pX,
			S: table.Snapshot,
		}
		Actions.newLeader(arg);
		arg.S = 'get_S';

		var data = {
			acts: [{
				'arg': arg,
				'act': 'newLeader'
			}]
		}
		io.sockets.in(table['room']).emit('newLeader', data);
	} else {
		console.log('bad newLeader')
	}
	// TODO возможно надо реагировать
}


function addAnswers(d) {
	var table = StartedGames[d.u.table];
	if (d.answers) {
		if (!('answers' in table)) table.answers = {};
		for (var i in d.answers) {
			if (!(i in table.answers)) table.answers[i] = [];
			table.answers[i] = table.answers[i].concat(d.answers[i])
		}
	}
}

function addStack(table, actReuslt) {
	if ('toStack' in actReuslt) {
		if (!('stack' in table)) table.stack = [];
		table.stack = table.stack.concat(actReuslt.toStack);
		delete actReuslt.toStack;
	}
	for (var i = table.stack.length; i >= 0; i--) {
		var isEmpty = true;
		for (var j in table.stack[i]) {
			isEmpty = false;
			break;
		}
		if (isEmpty) {
			table.stack.splice(i, 1);
		}
	}
	return actReuslt;
}

function getUpdatesForPlayers(table, actReuslt) {
	var result = {};
	if (!actReuslt.applyUpd) return null;
	console.log('\ngetUpdatesForPlayers'.cyan);
	console.log(actReuslt.applyUpd);
	var obj = {};

	for (var i in actReuslt.applyUpd) {
		obj = actReuslt.applyUpd[i];
		if (obj.S) {
			if (!result.pA) {
				result.pA = {};
			}
			if (!result.pB) {
				result.pB = {};
			}
			result.pA.S = obj.S;
			result.pB.S = obj.S;
		}
		else {
			if (!(obj.forPlayer in result)) result[obj.forPlayer] = {
				Accordance: {},
				Known: {}
			};
			for (var card in obj.cards) {

				result[obj.forPlayer].Accordance[obj.cards[card]] 
					= table[obj.forPlayer].Accordance[obj.cards[card]] 
					= actReuslt.applyUpd[i].unknown ? null : table.Accordance[obj.cards[card]];

				result[obj.forPlayer].Known[table.Accordance[obj.cards[card]]] 
					= table[obj.forPlayer].Known[table.Accordance[obj.cards[card]]] 
					= actReuslt.applyUpd[i].unknown ? null : table.Known[table.Accordance[obj.cards[card]]];
			}
		}
	}
	console.log(result)
	delete actReuslt.applyUpd;
	return result;
}

function preStackDone(d) {
	var table = StartedGames[d.u.table];
	var logThis = true;
	// console.log('on preStackDone' , table.stackPreppA , table.stackPreppB)
	table['stackPrep' + d.u.you] = true;

	addAnswers(d)

	if (table.stackPreppA && table.stackPreppB) {
		var count = 0;

		if (logThis) console.log("\n================".green)
		for (var i in table.stackPrep) {
			if (i == 'afterQuestion' || i == 'befor' || i == 'updTable' || !table.stackPrep[i].length) {
				// console.log('del ' + i)
				delete table.stackPrep[i];
				continue;
			}
			count++;
		}

		if (!count) {
			//table.stackPrep = table.stack.pop();
		}
		if (logThis) console.log('table.stackPrep'.green)
		if (logThis) console.log(table.stackPrep)

		for (var i in getUniversalObject(d.u.table, {
			pX: d.u.you
		}).S) {
			//console.log('+'+i)
		}

		var actReuslt = Actions.preStackDone(table, getUniversalObject(d.u.table, {
			pX: d.u.you
		}));
		table.answers = {}
		if (logThis) console.log('actReuslt'.green);
		if (logThis) console.log(actReuslt)
		actReuslt = addStack(table, actReuslt);
		if (logThis) console.log('table.stack'.green);
		if (logThis) console.log(table.stack)

		var upds = getUpdatesForPlayers(table, actReuslt);
		if (actReuslt.befor) {
			var updsBeafor = getUpdatesForPlayers(table, actReuslt.befor);
			for (var pX in updsBeafor) {
				if (!upds) upds = {};
				if (!(pX in upds)) upds[pX] = {};
				for (var i in updsBeafor[pX]) {
					if (!(i in upds[pX])) upds[pX][i] = {};
					for (var j in updsBeafor[pX][i]) {
						upds[pX][i][j] = updsBeafor[pX][i][j]
					}
				}
			}
		}
		delete actReuslt.applyUpd;

		if (logThis) console.log('upds'.green);
		if (logThis) console.log(upds);
		// if (logThis) console.log('toClient'.green);
		// if (logThis) console.log(actReuslt);

		table.stackPrep = actReuslt;
		table.stackPreppA = table.stackPreppB = null;

		var stackPrepIsEmpty = true;
		for (var i in actReuslt) {
			stackPrepIsEmpty = false;
		}


		if (stackPrepIsEmpty && table.stack.length) {
			table.stackPrep = table.stack.pop();
			actReuslt = table.stackPrep;
			stackPrepIsEmpty = false;

			upds = getUpdatesForPlayers(table, actReuslt);
			delete actReuslt.applyUpd;
		}

		if (logThis) console.log('toClient2'.green);
		if (logThis) console.log(actReuslt);
		if (logThis) console.log(('stackPrepIsEmpty = ' + stackPrepIsEmpty).green);
		if (logThis) console.log("================".green)

		if (stackPrepIsEmpty) {
			table.actionLock = true;
			io.sockets.in(table.room).emit('updact', {
				acts: [{
					'arg': {
						lock: false
					},
					'act': 'actionLock'
				}]
			});
		} else {
			if (upds) {
				//if (logThis) console.log(' -> 1', upds.pB)
				io.sockets.in(table.roompA).emit('updact', {
					acts: [{
						'arg': {
							lock: true
						},
						'act': 'actionLock'
					}],
					'stackPrep': actReuslt,
					upd: upds.pA
				});
				io.sockets.in(table.roompB).emit('updact', {
					acts: [{
						'arg': {
							lock: true
						},
						'act': 'actionLock'
					}],
					'stackPrep': actReuslt,
					upd: upds.pB
				});
			} else {
				if (logThis) console.log(' -> 2')
				io.sockets.in(table.room).emit('updact', {
					acts: [{
						'arg': {
							lock: true
						},
						'act': 'actionLock'
					}],
					'stackPrep': actReuslt,
					ket: 3
				});
			}
		}
	}
}

function saveGame(d) {
	var table = StartedGames[d.u.table];
	var outputFilename = __dirname + '/tmp/my.json';
	var toSave = {
		S: table.Snapshot,
		Accordance: table.Accordance
		//K :  table.Known
	}
	fs.writeFile(outputFilename, JSON.stringify(toSave, null, 4), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("JSON saved to " + outputFilename);
		}
	});
}
function getS(d) {
	var table = StartedGames[d.u.table];
	io.sockets.in(table.room).emit('getS',  table.Snapshot);
}
function known(d) {
	var table = StartedGames[d.u.table];
	if (d.args.card)
	io.sockets.in(table.room).emit('known',  table.Known[table.Accordance[d.args.card]]);
	else
	io.sockets.in(table.room).emit('known',  table.Known);
}
