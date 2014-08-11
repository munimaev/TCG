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
		var S = o.S;
		var pX = o.pX;
		var draedCards = [];
		if (S[pX].deck.length) {
			var id = S[pX].deck.splice(0,1)[0]
			S[pX].hand.push(id);
			return id;
		};
	},
	'Draw 6 cards' : function(obj) {
		var o = {
			pX : obj.pX,
			cards:[]
		};
		for (var i = 1; i <= 6; i++) {
			o.cards.push(Actions['Draw Card'](obj));
		}
		if (!module) {
			AnimationPush({func:function() {
				AN.playerDrawCards(o);
			}, time:1500, name: 'Draw 6 cards'});
		}
	},
	'toNextPhase' : function(o) {
		var key = -1;
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

    	if (o.S.phase+'AtStart' in Actions) {
    		Actions[o.S.phase+'AtStart'](o);
    	}
    	if (!module) {
    		updTable(); 
	    	if (o.Stadies[o.S.phase].autoNextPhase && !o.S.stop) {
				AnimationPush({func:function() {
					o.pX = you;
					AN.autoNextPhase(o);
				}, time:100, name: 'autoNextPhase'});
	    	}
	    }

	},
	'moveCardToZone' : function (o) {
		// o.from 
		// o.to
		// p.pX
	    if ( !isZoneSimple(o.from)) 
	    {
	        if ( isZoneSimple(o.to) )
	        {
	            o.S[o.pX][o.from].team[o.team].splice(o.cardInArray,1);
	            o.S[o.pX][o.to].push(o.cardID);
	            o.S.statuses[o.cardsID] = {};

				if (!module) {
					C[o.cardID].params.zona = o.to;
					//console.log('--> ' + o.cardID)
					AnimationPush({func:function() {
						AN.moveCardToZone(o);
					}, time:1000, name: 'moveCardToZone '});
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
						}, time:1000, name: 'moveCardToZone '});
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
						}, time:1000, name: 'moveCardToZone '});
					}
		        }
	        }
	    }

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
		if (!module) {
			AnimationPush({func:function() {
				AN.uturn(o);
			}, time:1000, name: 'startAtStart '});
		}
	},
	'comebackAtStart' : function(o) {
	},
	'shutdownAtStart' : function(o) {
        for (var attackID in o.S.battlefield) {
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
						Actions.completeDefeat(blockTeam, o);
						Actions.completeWin(attackTeam, o);
					} 
					else {
						Actions.normalDefeat(blockTeam, o);
						Actions.normalWin(attackTeam, o);
					}
				}
				else if (attackPower < blockPower) {
					if (blockPower - attackPower >= 5) {
						Actions.completeDefeat(attackTeam, o);
						Actions.completeWin(blockTeam, o);
					} 
					else {
						Actions.normalDefeat(attackTeam, o);
						Actions.normalWin(blockTeam, o);
					}
				}
				else {
					Actions.drawBattle(attackTeam, o);
					Actions.drawBattle(blockTeam, o);
				}
			}
			else {
				if (attackPower >= 5) {
					o.rewardToPlayer = o.S.activePlayer;
					Actions.completeReward(attackTeam, o);
				}
				else {
					o.rewardToPlayer = o.S.activePlayer;
					Actions.normalReward(attackTeam, o);
				}
			}
        }

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
		if (!module) {
			updTable();
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
		if (!team) return;
		o.damage = 1;
		o.causeOfDamage = 'completeDefeat';
		for (var i=1; i <= team.length - 1; i++) {
			Actions.giveDamage(team[i],o);
		}
		o.damage = 2;
		Actions.giveDamage(team[0],o);
	},
	'normalDefeat' : function(team, o) {
		if (!team) return;
		o.damage = 1;
		o.causeOfDamage = 'normalDefeat';
		Actions.giveDamage(team[0],o);
	},
	'completeWin' : function(team, o) {
		if (!team) return;
	},
	'normalWin' : function(team, o) {
		if (!team) return;
	},
	'normalReward' : function(team, o) {
		if (!team) return;
		o.rewardsCount = 1;
		o.causeOfReward = 'normalReward';
		Actions.giveReward(team[0],o);
	},
	'completeReward' : function(team, o) {
		if (!team) return;
		o.rewardsCount = 2;
		o.causeOfReward = 'completeReward';
		Actions.giveReward(team[0],o);
	},
	'drawBattle' : function(team, o) {
		if (!team) return;
		o.damage = 1;
		o.causeOfDamage = 'drawBattle';
		Actions.giveDamage(team[0],o);
	},
	'giveDamage' : function(cardID, o) {
		if (!module) {
			AnimationPush({func:function() {
				AN.damage(cardID,o);
			}, time:610, name: 'giveDamage'});
		}
		if (o.damage == 1) {
			if (Actions.getHealtStatus(cardID, o)) {
				Actions.injureTarget(cardID, o);
			}
			else {
				Actions.killTarget(cardID, o);
			}
		} else if (o.damage >=2) {
			Actions.killTarget(cardID, o);
		}
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
		}
	},
	'killTarget' : function(cardID, o) {
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
							o.cardID = cardID;

							var o2 = {};
							for (var i in o) o2[i] = o[i]
							Actions.moveCardToZone(o2)
							break;
						}
					}
				}
			}
		}
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
	'log' : function() { console.log('msg')}
};
if (module) {
		module.exports = Actions;
}
