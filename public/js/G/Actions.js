function isZoneSimple(name) {
	if (name == 'deck' || name == 'discard' || name == 'chackra' || name == 'hand' || name == 'stack' || name == 'mission') {
		return true;
	}
	return false;
}

function arraySearch(array, value) {
	for (var i in array) {
		if (array[i] == value) {
			return i;
		}
	}
	return null
}
var Actions = {
	'Draw Card': function(args, o) {
		//for (var i in o) 
		//console.log(i)
		var S = o.S;
		var pX = args.player;
		var draedCards = [];
		if (S[pX].deck.length) {
			var id = S[pX].deck.splice(0, 1)[0]
			S[pX].hand.push(id);
			return id;
		};
		console.log('hand', o.S[pX].hand)
	},
	/**
	 * Возврашает обект с приготовленными дейстиями
	 * @param  {[type]} args обект с а аргументами
	 * @param  {[type]} args.numberOfCard
	 * @param  {[type]} args.player
	 * @param  {[type]} o	стандартный объект
	 * @return {[type]}	  [description]
	 */
	'Draw X cards': function(args, o) {
		args.numberOfCard = args.numberOfCard || 1;
		var o2 = {
			pX: args.player,
			cards: []
		};
		for (var i = 1; i <= args.numberOfCard; i++) {
			o2.cards.push(Actions['Draw Card'](args, o));
		}
		o.S[args.player].isNewGame = false;
		if (!module) {
			AnimationPush({
				func: function() {
					AN.playerDrawCards(o2);
				},
				time: 1500,
				name: 'Draw X cards'
			});
			setTimeout(AN.preStack.countDown, 1510);
		}
		return {
			//'endGame' : [{player: args.player, condition:'lose', cause:'empty deck'}]
		}
	},
	/**
	 * [description]
	 * @param  {[type]} args Объект с аргументами
	 * @param  {[type]} args.phase Значение может быть либо "next" либо название фазы в которую надо перейти.
	 * @param  {[type]} o	Универсальный объект
	 * @return {[type]}	  [description]
	 */
	'toNextPhase': function(args, o) {
		var key = -1;
		for (var i in o.Stadies.order) {
			if (o.Stadies.order[i] == o.S.phase) {
				key = i;
				break;
			}
		}
		var newKey = Number(key) + 1;


		if (newKey >= o.Stadies.order.length) {
			newKey = 0;
			o.S[o.S.activePlayer].turnCounter = o.S[o.S.activePlayer].turnCounter + 1;
			o.S.activePlayer = o.S.activePlayer == 'pA' ? 'pB' : 'pA';
			o.S.counters.playedNinjaActivePlayer = 0;
			o.S.pA.counters.playedMission = 0;
			o.S.pB.counters.playedMission = 0;
		}
		//console.log(o.S.phase + ' -> ' + o.Stadies.order[newKey])
		o.S.phase = o.Stadies.order[newKey];
		if (o.S.phase == 'attack') {
			var count = 0;
			for (var i in o.S[o.S.activePlayer].village.team) {
				count++;
			}
			if (!count) return Actions.toNextPhase(args, o);

		}
		if (o.S.phase == 'block') {
			var count = 0;
			for (var i in o.S[o.S.activePlayer == 'pA' ? 'pB' : 'pA'].village.team) {
				count++;
			}
			if (!count) return Actions.toNextPhase(args, o);
		}

		if (module) {
			if (o.S.phase + 'AtStart' in Actions) {
				return Actions[o.S.phase + 'AtStart'](o);
			}
		} else {
			//updCurrentPhase();
			AN.changePahseName(Stadies[o.S.phase].rusName, AN.preStack.countDown);
			if (Can.pressNextBtn({
				pX: you,
				S: S,
				meta: Meta,
				Stadies: Stadies
			})) {
				H.next.removeClass('selectedZone');
			} else {
				H.next.addClass('selectedZone');
			}
		}
	},
	/**
	 * [description]
	 * @param  {[type]} args [description]
	 * @param  {[type]} args.pX [description]
	 * @param  {[type]} args.card [description]
	 * @param  {[type]} args.cause [description]
	 * @param  {[type]} args.from [description]
	 * @param  {[type]} args.to [description]
	 * @param  {[type]} args.team [description]
	 * @param  {[type]} o	[description]
	 * @return {[type]}	  [description]
	 */
	'moveCardToZone': function(args, o) {
		// console.log('Move Card TO Zone')
		// console.log(args, isZoneSimple(args.from),args.from)
		var result = {
			updTable: [],
		};

		if (args.cause == 'play') {
			if (o.Known[o.Accordance[args.card]].type == 'N') {
				o.S.counters.playedNinjaActivePlayer = o.S.counters.playedNinjaActivePlayer + 1;
			}
			if (o.Known[o.Accordance[args.card]].type == 'M') {
				o.S[args.pX].counters.playedMission += 1;
			}
		}

		// console.log(isZoneSimple(args.from))
		if (!isZoneSimple(args.from)) {

			result.updTable[0] = {};

			if (isZoneSimple(args.to)) {
				// console.log('h->s')
				o.S[args.pX][args.from].team[args.team].splice(args.cardInArray, 1);
				if (args.options && args.options.moveTo && args.options.moveTo == 'top') {
					o.S[args.pX][args.to].splice(0, 0, args.card)
				} else {
					o.S[args.pX][args.to].push(args.card);
				}
				o.S.statuses[args.card] = {};

				if (!module) {
					C[args.card].params.zona = args.to;
					AnimationPush({
						func: function() {
							AN.moveCardToZone(args, o);
						},
						time: 760,
						name: 'moveCardToZone'
					});
				}
			} else if (!isZoneSimple(args.from)) {

				// console.log('h->h')

			}
			if (!o.S[args.pX][args.from].team[args.team].length) {
				delete o.S[args.pX][args.from].team[args.team];
				for (var i in o.S.battlefield) {
					if (i == args.team || o.S.battlefield[i] == args.team) {
						delete o.S.battlefield[i];
					}
				}
			}
		} else if (isZoneSimple(args.from)) {
			// console.log(args.pX, args.from, args.card)
			if (args.from == 'stack') {
				var ind = true;
				result.updTable[0] = {};
			} else {
				var ind = arraySearch(o.S[args.pX][args.from], args.card);
			}
			// console.log('IND', ind)
			if (ind !== null) {
				if (args.from == 'stack') {
					for (var i in o.S.stack) {
						if (o.S.stack[i].card == args.card) {
							o.S.stack.splice(i, 1);
							break;
						}
					}
				} else {
					o.S[args.pX][args.from].splice(ind, 1)
				}

				if (isZoneSimple(args.to)) {
					// console.log('s->s')
					if (args.to == 'stack') {
						o.S.stack.push({
							card: args.card,
							user: args.user,
							target: args.target,
							owner: args.pX
						})
					} else {
						if (args.options && args.options.moveTo && args.options.moveTo == 'top') {
							o.S[args.pX][args.to].splice(0, 0, args.card)
						} else {
							o.S[args.pX][args.to].push(args.card);
						}
					}
					if (!module) {
						C[args.card].params.zona = args.to;
						AnimationPush({
							func: function() {
								AN.moveCardToZone(args, o);
								AN.moveToHand(o);
							},
							time: 760,
							name: 'moveCardToZone'
						});
					}
					// console.log("\n\n\nSTACK")
					// console.log(o.S.stack)
				} else if (!isZoneSimple(args.to)) {
					// console.log('s->h')

					result.updTable[0] = {};

					Actions.createTeamFromCard(args, o);
					if (!module) {
						C[args.card].params.zona = args.to;
						AnimationPush({
							func: function() {
								AN.moveCardToZone(args, o);
								AN.moveToHand(o);
							},
							time: 760,
							name: 'moveCardToZone'
						});
					}
				}
			}
		}
		if (module) result = Actions.addTriggerEffect(result, 'moveCardToZone', args, o);
		if (!result.updTable.length) delete result.updTable;
		return result;
	},
	'addConditionalEffect': function(result, trigger, args, o) {},
	'addTriggerEffect': function(result, trigger, args, o) {
		for (var i in o.Known) {
			if (o.Known[i].effect && o.Known[i].effect.trigger && o.Known[i].effect.trigger[trigger]) {
				console.log('card >-< ' + i)
				for (var i2 in o.Known[i].effect.trigger[trigger]) {
					if (o.Known[i].effect.trigger[trigger][i2].condition(args, o)) {
						console.log('effect >-< ' + i2)
						result = o.Known[i].effect.trigger[trigger][i2].result(result, args, o)
					}
				}
			}
		}
		return result;
	},
	'preparePutCardinPlay': function(args, o) {
		return {
			'putCardInPlay': [{
				pX: args.pX,
				from: args.from,
				to: args.to,
				card: args.card,
				cause: args.cause,
				teamCounter: args.teamCounter
			}],
			'applyUpd': [{
				forPlayer: 'pB',
				cards: [args.card]
			}, {
				forPlayer: 'pA',
				cards: [args.card]
			}]
		};
	},
	'preparePlayJutsu': function(args, o) {
		return {
			'playJutsu': [{
				pX: args.pX,
				from: args.from,
				to: args.to,
				card: args.card,
				cause: 'playJutsu'
			}],
			'applyUpd': [{
				forPlayer: 'pB',
				cards: [args.card]
			}, {
				forPlayer: 'pA',
				cards: [args.card]
			}]
		}

	},
	'prepareCharge': function(args, o) {
		return {
			'charge': [{
				pX: args.pX,
				from: args.from,
				to: args.to,
				card: args.card,
				cause: args.cause
			}],
			'applyUpd': [{
				forPlayer: 'pB',
				cards: [args.card]
			}, {
				forPlayer: 'pA',
				cards: [args.card]
			}]
		};
	},
	/**
	 * createTeamFromCard
	 * @param  {[Object]} o.card
	 * @param  {[Object]} o.pX
	 * @param  {[Object]} o.S
	 * @param  {[Object]} o.team
	 * @param  {[Object]} o.teamCounter
	 * @param  {[Object]} o.to
	 */
	'createTeamFromCard': function(args, o) {
		o.S[args.pX][args.to].team[args.teamCounter] = [args.card]
	},
	'updTable': function(o) {
		if (!module) {
			updTable();
		}
	},
	/**
	 * remove card from team
	 * @param  {[Object]} o.card
	 * @param  {[Object]} o.from
	 * @param  {[Object]} o.pX
	 * @param  {[Object]} o.S
	 * @param  {[Object]} o.team
	 * @param  {[Object]} o.teamCounter
	 * @param  {[Object]} o.to
	 */
	'removeFromTeam': function(args, o) {
		var key = arraySearch(o.S[args.pX][args.from].team[args.team], args.card);
		o.S[args.pX][args.from].team[args.team].splice(key, 1);
		Actions.createTeamFromCard(args, o)
		if (!module) {
			updTable();
		}
	},
	'addToTeam': function(args, o) {
		args.nochange = true;
		Actions.organisation(args, o);
	},
	'organisation': function(args, o) {
		console.log('nochange', nochange)
		var nochange = args.nochange || false;
		var card1pos = args.c1.position;
		var card2pos = nochange ? 'support' : args.c2.position;
		var owner = args.c1.owner;
		var zone = args.c1.zone;
		var team1 = args.c1.team;
		var team2 = args.c2.team;
		var Team1 = o.S[owner][zone].team[team1];
		var Team2 = o.S[owner][zone].team[team2];
		// console.log('organisation'.red)
		// console.log(owner,zone,team2)
		// console.log(Team2)
		// В соотвеввущем массиве команщды удаляеться элемент с номером карты
		Actions.removeSelfFromTeam(o.S, args.c1);

		// Если карта-назначение лидер, то карта-источник встает на ее место (присоединяется в начало), 
		// иначе присоединеться в конец
		if (card2pos == 'leader') Team2.splice(0, 0, args.c1.card);
		else Team2.push(args.c1.card);


		if (!nochange) {
			Actions.removeSelfFromTeam(o.S, args.c2);
			if (card1pos == 'leader') Team1.splice(0, 0, args.c2.card);
			else Team1.push(args.c2.card);
		} else {
			if (!Team1.length) {
				delete o.S[owner][zone].team[team1];
			}
		}
		if (!module) {
			if (args.pX == you) {
				Card.prototype.hideActionCircle();
				G.selectedCard.select(false);
				G.selectedCard = null;
			}
			updTable();
		}
	},
	'removeSelfFromTeam': function(S, c2) {
		var team = S[c2.owner][c2.zone].team[c2.team];
		for (var i in team) {
			if (team[i] == c2.card) {
				team.splice(i, 1);
				return true;
			}
		}
		return false;
	},
	'moveTeamToAttack': function(o) {
		o.S[o.pX][o.to].team[o.team] = o.S[o.pX][o.from].team[o.team];
		if (o.to == 'attack') o.S.battlefield[o.team] = null;
		if (o.to == 'village') delete o.S.battlefield[o.team];
		delete o.S[o.pX][o.from].team[o.team];
		if (!module) {
			updTable();
		}
	},
	/**
	 * Функция производит премещение команд во время фазы блока.
	 * @param  {Object} o [description]
	 * @param  {Object} o.S снимок игры
	 * @param  {String} o.attackTeam индификатор атакующей команды
	 * @param  {String} o.blockTeam индификатор Блокирующей команд. Если не передать этот параметр,
	 * то команда, которая блокирует o.attackTeam вернеться в деревню без замеры.
	 * @param  {String} o.pX блокирующий игрок, он же игрок отправвиший действие
	 * @param  {String} o.from зона из которой коаманда будет отправлена в блок
	 * @return {undefined}   undefined
	 */
	'block': function(o) {
		if (o.S.battlefield[o.attackTeam] == o.blockTeam) return;
		// если место блока занято
		if (o.S.battlefield[o.attackTeam]) {
			o.S[o.pX].village.team[o.S.battlefield[o.attackTeam]] = o.S[o.pX].block.team[o.S.battlefield[o.attackTeam]];
			delete o.S[o.pX].block.team[o.S.battlefield[o.attackTeam]];
			o.S.battlefield[o.attackTeam] = null;
		}
		// если место блока свободно
		// 
		if (o.blockTeam) {
			o.S[o.pX].block.team[o.blockTeam] = o.S[o.pX][o.from].team[o.blockTeam];
			if (o.from == 'block') {
				for (var i in o.S.battlefield) {
					if (o.S.battlefield[i] == o.blockTeam) o.S.battlefield[i] = null;
				}
			} else {
				delete o.S[o.pX][o.from].team[o.blockTeam];
			}
			o.S.battlefield[o.attackTeam] = o.blockTeam;
		}
		if (!module) {
			updTable();
		}
	},
	'startAtStart': function(o) {
		o.S.turnNumber = o.S.turnNumber + 1;
		o.S.counters.playedNinjaActivePlayer = 0;

		var result = {
			'clearAtEndOfTurnEffect': [{}],
			'returnToVillaje': [{
				team: 'all',
			}],
			'updTable': [{
				players: 'all'
			}],
			'adEndOfTurn': [{}],
		};

		var pXs = ['pA', 'pB'];

		for (var pX in pXs) {
			o.S[pXs[pX]].counters.playedMission = 0;
			o.S[pXs[pX]].counters.getBattleRewards = [];
		}

		if (o.S.pA.rewards >= 10 || o.S.pB.rewards >= 10) {
			var winner = '';
			if (o.S.pA.rewards >= 10 && o.S.pB.rewards < 10) {
				winner = 'pA';
			} else if (o.S.pB.rewards >= 10 && o.S.pA.rewards < 10) {
				winner = 'pB';
			} else {
				winner = o.S.activePlayer;
			}
			var loser = winner == 'pA' ? 'pB' : 'pA';

			return {
				'winner': [{
					winner: winner,
					loser: loser,
					cause: '10 rewards'
				}]
			};
		}
		//Активный игрок сменился в фцнкции atstart
		var oldActivePlayer = o.S.activePlayer == 'pA' ? 'pB' : 'pA';
		if (!('afterQuestion' in result)) result.afterQuestion = [];
		for (var i = o.S[oldActivePlayer].hand.length; i > 6; i--) {
			result.afterQuestion.push({
				question: 'discardExcess',
				pX: oldActivePlayer
			})
		}


		return result;
		//}
	},
	'clearAtEndOfTurnEffect': function(args, o) {
		for (var i in o.S.statuses) {
			if ('atEndOfTurn' in o.S.statuses[i]) {
				delete o.S.statuses[i].atEndOfTurn;
			}
		}
		// console.log('STATUS')
		// console.log(o.S.statuses)
	},
	'adEndOfTurn': function(args, o) {
		var result = {
			'toStack': {
				'removePermanentCounter': [{}]
			},
		};
		for (var accCard in o.Accordance) {
			if (o.Known[o.Accordance[accCard]].effect && o.Known[o.Accordance[accCard]].effect.trigger && o.Known[o.Accordance[accCard]].effect.trigger.atEndOfTurn) {
				var atEndOfTurn = o.Known[o.Accordance[accCard]].effect.trigger.atEndOfTurn;
				for (var i in atEndOfTurn) {
					var conditionSelf = atEndOfTurn[i].conditionSelf({
						"card": accCard
					}, o);
					if (conditionSelf) {
						atEndOfTurn[i].func(result, {
							"card": accCard
						}, o)
					}
				}
			}

		}

		return result;
	},
	'missionAtStart': function(o) {
		var args = {
			drawCardCause: 'start turn',
			number: 1,
			player: o.S.activePlayer
		}
		return Actions.prepareDrawCard(args, o);
	},
	/**
	 * Должен возвращать обект для preStack
	 * @return {[type]} [description]
	 */
	'prepareDrawCard': function(args, o) {
		if (o.S[o.S.activePlayer].deck.length) {
			return {
				'drawCard': [{
					player: args.player,
					numberOfCard: args.number,
					drawCardCause: args.drawCardCause
				}],
				'applyUpd': [{
					forPlayer: args.player,
					cards: [o.S[args.player].deck[0]]
				}]
			};
		} else {
			return {
				//'endGame' : [{player: args.player, condition:'lose', cause:'empty deck'}] //TODO почистить
				'winner': [{
					winner: args.player == 'pA' ? 'pB' : 'pA',
					loser: args.player,
					cause: 'empty deck'
				}]
			}
		}
	},
	'comebackAtStart': function(o) {},
	'applyToReult': function(o) {

	},
	'shutdownAtStart': function(o) {
		var result = {}; //{'arg':{}, 'act':{}};
		var toStack = {};
		var step1 = null,
			step2 = null;
		var adWinnerAndLoser = [];

		function adWinnerAndLoserPush(pX, zone, team, ad) {
			adWinnerAndLoser.push({
				pX: pX,
				zone: zone,
				team: team,
				ad: ad
			})
		}
		var blockResult = {};
		for (var attackID in o.S.battlefield) {
			step1 = step2 = null;
			var attackTeam = o.S[o.S.activePlayer].attack.team[attackID];
			var blockID = o.S.battlefield[attackID];
			var blocker = o.blocker = o.S.activePlayer == 'pA' ? 'pB' : 'pA';
			var attackPower = Actions.getTeamPower(attackTeam, o);
			// если атакующая команда заюблокирована
			if (blockID) {
				var blockTeam = o.S[blocker].block.team[blockID];
				var blockPower = Actions.getTeamPower(blockTeam, o);
				//console.log(('attackPower ' + attackPower + ' / blockPower ' + blockPower).red)
				if (attackPower > blockPower) {
					if (attackPower - blockPower >= 5) {

						adWinnerAndLoserPush(blocker, 'block', blockID, 'completeDefeat');
						adWinnerAndLoserPush(o.S.activePlayer, 'attack', attackID, 'completeWin');
					} else {
						adWinnerAndLoserPush(blocker, 'block', blockID, 'normalDefeat');
						adWinnerAndLoserPush(o.S.activePlayer, 'attack', attackID, 'normalWin');
					}
				} else if (attackPower < blockPower) {
					if (blockPower - attackPower >= 5) {
						adWinnerAndLoserPush(o.S.activePlayer, 'attack', attackID, 'completeDefeat');
						adWinnerAndLoserPush(blocker, 'block', blockID, 'completeWin');
					} else {
						adWinnerAndLoserPush(o.S.activePlayer, 'attack', attackID, 'completeDefeat');
						adWinnerAndLoserPush(blocker, 'block', blockID, 'completeWin');
					}
				} else {
					adWinnerAndLoserPush(o.S.activePlayer, 'attack', attackID, 'drawBattle');
					adWinnerAndLoserPush(blocker, 'block', blockID, 'drawBattle');
				}
			} else {
				if (!('adWinnerAndLoser' in toStack)) {
					toStack.adWinnerAndLoser = [];
				}
				if (attackPower >= 5) {
					toStack.adWinnerAndLoser.push({
						pX: o.S.activePlayer,
						zone: 'attack',
						team: attackID,
						ad: 'completeReward'
					});
					o.rewardToPlayer = o.S.activePlayer;
				} else {
					toStack.adWinnerAndLoser.push({
						pX: o.S.activePlayer,
						zone: 'attack',
						team: attackID,
						ad: 'normalReward'
					});
					o.rewardToPlayer = o.S.activePlayer;
				}
			}
		}

		if (!module) {
			updTable();
		} else {
			result.toStack = toStack;
			result.adWinnerAndLoser = adWinnerAndLoser;
			return result;
		}
	},
	'winnerAtStart': function(o) {
		var pXs = [o.S.activePlayer, (o.S.activePlayer == 'pA' ? 'pB' : 'pA')];
		for (var pX in pXs) {
			if (o.S[pXs[pX]].rewards >= 10) {
				o.winner = pXs[pX];
				Actions.winner(o);
				Actions.stopGame(o);
				break;
			}
		}
	},
	'winner': function(args, o) {
		Actions.stopGame(args, o);
		if (!module) {
			AnimationPush({
				func: function() {
					AN.winner(args, o);
				},
				time: 1200,
				name: 'winner'
			});
		}
	},
	'stopGame': function(args, o) {
		o.S.stop = true;
	},
	'actionLock': function(arg) {
		actionLock = arg.lock;
		console.log('actionLock', arg.lock)
	},
	'completeDefeat': function(team, o) {
		//console.log('completeDefeat' , team)
		var result = {
			'givingDamage': []
		};
		if (!team) return;
		// o.damage = 1;
		// o.causeOfDamage = 'completeDefeat';
		// var damgeResult1 = {}, damgeResult2 = {};
		for (var i = 1; i <= team.length - 1; i++) {
			result.givingDamage.push({
				pX: o.pX,
				team: o.team,
				zone: o.zone,
				card: team[i],
				damage: 1,
				type: 'fire',
				causeOfDamage: 'completeDefeat'
			})
			//damgeResult1 = Actions.giveDamage(team[i],o);
		}
		result.givingDamage.push({
			pX: o.pX,
			team: o.team,
			zone: o.zone,
			card: team[0],
			damage: 2,
			type: 'fire',
			causeOfDamage: 'completeDefeat'
		})
		//damgeResult2 = Actions.giveDamage(team[0],o);
		if (module) {
			//console.log('completeDefeat')
			return result;
		}
	},
	'normalDefeat': function(team, o) {
		var result = {
			'givingDamage': []
		};
		if (!team) return;
		// o.damage = 1;
		// o.causeOfDamage = 'normalDefeat';
		//Actions.giveDamage(team[0],o);
		result.givingDamage.push({
			pX: o.pX,
			team: o.team,
			zone: o.zone,
			card: team[0],
			damage: 1,
			type: 'fire',
			causeOfDamage: 'normalDefeat'
		})
		if (module) {
			return result;
		}
	},
	'completeWin': function(team, o) {
		//console.log('completeWin',team)
		var result = {};
		if (!team) return result;
		if (module) {
			return result;
		}
	},
	'normalWin': function(team, o) {
		var result = {};
		if (!team) return result;
		if (module) {
			return result;
		}
	},
	'normalReward': function(team, o) {
		var result = {
			givingReward: []
		};
		if (!team) return;
		//Actions.giveReward(team[0],o);
		result.givingReward.push({
			pX: o.pX,
			team: o.team,
			zone: o.zone,
			card: team[0],
			rewardsCount: 1,
			causeOfReward: 'normalReward'
		})
		//TODO;
		if (module) {
			return result;
		}
	},
	'completeReward': function(team, o) {
		var result = {
			givingReward: []
		};
		if (!team) return;
		// o.rewardsCount = 2;
		// o.causeOfReward = 'completeReward';
		//Actions.giveReward(team[0],o);
		result.givingReward.push({
			pX: o.pX,
			team: o.team,
			zone: o.zone,
			card: team[0],
			rewardsCount: 2,
			causeOfReward: 'completeReward'
		})
		if (module) {
			return result;
		}
	},
	'drawBattle': function(team, o) {
		var result = {
			'givingDamage': []
		};
		if (!team) return;
		// o.damage = 1;
		// o.causeOfDamage = 'drawBattle';
		//Actions.giveDamage(team[0],o);


		result.givingDamage.push({
			pX: o.pX,
			team: o.team,
			zone: o.zone,
			card: team[0],
			damage: 1,
			type: 'fire',
			causeOfDamage: 'drawBattle'
		})
		if (module) {
			return result;
		}
	},
	'giveDamage': function(cardID, o) {
		var result = {
			damageResult: []
		};
		if (!module) {
			AnimationPush({
				func: function() {
					AN.damage(cardID, o);
				},
				time: 610,
				name: 'giveDamage'
			});
		}
		if (o.damage == 1) {
			if (Actions.getHealtStatus(cardID, o)) {
				result.damageResult.push({
					pX: o.pX,
					team: o.team,
					zone: o.zone,
					card: o.card,
					result: 'injured'
				});
				//Actions.injureTarget(cardID, o);
			} else {
				result.damageResult.push({
					pX: o.pX,
					team: o.team,
					zone: o.zone,
					card: o.card,
					result: 'death'
				});
				//Actions.killTarget(cardID, o);
			}
		} else if (o.damage >= 2) {
			result.damageResult.push({
				pX: o.pX,
				team: o.team,
				zone: o.zone,
				card: o.card,
				result: 'death'
			});
			//Actions.killTarget(cardID, o);
		}
		return result;
	},
	'giveReward': function(args, o) {
		if (!module) {
			for (var i = 1; i <= args.rewardsCount; i++) {
				AnimationPush({
					func: function() {
						AN.reward(args.card, o);
					},
					time: 610,
					name: 'giveReward'
				});
			}
			setTimeout(AN.preStack.countDown, args.rewardsCount * 611);
		}
		o.S[args.pX].rewards += args.rewardsCount;
		if (module) {
			return {
				'updTable': [{
					players: 'all'
				}]
			}
		}
	},
	'injureTarget': function(cardID, o) {
		if (!(cardID in o.S.statuses)) o.S.statuses[cardID] = {};
		o.S.statuses[cardID].injured = true;
		if (!module) {
			C[cardID].injure();
			setTimeout(AN.preStack.countDown, 500);
		}
	},
	'killTarget': function(cardID, o) {
		var result = {
			'moveCardToZone': [],
			'afterQuestion': []
		};
		var pXs = ['pA', 'pB'];
		var zones = ['village', 'attack', 'block'];
		for (var pX in pXs) {
			for (var zone in zones) {
				var teams = o.S[pXs[pX]][zones[zone]].team
				for (var team in teams) {
					for (var card in teams[team]) {
						if (cardID == teams[team][card]) {
							o.from = zones[zone];
							o.to = 'discard';
							o.pX = pXs[pX];
							o.team = team;
							o.cardInArray = card;
							o.card = cardID;

							var o2 = {};
							for (var i in o) o2[i] = o[i]

							result.moveCardToZone.push({
								pX: o.pX,
								from: o.from,
								team: o.team,
								card: o.card,
								to: o.to,
								cardInArray: o.card,
								cause: 'resultOfshutdown'
							});
							//Actions.moveCardToZone(o2)


							if (card == 0 && teams[team].length > 1) {
								result.afterQuestion.push({
									question: 'newLeader',
									pX: o.pX,
									zone: o.zone,
									team: o.team
								});
								if (!module) {
									AN.stop = true;
									AN.Questions.newLeader({
										pX: pXs[pX],
										zone: zones[zone],
										team: team
									});
								} else {
									//TODO приемщик ответа
								}
							}
							break;
						}
					}
				}
			}
		}
		if (!result.afterQuestion.length) delete result.afterQuestion;
		return result;
	},
	'retrunTeamToVillage': function(args, o) {
		// console.log('retrunTeamToVillage')
		if (args.team == 'all') {
			var pXs = ['pA', 'pB'];
			var zones = ['attack', 'block'];
			for (var pX in pXs) {
				for (var zone in zones) {
					var z = o.S[pXs[pX]][zones[zone]];
					for (var t in z.team) {
						o.S[pXs[pX]].village.team[t] = o.S[pXs[pX]][zones[zone]].team[t];
						delete o.S[pXs[pX]][zones[zone]].team[t];
					}
				}
			}
			o.S.battlefield = {};
		}
		if (!module) {
			setTimeout(AN.preStack.countDown, 50);
		} else {
			return {};
		}
	},
	'getTeamPower': function(team, o) {
		var result = 0;
		if (!team) return result;
		result += Actions.getLeaderPower(team[0], o);
		for (var i = 1; i <= team.length - 1; i++) {
			result += Actions.getSupportPower(team[i], o);
		}
		return result;
	},
	'getLeaderPower': function(cardID, o) {
		var power = Actions.getNinjaModPower(cardID, o)
		return power.attack;
	},
	'getSupportPower': function(cardID, o) {
		var power = Actions.getNinjaModPower(cardID, o)
		return power.support;
	},
	'getHealtStatus': function(cardID, o) {
		if (o.S.statuses[cardID] && o.S.statuses[cardID].injured) {
			return false;
		}
		return true;
	},
	'getInjuredPower': function(o) {
		var result = '';
		result += o.Known[o.Accordance[o.cardID]].ai;
		result += '/';
		result += o.Known[o.Accordance[o.cardID]].si;
		return result;
	},
	'newLeader': function(args, o) {
		var result = {}
		var team = o.S[args.pX][args.zone].team[args.team];
		for (var i in team) {
			if (team[i] == args.card) {
				team.splice(0, 0, team.splice(i, 1)[0]); // Вырезает итый элемент и вставляет в начало массива
				result.newLeader = [args];
				break;
			}
		}
		if (!module) {
			setTimeout(AN.preStack.countDown, 25);
		} else {
			return result;
		}
	},
	'discardExcess': function(args, o) {
		var result = {
			discardExcess: [args]
		};
		console.log('discardExcess', args)
		for (var i in o.S[args.pX].hand) {
			if (o.S[args.pX].hand[i] == args.card) {
				Actions.moveCardToZone({
					pX: args.pX,
					card: args.card,
					cause: 'discardExcess',
					from: 'hand',
					to: 'discard',
					team: null
				}, o)
				break;
			}
		}
		if (!module) {
			setTimeout(AN.preStack.countDown, 1000);
		} else {
			return result;
		}
	},
	'discardCardFromHand': function(args, o) {
		var result = {
			'moveCardToZone': [],
			'applyUpd': []
		}
		console.log("discardCardFromHand".yellow, args)
		var moveArgsPermanent = {
			pX: args.pX,
			card: args.card,
			cause: 'discardCardFromHand',
			from: 'hand',
			to: 'discard',
			team: null
		}

		result.applyUpd.push({
			forPlayer: args.pX == 'pA' ? 'pB' : 'pA',
			cards: [args.card]
		})
		result.moveCardToZone.push(moveArgsPermanent);
		return result;
	},
	'preStackDone': function(table, o) {
		var loging = false;
		if (loging) console.log('table', table.stackPrep)
		o.answers = table.answers;
		var results = [];
		var result = {};
		for (var func in table.stackPrep) {
			for (var args in table.stackPrep[func]) {
				//console.log('stackPrep', func)
				results.push(Actions[func](table.stackPrep[func][args], o));
			}
		}
		var befor = [];
		if (loging) console.log('\ntable.answers');
		if (loging) console.log(table.answers)
		for (var ans in table.answers) {
			for (var args in table.answers[ans]) {
				var res = Actions[ans](table.answers[ans][args], o);
				if (loging) console.log('\nRES'.cyan)
				if (loging) console.log(res);
				befor.push(res);
			}
		}
		if (loging) console.log("------------------------");
		if (loging) console.log(results);
		if (loging) console.log("------------------------");
		var toStack = [];
		for (var i in results) {
			if (results[i]) {
				for (var name in results[i]) {
					if (name == 'toStack') {
						toStack.push(results[i][name]);
						// console.log(results[i][name])
						// console.log("------------------------");
						continue;
					}
					if (!(name in result)) result[name] = [];
					for (var act in results[i][name]) {
						result[name].push(results[i][name][act])
					}
				}
			}
		}
		if (toStack) result.toStack = toStack;
		if (befor.length) {
			result.befor = {};
			for (var arr in befor) {
				for (var act in befor[arr]) {
					if (!(act in result.befor)) result.befor[act] = [];
					for (var args in befor[arr][act]) {
						result.befor[act].push(befor[arr][act][args])
					}
				}
			}
		}
		return result;
	},
	'adWinnerAndLoser': function(args, o) {
		//console.log('\nadWinnerAndLoser')
		o.pX = args.pX;
		o.zone = args.zone;
		o.team = args.team;
		var team = o.S[args.pX][args.zone].team[args.team];
		return Actions[args.ad](team, o);
	},
	'givingDamage': function(args, o) {
		//console.log('\ngivingDamage')
		o.pX = args.pX;
		o.zone = args.zone;
		o.team = args.team;
		o.card = args.card;
		o.damage = args.damage;
		return Actions.giveDamage(args.card, o);
	},
	'damageResult': function(args, o) {
		//console.log('\ndamageResult')
		o.pX = args.pX;
		o.zone = args.zone;
		o.team = args.team;
		o.card = args.card;
		o.result = args.result;
		if (args.result == 'death') return Actions.killTarget(args.card, o);
		if (args.result == 'injured') return Actions.injureTarget(args.card, o);
		return {};
	},
	'givingReward': function(args, o) {
		return Actions.giveReward(args, o);
	},
	'returnToVillaje': function(args, o) {
		return Actions.retrunTeamToVillage(args, o);
	},
	'adNewTurn': function(args, o) {
		return {};
	},
	'drawCard': function(args, o) {
		return Actions['Draw X cards'](args, o);
	},
	'putCardInPlay': function(args, o) {
		//return Actions.moveCardToZone(args, o)
		return {};
	},
	'selectHandCost': function(args, o) {
		var result = {};
		result.moveCardToZone = [];
		result.applyUpd = [];
		var oppNeedencard = [args.card];
		var moveArgsPermanent = {
			pX: args.pX,
			card: args.card,
			cause: 'play',
			from: 'hand',
			to: 'village', // for Ninja
			team: null
		}
		if (o.Known[o.Accordance[args.card]].type == 'M') {
			moveArgsPermanent.to = 'stack'; //for Mission
		}
		result.moveCardToZone.push(moveArgsPermanent);
		Actions.moveCardToZone(moveArgsPermanent, o)

		for (var i in args.handCost) {
			var moveArgsPermanent = {
				pX: args.pX,
				card: args.handCost[i],
				cause: 'handCost',
				from: 'hand',
				to: 'chackra',
				team: null
			}
			oppNeedencard.push(args.handCost[i])
			result.moveCardToZone.push(moveArgsPermanent);
			Actions.moveCardToZone(moveArgsPermanent, o)
		}
		result.applyUpd.push({
			forPlayer: args.pX == 'pA' ? 'pB' : 'pA',
			cards: oppNeedencard
		});
		return result;
	},
	'playJutsu': function(args, o) {
		// var cardKey = arraySearch(o.S[args.pX][args.from], args.card);

		// o.S.stack.push(
		// 	{"card" :args.card, "user":"c107", "target":"c107", "owner":"pA"}
		// )
		return {};
	},
	'charge': function(args, o) {
		return Actions.moveCardToZone(args, o)
	},
	'startDrawHand': function(args, o) {
		return {
			'drawCard': [{
				player: 'pA',
				numberOfCard: 6,
				cause: 'startGame'
			}, {
				player: 'pB',
				numberOfCard: 6,
				cause: 'startGame'
			}, ]
		}
	},
	'selectUserAndTargetForJutsu': function(args, o) {
		return Actions.prepareAddJutsuToStack(args, o);
	},
	'prepareAddJutsuToStack': function(args, o) {
		if (module) {
			Actions.addJutsuToStack(args, o);
		}
		return {
			'addJutsuToStack': [
				args
			]
		}
	},
	'addJutsuToStack': function(args, o) {
		args.team = null;
		Actions.moveCardToZone(args, o);
		for (var i in args.chackra) {
			var args2 = {
				pX: args.pX,
				card: args.chackra[i],
				cause: 'justsuCost',
				from: 'chackra',
				to: 'discard',
				team: null,
			}
			Actions.moveCardToZone(args2, o);
		}
		if (!module) {
			G.transferInitiative = true;
		}
	},
	'prepareStartStack': function(args, o) {
		return {};
	},
	'resolveJutsuInStack': function(args, o) {
		console.log('ARGS', args)
		var result = {};
		var jutsu = o.Known[o.Accordance[args.card]];
		if (!module) {
			AnimationPush({
				func: function() {
					C[args.card].effect({
						type: 'simple',
						target: 'one',
						pic: "public/pics/spark.png"
					})
					for (var i2 in args.target) {
						C[args.target[i2]].effect({
							type: 'simple',
							target: 'one',
							pic: "public/pics/spark.png"
						})
					}
				},
				time: 1500,
				name: 'spark.png'
			});
			setTimeout(AN.preStack.countDown, 1510);
		} else {
			if (jutsu.effect.trigger && jutsu.effect.trigger.resolve) {
				for (var i in jutsu.effect.trigger.resolve) {
					jutsu.effect.trigger.resolve[i].func(result, args, o);
				}
			}
		}
		var args2 = {}
		args2.pX = args.owner;
		args2.card = args.card;
		args2.cause = 'resolveJutsuFromStack';
		args2.from = 'stack';
		args2.to = 'chackra';
		if (jutsu.type == 'M' && jutsu.effect.permanent) {
			args2.to = 'mission';
			if (jutsu.effect.permanent !== true) {
				if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
				o.S.statuses[args.card].permanent = jutsu.effect.permanent;
			}
		}
		args2.team = null;
		console.log('resolveMove'.red)
		Actions.moveCardToZone(args2, o)
		return result;
	},
	'increaseNinjaPower': function(args, o) {
		var result = {};

		if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
		if (!('atEndOfTurn' in o.S.statuses[args.card])) o.S.statuses[args.card].atEndOfTurn = [];
		o.S.statuses[args.card].atEndOfTurn.push({
			type: 'changePower',
			attack: args.attack,
			support: args.support
		})

		if (!module) {
			var arr = [];
			arr.push(args.attack >= 0 ? '+' + args.attack : args.attack);
			arr.push(args.support >= 0 ? '+' + args.support : args.support);
			AnimationPush({
				func: function() {
					C[args.card].effect({
						type: 'increase',
						text: arr.join('/')
					})
				},
				time: 1000,
				name: 'increaseNinjaPower'
			});
			AnimationPush({
				func: function() {
					console.log(S.statuses)
					updTable();
				},
				time: 600,
				name: 'updTable'
			});
			setTimeout(AN.preStack.countDown, 1010);
		} else {
			//jutsu.effect.trigger.resolve[i].func(result, args, o);
		}
		return result;

	},
	'getAllPowerModificator': function(card, o) {
		var result = {
			attack: 0,
			support: 0
		};
		if (card in o.S.statuses) {
			if ('atEndOfTurn' in o.S.statuses[card]) {
				for (var i in o.S.statuses[card].atEndOfTurn) {
					if (o.S.statuses[card].atEndOfTurn[i].type == 'changePower') {
						result.attack += o.S.statuses[card].atEndOfTurn[i].attack;
						result.support += o.S.statuses[card].atEndOfTurn[i].support;
					}
				}
			}
		}
		for (var accCard in o.Accordance) {
			if (o.Known[o.Accordance[accCard]].effect && o.Known[o.Accordance[accCard]].effect.static && o.Known[o.Accordance[accCard]].effect.static.powerNinja) {
				var powerNinja = o.Known[o.Accordance[accCard]].effect.static.powerNinja;
				for (var i in powerNinja) {
					var conditionSelf = powerNinja[i].conditionSelf({
						"card": card,
						"self": accCard
					}, o);
					var condition = powerNinja[i].condition({
						"card": card,
						"self": accCard
					}, o);
					if (conditionSelf && condition) {
						result.attack += powerNinja[i].powerMod.attack;
						result.support += powerNinja[i].powerMod.support;
					}
				}
			}

		}
		return result;
	},
	'getNinjaDefaultPower': function(card, o) {
		return {
			attack: Actions.getNinjaDefaultAttack(card, o),
			support: Actions.getNinjaDefaultSupport(card, o)
		}
	},
	'getNinjaDefaultAttack': function(card, o) {
		var isHealt = true;
		if (card in o.S.statuses && o.S.statuses.card) isHealt = false;
		var cardObj = o.Known[o.Accordance[card]];
		return isHealt ? cardObj.ah : cardObj.ai;
	},
	'getNinjaDefaultSupport': function(card, o) {
		var isHealt = true;
		if (card in o.S.statuses && o.S.statuses.card) isHealt = false;
		var cardObj = o.Known[o.Accordance[card]];
		return isHealt ? cardObj.sh : cardObj.si;
	},

	getNinjaModPower: function(card, o) {
		var o = o || getUniversalObject();
		var mod = Actions.getAllPowerModificator(card, o);
		var result = Actions.getNinjaDefaultPower(card, o);
		result.attack += mod.attack;
		result.support += mod.support;
		return result;
	},
	'cardEffect': function(args, o) {
		var result = {};
		console.log('\n--- cardEffect ---'.yellow);
		console.log(args)
		if (args.effectType == 'trigger')
			o.Known[o.Accordance[args.card]].effect.trigger[args.trigger][args.effectKey].cardEffect(result, args, o);
		return result;
	},
	'log': function() {
		console.log('msg')
	},
	'prepareEffect': function() {
		return {};
	},
	/**
	 * [description]
	 * @param  {[type]} args [description]
	 * @param  {[type]} args.path
	 * @param  {[type]} args.path.player ['pA', 'pB']
	 * @param  {[type]} args.path.zone ['mission', 'village']
	 * @param  {[type]} o    [description]
	 * @return {[type]}      [description]
	 */
	'cardPath': function(args, o) {
		var defaultZones = ['deck', 'stack', 'village', 'hand', 'discard', 'mission', 'attack', 'block'];
		var defaultPlayers = ['pA', 'pB'];
		args.path = args.path || {
			path: {
				player: defaultPlayers,
				zones: defaultZones
			}
		};
		var zones = args.path.zones || defaultZones;
		var pXs = args.path.players || defaultPlayers;

		for (var pX in pXs) {
			for (var zone in zones) {
				if (!isZoneSimple(zones[zone])) {
					for (var team in o.S[pXs[pX]][zones[zone]]) {
						for (var cardId in o.S[pXs[pX]][zones[zone]][team]) {
							if (args.card == o.S[pXs[pX]][zones[zone]][team][cardId]) {
								return {
									player: pXs[pX],
									zone: zones[zone],
									team: team,
									key: cardId
								};
							}
						}
					}
				} else {
					for (var cardId in o.S[pXs[pX]][zones[zone]]) {
						if (args.card == o.S[pXs[pX]][zones[zone]][cardId]) {
							return {
								player: pXs[pX],
								zone: zones[zone],
								key: cardId
							};
						}
					}
				}

			}
		}
		return false;
	},
	'removePermanentCounter' :  function(args, o) {
		var result = {};
		for (var mission in o.S[o.S.activePlayer].mission) {
			var missionId = o.S[o.S.activePlayer].mission[mission];
			if (o.S.statuses[missionId]
				&& o.S.statuses[missionId].permanent !== true) 
			{
				o.S.statuses[missionId].permanent--;

				if (o.S.statuses[missionId].permanent < 1) {
					if (!('discardMission' in result)) result.discardMission = [];
					result.discardMission.push({
						pX : o.S.activePlayer,
						card : missionId
					})
				}
			}
		}

		if (!module) {
			updTable();
			AN.preStack.countDown();
		}
		else {
			return result;
		}
	},
	'discardMission' : function(args, o) {
		Actions.moveCardToZone({
			pX: args.pX,
			card: args.card,
			cause: 'discardMission',
			from: 'mission',
			to: 'chackra',
			team: null
		}, o)
	},
	'getPermanentCounter' : function(card, o) {
		if (o.S.statuses[card]
			&& 'permanent' in o.S.statuses[card] )
		{
			return o.S.statuses[card].permanent
		}
		if (o.Known[o.Accordance[card]].type == 'M'
			&& o.Known[o.Accordance[card]].effect
			&& o.Known[o.Accordance[card]].effect.permanent) 
		{
			return o.Known[o.Accordance[card]].effect.permanent;
		}
		return false;
	}
};
if (module) {
	module.exports = Actions;
}
