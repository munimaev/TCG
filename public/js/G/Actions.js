function isZoneSimple(name) {
	if ( name == 'deck' || name == 'discard' 
	        	|| name == 'chackra' || name == 'hand') {
		return true;
	}
	 return false;
}
function arraySearch(array, value) {
    for ( var i in array) {
        if (array[i] == value) {
            return i;
        }
    }
    return null
}
var Actions = {
	'Draw Card': function(o) {
		//for (var i in o) console.log(i)
		var S = o.S;
		var pX = o.pX;
		var draedCards = [];
		if (S[pX].deck.length) {
			var id = S[pX].deck.splice(0,1)[0]
			S[pX].hand.push(id);
			return id;
		};
	},
	'Draw X cards' : function(obj) {
		obj.count = obj.count || 6;
		var o = {
			pX : obj.pX,
			cards:[]
		};
		for (var i = 1; i <= obj.count; i++) {
			o.cards.push(Actions['Draw Card'](obj));
		}
		obj.S[obj.pX].isNewGame = false;
		if (!module) {
			AnimationPush({func:function() {
				AN.playerDrawCards(o);
			}, time:1500, name: 'Draw X cards'});
		}
	},
	'toNextPhase' : function(args, o) {
		var key = -1;
		for (var i in o.S) console.log('+'+i)
		for ( var i in o.Stadies.order ) {
		    if ( o.Stadies.order[i] == o.S.phase ) {
		        key = i;
		        break;
		    }
		}
	    var newKey = Number( key ) + 1;
	    if ( newKey >= o.Stadies.order.length ) {
	        newKey = 0;
	        o.S[o.S.activePlayer].turnCounter = o.S[o.S.activePlayer].turnCounter + 1;
	        o.S.activePlayer = o.S.activePlayer == 'pA' ? 'pB' : 'pA';
	        o.S.counters.playedNinjaActivePlayer = 0;
	    }

    	//console.log(o.S.phase + ' -> ' + o.Stadies.order[newKey])
    	o.S.phase = o.Stadies.order[newKey];
    	if (module) {
	    	if (o.S.phase+'AtStart' in Actions) {
	    		return Actions[o.S.phase+'AtStart'](o);
	    	}
	    }
    	else {
    		AN.changePahseName(Stadies[o.S.phase].rusName, AN.preStack.countDown);
    	}
    	//
    	// if (!module) {
    	// 	updTable(); 
	    // }
	},
	'moveCardToZone' : function (args, o) {
		var result = {
			updTable : [{players:'all'}],
		};
		o.from = args.from; 
		o.to = args.to;
		o.pX = args.pX;
		o.team = args.team;
		o.cardInArray = args.cardInArray;
		o.card = args.card;

	    if ( !isZoneSimple(o.from)) 
	    {
	        if ( isZoneSimple(o.to) )
	        {
	            o.S[o.pX][o.from].team[o.team].splice(o.cardInArray,1);
	            o.S[o.pX][o.to].push(o.card);
	            o.S.statuses[o.card] = {};

				if (!module) {
					C[o.card].params.zona = o.to;
					AnimationPush({func:function() {
						AN.moveCardToZone(o);
					}, time:1000, name: 'moveCardToZone'});
					setTimeout(AN.preStack.countDown,1000)
				}
	        }
	        else if ( !isZoneSimple(o.from) )
	        {

	            

	        }
	    } 
	    else if ( isZoneSimple(o.from) ) 
	    {
	        var ind = arraySearch(o.S[o.pX][o.from], o.card);
	        if (ind !== null) {
	            o.S[o.pX][o.from].splice(ind,1)
		        if ( isZoneSimple(o.to) ) 
		        {
	            	o.S[o.pX][o.to].push(o.card)

					if (!module) {
						C[o.card].params.zona = o.to;
						AnimationPush({func:function() {
							AN.moveCardToZone(o);
							AN.moveToHand(o);
						}, time:1000, name: 'moveCardToZone'});
						setTimeout(AN.preStack.countDown,1000)
					}
	            }
		        else if ( !isZoneSimple(o.to) ) 
		        {	
		        	Actions.createTeamFromCard(o);
					if (!module) {
						C[o.card].params.zona = o.to;
						AnimationPush({func:function() {
							AN.moveCardToZone(o);
							AN.moveToHand(o);
						}, time:1000, name: 'moveCardToZone'});
						setTimeout(AN.preStack.countDown,1000)
					}
		        }
	        }
	    }
	    return result;
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
	'createTeamFromCard' : function(o) {
		o.S[o.pX][o.to].team[o.teamCounter] = [o.card]
	},
	'updTable' : function(o) {
		updTable();
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
	'removeFromTeam' : function(o) {
		var key = arraySearch(o.S[o.pX][o.from].team[o.team] , 	o.card );
		o.S[o.pX][o.from].team[o.team].splice(key,1);
		Actions.createTeamFromCard(o)
		if (!module) {
			updTable();
		}
	},
	'addToTeam' : function(o) {
        Actions.organisation(o, true);
	},
	'organisation' : function(o, nochange) {

	    var nochange = nochange || false;
	    var card1pos = o.c1.position;
	    var card2pos = nochange ? 'support' : o.c2.position;
	    var owner = o.c1.owner;
	    var zone = o.c1.zone;
	    var team1 = o.c1.team;
	    var team2 = o.c2.team;
	    var Team1 = o.S[owner][zone].team[team1];
	    var Team2 = o.S[owner][zone].team[team2];

	    Actions.removeSelfFromTeam(o.S, o.c1 );

	    if (card2pos == 'leader') Team2.splice(0,0,o.c1.card );
	    else Team2.push( o.c1.card );

	    if ( !nochange ) {
	        Actions.removeSelfFromTeam(o.S, o.c2 );
	        if (card1pos == 'leader') Team1.splice(0,0,o.c2.card );
	        else Team1.push( o.c2.card );
	    } else {
            if (!Team1.length) {
            	delete o.S[owner][zone].team[team1];
            }
	    }
		if (!module) {
			if (o.pX == you) {
		        Card.prototype.hideActionCircle();
                G.selectedCard.select(false);
                G.selectedCard = null;
            }
			updTable();
		}
	},
	'removeSelfFromTeam' : function(S, c2) {
	    var team = S[c2.owner][c2.zone].team[c2.team];
	    for ( var i in team ) {
	        if ( team[i] == c2.card ) {
	            team.splice( i, 1 );
	            return true;
	        }
	    }
	    return false;
	},
	'moveTeamToAttack' : function(o) {
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
	'block' : function(o) {
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
					if (o.S.battlefield[i] == o.blockTeam ) o.S.battlefield[i] = null;
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
	'startAtStart' : function(o) {
		o.S.turnNumber = o.S.turnNumber + 1;
		if (!module) {
			AnimationPush({func:function() {
				AN.uturn(o);
			}, time:1210, name: 'startAtStart '});
		}
	},
	'missionAtStart' : function(o) {
		if (!module) {
			o.count = 1;
			o.pX = o.S.activePlayer;
			socket.emit('drawCardAtStartTurn', {u:Client});
		}
	},
	'comebackAtStart' : function(o) {
	},
	'applyToReult' : function(o) {

	},
	'shutdownAtStart' : function(o) {
		var result = {};//{'arg':{}, 'act':{}};
		var step1 = null, step2 = null;
		var adWinnerAndLoser = [];
		function adWinnerAndLoserPush(pX, zone, team, ad) {
			adWinnerAndLoser.push({pX : pX, zone: zone, team: team, ad: ad})
		}
		var blockResult = {};
        for (var attackID in o.S.battlefield) {
        	step1 = step2 = null;
			var attackTeam  = o.S[o.S.activePlayer].attack.team[attackID];
			var blockID     = o.S.battlefield[attackID];
			var blocker     = o.blocker = o.S.activePlayer == 'pA' ? 'pB' : 'pA';
			var attackPower = Actions.getTeamPower(attackTeam, o);
			// если атакующая команда заюблокирована
			if (blockID) {
				var blockTeam   = o.S[blocker].block.team[blockID];
				var blockPower  = Actions.getTeamPower(blockTeam, o);
				if (attackPower > blockPower) {
					if (attackPower - blockPower >= 5) {

						adWinnerAndLoserPush( blocker, 'block', blockID, 'completeDefeat');
						//blockResult = Actions.completeDefeat(blockTeam, o, blockID);

						adWinnerAndLoserPush( o.S.activePlayer, 'attack', attackID, 'completeWin');
						//blockResult = Actions.completeWin(attackTeam, o, attackID);
					} 
					else {

						adWinnerAndLoser.push(blocker, 'block', blockID, 'normalDefeat');
						//blockResult = Actions.normalDefeat(blockTeam, o, blockID);

						adWinnerAndLoser.push(o.S.activePlayer, 'attack', attackID, 'normalWin');
						//blockResult = Actions.normalWin(attackTeam, o, attackID);
					}
				}
				else if (attackPower < blockPower) {
					if (blockPower - attackPower >= 5) {

						adWinnerAndLoser.push(o.S.activePlayer, 'attack', attackID ,'completeDefeat');
						//blockResult = Actions.completeDefeat(attackTeam, o, attackID);

						adWinnerAndLoser.push(blocker,'block', blockID, 'completeWin');
						//blockResult = Actions.completeWin(blockTeam, o, blockID);
					} 
					else {

						adWinnerAndLoser.push(o.S.activePlayer, 'attack', attackID ,'completeDefeat');
						//blockResult = Actions.normalDefeat(attackTeam, o, attackID);

						adWinnerAndLoser.push(blocker,'block', blockID, 'completeWin');
						//blockResult = Actions.normalWin(blockTeam, o, blockID);
					}
				}
				else {

					adWinnerAndLoser.push(o.S.activePlayer, 'attack', attackID ,'drawBattle');
					//blockResult = Actions.drawBattle(attackTeam, o, attackID);

					adWinnerAndLoser.push(blocker,'block', blockID, 'drawBattle');
					//blockResult = Actions.drawBattle(blockTeam, o, blockID);
				}
			}
			else {
				if (attackPower >= 5) {

					adWinnerAndLoser.push(o.S.activePlayer, 'attack', attackID ,'completeReward');
					o.rewardToPlayer = o.S.activePlayer;
					//blockResult = Actions.completeReward(attackTeam, o, attackID);
				}
				else {

					adWinnerAndLoser.push(o.S.activePlayer, 'attack', attackID ,'normalReward');
					o.rewardToPlayer = o.S.activePlayer;
					//blockResult = Actions.normalReward(attackTeam, o, attackID);
				}
			}
        }

        //Actions.retrunTeamToVillage(o)
		

		if (!module) {
			updTable();
		} else {
			result.adWinnerAndLoser = adWinnerAndLoser;
			return result;
		}
	},
	'winnerAtStart' : function(o) {
		var pXs = [o.S.activePlayer,(o.S.activePlayer == 'pA' ? 'pB' : 'pA')];
		for (var pX in pXs) {
			if (o.S[pXs[pX]].rewards >= 10) {
				o.winner = pXs[pX];
				Actions.winner(o);
				Actions.stopGame(o);
				break;
			}
		}
	},
	'winner' : function(o) {
		if (!module) {
			AnimationPush({func:function() {
				AN.winner(o);
			}, time:1200, name: 'winner'});
		}
	},
	'stopGame' : function(o) {
		o.S.stop = true;
	},
	'completeDefeat' : function(team, o) {
		console.log('completeDefeat' , team)
		var result = {'givingDamage':[]};
		if (!team) return;
		o.damage = 1;
		o.causeOfDamage = 'completeDefeat';
		var damgeResult1 = {}, damgeResult2 = {};
		for (var i=1; i <= team.length - 1; i++) {
			result.givingDamage.push({pX:o.pX, team:o.team, zone:o.zone, card: team[i], damage: o.damage, type: 'fire'})
			//damgeResult1 = Actions.giveDamage(team[i],o);
		}
		o.damage = 2;
		result.givingDamage.push({pX:o.pX, team:o.team, zone:o.zone, card: team[0], damage: o.damage, type: 'fire'})
		//damgeResult2 = Actions.giveDamage(team[0],o);
		if (module) { 
			console.log('completeDefeat')
			return result;
		}
	},
	'normalDefeat' : function(team, o) {
		var result = {};
		if (!team) return;
		o.damage = 1;
		o.causeOfDamage = 'normalDefeat';

		result.givingDamage.push({pX:o.pX, team:o.team, zone:o.zone, card: team[0], damage: damage, type: 'fire'})
		//Actions.giveDamage(team[0],o);

		if (module) {
			return result;
		}
	},
	'completeWin' : function(team, o) {
		console.log('completeWin',team)
		var result = {};
		if (!team) return;
		if (module) {
			return result;
		}
	},
	'normalWin' : function(team, o) {
		var result = {};
		if (!team) return;
		if (module) {
			result = {'arg':{},act:'normalWin'};
			return result;
		}
	},
	'normalReward' : function(team, o) {
		var result = {};
		if (!team) return;
		o.rewardsCount = 1;
		o.causeOfReward = 'normalReward';
		Actions.giveReward(team[0],o);
		if (module) {
			result = {'arg':{},act:'normalReward'};
			return result;
		}
	},
	'completeReward' : function(team, o) {
		var result = {};
		if (!team) return;
		o.rewardsCount = 2;
		o.causeOfReward = 'completeReward';
		Actions.giveReward(team[0],o);
		if (module) {
			result = {'arg':{},act:'completeReward'};
			return result;
		}
	},
	'drawBattle' : function(team, o) {
		var result = {};
		if (!team) return;
		o.damage = 1;
		o.causeOfDamage = 'drawBattle';
		Actions.giveDamage(team[0],o);
		if (module) {
			result = {'arg':{},act:'drawBattle'};
			return result;
		}
	},
	'giveDamage' : function(cardID, o) {
		var result = {damageResult:[]};
		if (!module) {
			AnimationPush({func:function() {
				AN.damage(cardID,o);
			}, time:610, name: 'giveDamage'});
		}
		if (o.damage == 1) {
			if (Actions.getHealtStatus(cardID, o)) {
				result.damageResult.push({pX:o.pX, team:o.team, zone:o.zone, card: o.card, result: 'injured'});
				//Actions.injureTarget(cardID, o);
			}
			else {
				result.damageResult.push({pX:o.pX, team:o.team, zone:o.zone, card: o.card, result: 'death'});
				//Actions.killTarget(cardID, o);
			}
		} else if (o.damage >=2) {
			result.damageResult.push({pX:o.pX, team:o.team, zone:o.zone, card: o.card, result: 'death'});
			//Actions.killTarget(cardID, o);
		}
		return result;
	},
	'giveReward' : function(cardID, o) {
		if (!module) {
			for (var i = 1; i <= o.rewardsCount; i++) {
				AnimationPush({func:function() {
					AN.reward(cardID,o);
				}, time:610, name: 'giveReward'});
			}
		}
		o.S[o.rewardToPlayer].rewards += o.rewardsCount;
	},
	'injureTarget' : function(cardID, o) {
		if (!(cardID in o.S.statuses)) o.S.statuses[cardID] = {};
		o.S.statuses[cardID].injured = true;
		if (!module) {
			C[cardID].injure();
			setTimeout( AN.preStack.countDown, 500);
		}
	},
	'killTarget' : function(cardID, o) {
		var result = {'moveCardToZone' : [], 'afterQuestion':[]};
		var pXs = ['pA', 'pB'];
		var zones = ['village', 'attack','block'];
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
								pX:o.pX, from:o.from, team:o.team, card: o.card, to: o.to, cardInArray: o.card
							});
							//Actions.moveCardToZone(o2)
							

							if (card == 0) {
								result.afterQuestion.push({
									question: 'newLeader', pX:o.pX, zone:o.zone, team:o.team
								});
								if (!module) {
									AN.stop = true;
									AN.Questions.newLeader({
										pX:pXs[pX],
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
		return result;
	},
	'retrunTeamToVillage'  : function (o) {
		var pXs = ['pA','pB'];
		var zones = ['attack','block'];
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
	},
	'getTeamPower' : function(team, o) {
		var result = 0;
		if (!team) return result;
		result += Actions.getLeaderPower(team[0], o);
		for (var i = 1 ; i <= team.length - 1 ;i++) {
			result += Actions.getSupportPower(team[i], o);
		}
		return result;
	},
	'getLeaderPower' : function(cardID, o) {
		var card = o.Known[o.Accordance[cardID]];
		if (Actions.getHealtStatus(cardID, o)) {
			return card.ah;
		}
		else {
			return card.ai;
		}
	},
	'getSupportPower' : function(cardID, o) {
		var card = o.Known[o.Accordance[cardID]];
		if (Actions.getHealtStatus(cardID, o)) {
			return card.sh;
		}
		else {
			return card.sh;
		}
	},
	'getHealtStatus' : function(cardID, o) {
		if (o.S.statuses[cardID] && o.S.statuses[cardID].injured) {
			return false;
		}
		return true;
	},
	'getInjuredPower' : function(o) {
		var result = '';
		result += o.Known[o.Accordance[o.cardID]].ai;
		result += '/';
		result += o.Known[o.Accordance[o.cardID]].si;
		return result;
	},
	'newLeader' : function(args, o) {
		var result = {}
		var team = o.S[args.pX][args.zone].team[args.team]; 
		for (var i in team) {
			if (team[i] == args.card) {
				team.splice(0,0,team.splice(i,1)[0]); // Вырезает итый элемент и вставляет в начало массива
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
	'preStackDone' : function(table, o) {
		console.log('table',table.preStack)
		o.answers = table.answers;
		var results = [];
		var result = {};
		for (var func in table.stackPrep) {
			for (var args in table.stackPrep[func]) {
				console.log('stackPrep', func)
				results.push( Actions[func]( table.stackPrep[func][args], o ) );
			}
		}
		var befor = [];
		for (var ans in table.answers) {
			for (var args in table.answers[ans]) {
				befor.push(Actions[ans](table.answers[ans][args], o));
			}
		}
		for (var i in results) {
			if (results[i]) {
				for (var name in results[i]) {
					if (!(name in result)) result[name] = [];
					for (var act in results[i][name]) {
						result[name].push(results[i][name][act])
					}
				}
			}
		}
		if (befor.length) {
			result.befor = {};
			for (var arr in befor) {
				for (var act in befor[arr]) {
					if (!(act in result.befor))  result.befor[act] = [];
					for (var args in befor[arr][act]) {
						result.befor[act].push(befor[arr][act][args])
					}
				}
			}
		}
		return result;
	},
	'adWinnerAndLoser' : function(args, o) {
		console.log('\nadWinnerAndLoser')
		o.pX = args.pX;
		o.zone =args.zone;
		o.team = args.team;
		var team = o.S[args.pX][args.zone].team[args.team];
		return Actions[args.ad](team, o);
	},
	'givingDamage' : function(args, o) {
		console.log('\ngivingDamage')
		o.pX = args.pX;
		o.zone =args.zone;
		o.team = args.team;
		o.card = args.card;
		o.damage = args.damage;
		return Actions.giveDamage(args.card,o);
	},
	'damageResult' : function(args, o) {
		console.log('\ndamageResult')
		o.pX = args.pX;
		o.zone =args.zone;
		o.team = args.team;
		o.card = args.card;
		o.result = args.result;
		if (args.result == 'death')   return Actions.killTarget(args.card,o);
		if (args.result == 'injured') return Actions.injureTarget(args.card,o);
		return {};
	},
	'log' : function() { console.log('msg')}
};
if (module) {
		module.exports = Actions;
}
