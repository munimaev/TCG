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

		if (o.S.phase == 'organisation') {
			var count = 0;
			for (var i in o.S[o.S.activePlayer].village.team) {
				for (var j in o.S[o.S.activePlayer].village.team[i]) {
					count++;
					break;
				}
			}
			if (count < 2) return Actions.toNextPhase(args, o);			
		}

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
			var count = 0;
			for ( var i in o.S.battlefield) {
				count++;
			}
			if (!count) return Actions.toNextPhase(args, o);
		}
		if (o.S.phase == 'jutsu') {
			var count = 0;
			for ( var i in o.S.battlefield) {
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
	'adMoveCardToZone' : function (args, o) {
		console.log('adMoveCardToZone'.red)
		var result = {
			'moveCardToZone': [args]
		};
		result = Actions.addTriggerEffect(result, 'instedMoveCardToZone', args, o); // result change
		result = Actions.addTriggerEffect(result, 'afterMoveCardToZone', args, o); // result change
		return result;
	},
	'adHealingNinja' : function(args, o) {
		var result = {
			'healingNinja': [args]
		};
		return result;
	},
	'adRemoveCardFromGame' : function(args, o) {
		var result = {
			'removeCardFromGame': [args]
		};
		return result;
	},
	'addConditionalEffect': function(result, trigger, args, o) {},
	'addTriggerEffect': function(result, trigger, args, o) {

		console.log(('\ntrigger ' + trigger).yellow)
		var isInsted = trigger.substr(0,6) === 'insted';
		insted:
		for (var accCard in o.Accordance) {
			if (o.Known[o.Accordance[accCard]].effect 
				&& o.Known[o.Accordance[accCard]].effect.trigger 
				&& o.Known[o.Accordance[accCard]].effect.trigger[trigger]
			) {
				var triggerEffect = o.Known[o.Accordance[accCard]].effect.trigger[trigger];
				for (var i in triggerEffect) {
					var conditionSelf = triggerEffect[i].conditionSelf({
						"card": accCard,
						"actionArgs": args
					}, o);
					var condition = triggerEffect[i].condition(args, o);
					var ciclingCheck = triggerEffect[i].ciclingCheck({
						"card": accCard,
						"actionArgs": args
					}, o);
					console.log((accCard + '['+o.Known[o.Accordance[accCard]].number + '] ciclingCheck').yellow, conditionSelf, condition, ciclingCheck)
					if (conditionSelf && condition && ciclingCheck) {
						result = triggerEffect[i].resultChange(result, {
							"card": accCard,
							"actionArgs" : args
						}, o)
						if (isInsted) {
							break insted;
						}
					}
				}
			}

		}
		console.log('result'.yellow, result)
		return result;
	},
	'healingNinja' : function (args, o) {
		if (o.S.statuses[args.card]) {
			delete o.S.statuses[args.card].injured;
		}
		if (!module) {
			C[args.card].heal();
		}
	},
	'removeCardFromGame' : function (args, o) {
		var outZone = args.zone || args.from;
		if (isZoneSimple(outZone)) {
			var cardInArray = args.cardInArray || o.S[args.pX][outZone].indexOf(args.card);
			if (cardInArray > -1) {
				o.S[args.pX][outZone].splice(cardInArray,1)
			}
		} else {
			var cardInArray = args.cardInArray || o.S[args.pX][outZone].team[args.team].indexOf(args.card);
			if (cardInArray > -1) {
				o.S[args.pX][outZone].team[args.team].splice(cardInArray,1)
			}
		}
		console.log(cardInArray)
		if (!module && C[args.card]) {
			C[args.card].puff();
			// C[args.card].params.zona = 'deleting';
			// args.outCard = false;
			// args.afterFunc = function() {
			// 	setTimeout(function(){
			// 	C[args.card].animation({
			// 		duration: 500,
			// 		additional: {
			// 			fadeIn:true,
			// 			after: {
			// 				func: function() {
			// 					C[args.card].destroyCard();
			// 				}
			// 			}
			// 		}
			// 	})
			// },100)
			// }
 		// 	AN.moveCardToCenter(args);
		}
	},
	'preparePutCardinPlay': function(args, o) {
		return {
			'adMoveCardToZone': [{
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
		if (args.card) {
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
		}
		return {};

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
	/**
	 * [description]
	 * @param  {[type]} args {
	 *                      nonchange: default false ,
	 *                      c1 : {
	 *                      	position : 'leader' / 'support',
	 *                      	owner: 'pA' / 'pB',
	 *                      	zone: 'attack',
	 *                      	team: 1,
	 *                      	card : 'c001'
	 *                      },
	 *                      c2 : {
	 *                      	position : 'leader' / 'support',
	 *                      	owner: 'pA' / 'pB',
	 *                      	zone: 'attack',
	 *                      	team: 1,
	 *                      	card : 'c001'
	 *                      }
	 * 					}
	 * @param  {[type]} o    [description]
	 * @return {[type]}      [description]
	 */
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

                    // console.log(args.c1.card.bold);
                    // console.log(o.Known[o.Accordance[args.c1.card]].type.bold);
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
                    // console.log(args.c1.card.bold);
                    // console.log(o.Known[o.Accordance[args.c1.card]].type.bold);
	},
	'removeSelfFromTeam': function(S, c2) {
		console.log('-*- removeSelfFromTeam')
		var team = S[c2.owner][c2.zone].team[c2.team];
		for (var i in team) {
			if (team[i] == c2.card) {
				team.splice(i, 1);
				return true;
			}
		}
		console.log(c2)
		return false;
	},
	'moveTeamToAttack': function(o) {
		try {
			o.S[o.pX][o.to].team[o.team] = o.S[o.pX][o.from].team[o.team];
			if (o.to == 'attack') o.S.battlefield[o.team] = null;
			if (o.to == 'village') delete o.S.battlefield[o.team];
			delete o.S[o.pX][o.from].team[o.team];
			if (!module) {
				updTable();
			}
		} catch(e) {
			console.log('\n- = - ERROR - = -\nmoveTeamToAttack'.bold.red)
			console.log(o.pX)
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
			toStack: [{
				'clearAtEndOfTurnEffect': [{}]
			}, {
				'adEndOfTurn': [{}]
			}, {
				'returnToVillaje': [{
					team: 'all',
				}]
			}, {
				'updTable': [{
					players: 'all'
				}]
			}]
		}

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

		for (var i = o.S[oldActivePlayer].hand.length; i > 6; i--) {
			result.toStack.push({
				afterQuestion: [{
					question: 'discardExcess',
					pX: oldActivePlayer
				}]
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
	'addPhaseTrigger': function(result, args, o){
		if (!args.triggerPhase) {
			return result;
		}
		for (var accCard in o.Accordance) {
			if (o.Known[o.Accordance[accCard]].effect 
				&& o.Known[o.Accordance[accCard]].effect.trigger 
				&& o.Known[o.Accordance[accCard]].effect.trigger[args.triggerPhase]) {
				var triggerPhase = o.Known[o.Accordance[accCard]].effect.trigger[args.triggerPhase];
				for (var i in triggerPhase) {
					var conditionSelf = triggerPhase[i].conditionSelf({
						"card": accCard
					}, o);
					console.log('conditionSelf'.red, conditionSelf)
					if (conditionSelf) {
						triggerPhase[i].func(result, {
							"card": accCard
						}, o)
					}
				}
			}

		}
		return result;
	},
	'adJutsu': function(args, o) {
		var result = {};
		args.triggerPhase = 'atJutsu';
		result = Actions.addPhaseTrigger(result, args, o);
		delete args.triggerPhase;
		return result;
	},
	'adEndOfTurn': function(args, o) {
		var result = {
			'toStack': {
				'removePermanentCounter': [{}]
			},
		};
		args.triggerPhase = 'atEndOfTurn';
		result = Actions.addPhaseTrigger(result, args, o);
		delete args.triggerPhase;
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
					cards: o.S[args.player].deck.slice(0,args.number)
				}]
			};
		} else {
			return {
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
	'jutsuAtStart': function(o) {

		var result = {
			toStack: [{
				'adJutsu': [{}]
			}]
		}
		return result;
		//}
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
		// console.log('actionLock', arg.lock)
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
			AnimationPush({
				func: function() {
					C[cardID].injure({noAnimation:true});
					updTable();
					setTimeout(AN.preStack.countDown, 600+5)
				},
				time: 250 + 5,
				name: 'injureTarget C[' + cardID + '].injure'
			});
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

			if (ans == 'primal') {
				if (loging)console.log('\nPRIMAL'.yellow)

				for (var ans2 in table.answers[ans]) {
					if (loging) console.log(table.answers[ans][ans2])
					for (var primal in table.answers[ans][ans2]) {
						if (loging) console.log(table.answers[ans][ans2][primal])
						for (args in table.answers[ans][ans2][primal]) {
							var res = Actions[primal](table.answers[ans][ans2][primal][args], o);
							results.push(res);
						}
					}
				}

			}
			else {
				for (var args in table.answers[ans]) {
					var res = Actions[ans](table.answers[ans][args], o);
					if (loging) console.log('\nRES'.cyan)
					if (loging) console.log(res);
					befor.push(res);
				}
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
						if (!(results[i][name] instanceof Array)) {
							results[i][name] = [results[i][name]]
						}

						toStack = toStack.concat(results[i][name]);
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
		return Actions['DrawXcards'](args, o);
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
		if (args.card) { // если цена вдруг не за технику
			Actions.moveCardToZone(args, o);
		}
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
		// console.log('ARGS', args)
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
		// console.log('resolveMove'.red)
		if (!('adMoveCardToZone' in result)) result.adMoveCardToZone = [];
		result.adMoveCardToZone.push(args2);
		// Actions.moveCardToZone(args2, o)
		return result;
	},
	'increaseNinjaPower': function(args, o) {
		var result = {};

		if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
		if (!('atEndOfTurn' in o.S.statuses[args.card])) o.S.statuses[args.card].atEndOfTurn = {};
		if (!('changePower' in o.S.statuses[args.card])) o.S.statuses[args.card].atEndOfTurn.changePower = [];
		o.S.statuses[args.card].atEndOfTurn.changePower.push({
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
				for (var i in o.S.statuses[card].atEndOfTurn['changePower']) {
					result.attack += o.S.statuses[card].atEndOfTurn.changePower[i].attack;
					result.support += o.S.statuses[card].atEndOfTurn.changePower[i].support;
				}
			}
		}
		for (var accCard in o.Accordance) {
			if (o.Known[o.Accordance[accCard]]
				&& o.Known[o.Accordance[accCard]].effect 
				&& o.Known[o.Accordance[accCard]].effect.static 
				&& o.Known[o.Accordance[accCard]].effect.static.powerNinja) {
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
		if (o.Known[o.Accordance[card]]
			&& o.Known[o.Accordance[card]].effect
			&& o.Known[o.Accordance[card]].effect.static
			&& o.Known[o.Accordance[card]].effect.static.selfPower
		) {
			var selfPower = o.Known[o.Accordance[card]].effect.static.selfPower;
			for (var i in selfPower) {
				if (selfPower[i].condition({self:card},o)) {
					var powerMod = selfPower[i].getPowerMod({self:card},o);
					// console.log('powerMod', powerMod)
					result.attack += powerMod.attack;
					result.support += powerMod.support;
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
	'isHealt' : function(card, o) {
		if (card in o.S.statuses 
			&& o.S.statuses[card]
			&& o.S.statuses[card].injured
		) {
			return false;
		}
		return true;
	},
	'getNinjaDefaultAttack': function(card, o) {
		var isHealt = Actions.isHealt(card, o);
		var cardObj = o.Known[o.Accordance[card]];
		return isHealt ? cardObj.ah : cardObj.ai;
	},
	'getNinjaDefaultSupport': function(card, o) {
		var isHealt = Actions.isHealt(card, o);
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
		// console.log('\n--- cardEffect ---'.yellow);
		// console.log(args)
		var cardEffect = 'cardEffect' + (args.step || '');
		if (args.effectType == 'trigger')
			o.Known[o.Accordance[args.card]].effect.trigger[args.trigger][args.effectKey][cardEffect](result, args, o);
		if (args.effectType == 'activate')
			o.Known[o.Accordance[args.card]].effect.activate[args.effectKey][cardEffect](result, args, o);
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
			// console.log(pXs[pX])
			for (var zone in zones) {
				// console.log(zones[zone])
				// console.log(!isZoneSimple(zones[zone]))
				if (!isZoneSimple(zones[zone])) {
						// console.log(o.S[pXs[pX]][zones[zone]].team)
					for (var team in o.S[pXs[pX]][zones[zone]].team) {
						// console.log(o.S[pXs[pX]][zones[zone]].team[team])
						for (var cardId in o.S[pXs[pX]][zones[zone]].team[team]) {
						// console.log(o.S[pXs[pX]][zones[zone]].team[team][cardId])
						// console.log(args.card)
							if (args.card == o.S[pXs[pX]][zones[zone]].team[team][cardId]) {
								return {
									player: pXs[pX],
									zone: zones[zone],
									team: team,
									cardInArray: cardId
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
								cardInArray: cardId
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
					if (!('toStack' in result)) result.toStack = [];

					result.toStack.push({'discardMission': [{
						pX : o.S.activePlayer,
						card : missionId
					}]})

					// if (!('discardMission' in result)) result.discardMission = [];
					// result.discardMission.push({
					// 	pX : o.S.activePlayer,
					// 	card : missionId
					// })
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
		if (module) {
			var result = {
				'toStack': [{
					'adMoveCardToZone': [{
						pX: args.pX,
						card: args.card,
						cause: 'discardMission',
						from: 'mission',
						to: 'chackra',
						team: null
					}]
				}]
			};
			return result;
		}
		// Actions.moveCardToZone({
		// 	pX: args.pX,
		// 	card: args.card,
		// 	cause: 'discardMission',
		// 	from: 'mission',
		// 	to: 'chackra',
		// 	team: null
		// }, o)
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
	},
	'setCicling' : function (func) {
		var hashes = [];
		var func = func;
		return function(args, o) {
			var hashe = func(args, o);
			for (var i in hashes) {
				if (hashes[i] == hashe) return false;
			}
			hashes.push(hashe);
			return true;
		}

	},
	/**
	 * [description]
	 * @param  {[type]} args {
	 *                       statuses : ['Puppet'],
	 *                       path : {
	 *                       	players : ['pA', 'pB'],
	 *                       	zones : ['attack', 'block']
	 *                       },
	 * }
	 * @param  {[type]} o    [description]
	 * @return {[type]}      [description]
	 */
	/**
	 * [description]
	 * @param  {[type]} dict [['текст ошибки',function(){return true/false}],...]
	 * @return {[type]}      [description]
	 */
	'canCheckDict':function(dict) {
        for (var i in dict) {
            if (dict[i][1]()) continue;
            return {
                "cause" : dict[i][0],
                "result": false
            }
        }
        return {"result": true};
	}
};

/**
 * Возврашает обект с приготовленными дейстиями
 * @param  {[type]} args обект с а аргументами
 * @param  {[type]} o стандартный объект {@link getUniversalObject}
 * @example 
 * args {
 *   numberOfCard : 2,
 *   player : 'pA'/'pB'
 * }
 * @return {[type]}	  [description]
 */
Actions.DrawXcards = function(args, o) {
	args.numberOfCard = args.numberOfCard || 1;
	var o2 = {
		pX: args.player,
		cards: []
	};
	// console.log('drawXcard'.bold.red)
	for (var i = 1; i <= args.numberOfCard; i++) {
		o2.cards.push(Actions['Draw Card'](args, o));
	}
	// console.log(o2.cards)
	o.S[args.player].isNewGame = false;
	if (!module) {
		AnimationPush({
			func: function() {
				AN.playerDrawCards(o2);
			},
			time: 1500,
			name: 'DrawXcards'
		});
		setTimeout(AN.preStack.countDown, 1510);
	}
	return {
		//'endGame' : [{player: args.player, condition:'lose', cause:'empty deck'}]
	}
}

/**
 * createTeamFromCard 
 * Используеться в {@link Action.moveCardToZone}, {@link Action.removeFromTeam},
 * @param  {Object} args 
 * { \n
 *    card :'c001', \n
 *    pX : 'pA',\n
 *    S : S,\n
 *    team : 3,\n
 *    teamCounter : 4,\n
 *    to : 'attack'/'block'/'viilage'\n
 * }
 * @param  {Object} o {@link getUniversalObject}
 * @example 
 */
Actions.createTeamFromCard =  function(args, o) {
	if (!args.teamCounter) {
		args.teamCounter = ++o.Meta.teamCounter
	}
	o.S[args.pX][args.to].team[args.teamCounter] = [args.card]
}

Actions.getCardForCondition = function(args, o) {
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
	var result = [];

	function check(card, args, cardId) {
		if (!card) return false;
		var statusCheck = true;

		if (args.statuses && args.statuses.length)  {
			if (card.statuses && card.statuses.length) {
				var checked = 0;
				for (var stat in args.statuses) {
					if (~card.statuses.indexOf(args.statuses[stat])) {
						if (args.greedy) return true;
						checked++;
					}
				}
			} else {
				if (!args.greedy) return false;
				statusCheck == false;
			}
			if (args.statuses.length == checked) {
				statusCheck == true;
			}
		}

		if (args.atributes && args.atributes.length ) {
			if (card.atributes && card.atributes.length) {
				var checked = 0;
				for (var atr in args.atributes) {
					if (~card.atributes.indexOf(args.atributes[atr])) {
						if (args.greedy) return true;
						checked++;
					}
				}
			} else {
				if (!args.greedy) return false;
				statusCheck == false;
			}
			if (args.statuses.length == checked) {
				statusCheck == true;
			}
		}
		if (args.injured) {
			if (o.S.statuses[cardId] && o.S.statuses[cardId].injured) {
				if (args.greedy) {
					return true;
				}
				statusCheck == true;
			}
			else {
				if (!args.greedy) return false;
				statusCheck == false;
			}
		}
		return statusCheck;
	}

	for (var pX in pXs) {
		for (var zone in zones) {
			if (!isZoneSimple(zones[zone])) {
				for (var team in o.S[pXs[pX]][zones[zone]].team) {
					for (var cId in o.S[pXs[pX]][zones[zone]].team[team]) {
						var cardId = o.S[pXs[pX]][zones[zone]].team[team][cId];
						var card = o.Known[o.Accordance[cardId]];
						if (check(card, args, cardId)) {
							result.push(cardId)
						};
					}
				}
			} else {
				for (var cId in o.S[pXs[pX]][zones[zone]]) {
					var cardId = o.S[pXs[pX]][zones[zone]][cId];
					var card = o.Known[o.Accordance[cardId]];
					if (check(card, args, cardId)) {
						result.push(cardId)
					};
				}
			}

		}
	}
	return result;

}

/**
 * [description]
 * @param  {Object} args 
 * { \n
 *    card :'c001', \n
 *    pX : 'pA',\n
 *    S : S,\n
 *    cause : 3,\n
 *    from : 4,\n
 *    to : 'attack'/'block'/'viilage'\n
 *    team : 'attack'/'block'/'viilage'\n
 * }
 * @param  {Object} o {@link getUniversalObject}
 * @return {[type]}	  [description]
 */
Actions.moveCardToZone = function(args, o) {
	// console.log('Move Card TO Zone')
	// console.log(args)
	
	//Triggers

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
			Actions.organisation({
				nochange : true,
				c1: {
					position: args.cardInArray == 0 ? 'leader' : 'support',
					owner: args.pX,
					zone: args.from,
					team: Actions.cardPath({card:args.card, path:{players:[args.pX], zones:[args.from]}},o).team,
					card : args.card
				},
				c2: {
					position: 'support',
					owner: args.pX,
					zone: args.to,
					team: args.team,
				}
			} ,o);

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
					if (C[args.card]) C[args.card].params.zona = args.to;
					// console.log('AnimationPush')
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
			} 
			else if (!isZoneSimple(args.to)) {
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
	// if (module) result = Actions.addTriggerEffect(result, 'moveCardToZone', args, o);
	
	if (!result.updTable.length) delete result.updTable;
	return result;
}
Actions.shuffle = function(args, o) {
	var accK = [];
	var accV = [];
	var exept = args.exept || [];
	if (typeof exept === 'string') {
		exept = [exept];
	}

	// console.log('exept'.red, exept)
	for (var i in o.S[args.pX][args.zone]) {
		var card = o.S[args.pX][args.zone][i];
	// console.log('indexOf'.red, ~exept.indexOf(card))
		if (!~exept.indexOf(card)) {
			accK.push(card);
			accV.push(o.Accordance[card]);
		}
	}
	// console.log(accV, accK)
	accV.sort(function() {
		return Math.random() - 0.5
	})
	accK.sort(function() {
		return Math.random() - 0.5
	})
	for (var i in accK) {
		o.Accordance[accK[i]] = accV[i]; 
	}
	// console.log(accV, accK)
}
Actions.randomSort = function(args, o) {
	o.S[args.pX][args.zone].sort(function() {
		return Math.random() - 0.5
	})
}
if (module) {
	module.exports = Actions;
}
