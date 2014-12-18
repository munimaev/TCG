
function arraySearch(array, value) {
    for ( var i in array) {
        //console.log('msg',i,array[i], value)
        if (array[i] == value) {
            return i;
        }
    }
    return null
}
var Can = {
    block : function(o) {
        if (o.pX != o.S.activePlayer
            && o.attackTeam in o.S[o.S.activePlayer].attack.team
            && (o.blockTeam in o.S[o.pX].block.team 
                || o.blockTeam in o.S[o.pX].village.team
                || o.blockTeam == null)
            ) {
            return true;
        }
    },
    charge : function(args, o) {
        if ( o.S.phase == 'mission' 
             && o.S.activePlayer == args.pX  
             && arraySearch(o.S[args.pX].hand, args.card) !== null
             && o.Known[o.Accordance[args.card]]
             && o.Known[o.Accordance[args.card]].owner == args.pX) 
        {
            return true;
        } 
        else 
        {
            return false;
        }
    },
    drawCardAtStartTurn : function(o) {
        if (o.S.activePlayer == o.pX
            && o.S.phase == 'mission'
            && !o.S[o.pX].isDrawCardAtStartTurn
            && o.S.turnNumber > 0
        ) {
            return true;
        } else {
            return false
        }
    },
    /**
     * @param  {[type]} o [description]
     * @param  {[type]} o.S
     * @param  {[type]} o.Known
     * @param  {[type]} o.Accordance
     * @param  {[type]} o.card
     * @param  {[type]} o.pX
     * @param  {[type]} o.team
     * @param  {[type]} o.from
     */
    moveTeamToAttack : function (o) {
        if ( o.S.phase == 'attack'
             && o.Known[o.Accordance[o.card]].type  == 'N' 
             && o.Known[o.Accordance[o.card]].owner == o.pX 
             && o.S.activePlayer == o.pX
             && o.S[o.pX][o.from].team[o.team]
             && arraySearch(o.S[o.pX][o.from].team[o.team], o.card) !== null
        ){
            return true;
        }
        return false;
    },
    moveTeamToBlock : function (o) {
        if ( o.S.phase == 'block'
             && o.Known[o.Accordance[o.card]].type  == 'N' 
             && o.Known[o.Accordance[o.card]].owner == o.pX 
             && o.S.activePlayer != o.pX
             && o.S[o.pX][o.from].team[o.team]
             && arraySearch(o.S[o.pX][o.from].team[o.team], o.card) !== null
        ){
            return true;
        }
        return false;
    },
    /**
     * Можно ли поменять местами с этой картой
     * @param  {[type]} o [description]
     * @param  {[type]} o.S
     * @param  {[type]} o.Known
     * @param  {[type]} o.Accordance
     * @param  {[type]} o.card - первая выбранная
     * @param  {[type]} o.team
     * @param  {[type]} o.zone
     */
    newLeader : function (o) {
        if ( /*o.S.phase == 'shutdown' TODO  Перенести переход в новую фазу как первую ступень preStack
             &&*/ o.Known[o.Accordance[o.card]].type  == 'N' 
             && o.Known[o.Accordance[o.card]].owner == o.pX 
             && o.S[o.pX][o.zone].team[o.team]
             && arraySearch(o.S[o.pX][o.zone].team[o.team], o.card) !== null
        ){
            return true;
        }
        console.log(o.S.phase == 'shutdown'
             , o.Known[o.Accordance[o.card]].type  == 'N' 
             , o.Known[o.Accordance[o.card]].owner == o.pX 
             , o.S[o.pX][o.zone].team[o.team]
             , arraySearch(o.S[o.pX][o.zone].team[o.team], o.card) !== null
        )
        console.log(o.card, o.team, o.zone, o.pX);
        console.log(o.S[o.pX][o.zone].team)
        return false;
    },
    /**
     * Можно ли поменять местами с этой картой
     * @param  {[type]} o [description]
     * @param  {[type]} o.S
     * @param  {[type]} o.Known
     * @param  {[type]} o.Accordance
     * @param  {[type]} o.c1.card - первая выбранная
     * @param  {[type]} o.c2.card - вторая выбранная
     * @param  {[type]} o.pX
     */
    orgAddToTeam : function(args, o){
        console.log(  o.S.phase == 'organisation'
             , o.Known[o.Accordance[args.c1.card]].type == 'N' 
             , o.Known[o.Accordance[args.c2.card]].type== 'N' 
             , o.Known[o.Accordance[args.c1.card]].type  
             , o.Known[o.Accordance[args.c2.card]].type
             , o.Known[o.Accordance[args.c1.card]].owner == args.pX 
             , o.Known[o.Accordance[args.c2.card]].owner == args.pX 
             , o.Known[o.Accordance[args.c1.card]].owner
             , o.Known[o.Accordance[args.c2.card]].owner
             , args.pX  )
        if ( o.S.phase == 'organisation'
             && o.Known[o.Accordance[args.c1.card]].type == 'N' 
             && o.Known[o.Accordance[args.c2.card]].type == 'N' 
             && o.Known[o.Accordance[args.c1.card]].owner == args.pX 
             && o.Known[o.Accordance[args.c2.card]].owner == args.pX 
        ){
            for (var i in o.S[args.pX].village.team) {
                if (arraySearch(o.S[args.pX].village.team[i], args.c2.card) !== null) {
                    return true;
                }
            }
        }
        console.log(args)
        return false;
    },
    /**
     * Можно ли поменять местами с этой картой
     * @param  {[type]} o [description]
     * @param  {[type]} o.S
     * @param  {[type]} o.Known
     * @param  {[type]} o.Accordance
     * @param  {[type]} o.c1
     * @param  {[type]} o.c1.card
     * @param  {[type]} o.c2
     * @param  {[type]} o.c2.card
     * @param  {[type]} o.pX
     */
    organisation : function(o) {
        if ( o.S.phase == 'organisation'
             && o.Known[o.Accordance[o.c1.card]].type == 'N' 
             && o.Known[o.Accordance[o.c2.card]].type == 'N' 
             && o.Known[o.Accordance[o.c1.card]].owner == o.pX 
             && o.Known[o.Accordance[o.c2.card]].owner == o.pX 
        ){
            return true;
        }
        console.log(o.S.phase == 'organisation'
             , o.Known[o.Accordance[o.c1.card]].type == 'N' 
             , o.Known[o.Accordance[o.c2.card]].type == 'N' 
             , o.Known[o.Accordance[o.c1.card]].owner == o.pX 
             , o.Known[o.Accordance[o.c2.card]].owner == o.pX)
        return false;
    },
    /**
     * Можно ли поменять местами с этой картой
     * @param  {[type]} o [description]
     * @param  {[type]} o.S
     * @param  {[type]} o.Known
     * @param  {[type]} o.Accordance
     * @param  {[type]} o.card
     * @param  {[type]} o.pX
     */
    orgChangeInTeam : function(args, o){
        if ( o.S.phase == 'organisation'
             && o.Known[o.Accordance[args.c1.card]].type == 'N' 
             && o.Known[o.Accordance[args.c2.card]].type == 'N' 
             && o.Known[o.Accordance[args.c1.card]].owner == args.pX 
             && o.Known[o.Accordance[args.c2.card]].owner == args.pX 
        ){
            return true;
        }
        console.log(o.S.phase == 'organisation'
             , o.Known[o.Accordance[args.c1.card]].type == 'N' 
             , o.Known[o.Accordance[args.c2.card]].type == 'N' 
             , o.Known[o.Accordance[args.c1.card]].owner == args.pX 
             , o.Known[o.Accordance[args.c2.card]].owner == args.pX)
        return false;
    },
	pressNextBtn : function(o) {
        if (o.S.stop) return false;
        if ( o.Stadies[o.S.phase].party == 'both') { 
    	    if (o.pX == o.S.activePlayer) {
    	    	if (o.meta.toNextPhase[o.pX] == false) {
    	    		return true;
    	    	} else {
    	    		return false;
    	    	}
    	    } else {
    	    	if (o.meta.toNextPhase[o.S.activePlayer] == true) {
    	    		return true;
    	    	} else {
    	    		return false;
    	    	}
    	    }
        }
        else if ( o.Stadies[o.S.phase].party == 'attacker') { 
            if (o.pX == o.S.activePlayer) {
                return true;
            } else {
                return false;
            }
        }
       else if ( o.Stadies[o.S.phase].party == 'blocker') { 
            if (o.pX == o.S.activePlayer) {
                return false;
            } else {
                return true;
            }
        }
	},
    putInPlay : function(args, o) {
        if ( o.S.phase == 'mission' 
             && !o.S.stack.length
             && o.S.activePlayer == args.pX  
             && arraySearch(o.S[args.pX].hand, args.card) !== null
             && o.Known[o.Accordance[args.card]]
             && ((o.Known[o.Accordance[args.card]].type == 'M'
                    && o.S[args.pX].counters.playedMission == 0)
                || (o.Known[o.Accordance[args.card]].type == 'N'
                    && o.S.counters.playedNinjaActivePlayer == 0 ))
             && o.Known[o.Accordance[args.card]].owner == args.pX 
             && o.S[args.pX].turnCounter >=  o.Known[o.Accordance[args.card]].ec) {
            return true;
        }
        else {
            if (module) {
            console.log(  
                 o.S.phase == 'mission' 
                 , arraySearch(o.S[args.pX].hand, args.card) !== null
                 , o.Known[o.Accordance[args.card]]
                 , '\n(' 
                 , o.Known[o.Accordance[args.card]].type == 'M' 
                 , '&&'
                 , o.S[args.pX].counters.playedMission == 0
                 , '||'
                 , o.Known[o.Accordance[args.card]].type == 'N'
                 , '&&'
                 ,  o.S.counters.playedNinjaActivePlayer == 0 
                 , ')\n'
                 , o.Known[o.Accordance[args.card]].owner == args.pX 
                 , o.S[args.pX].turnCounter >=  o.Known[o.Accordance[args.card]].ec
                 )
            }
        }
    },
    playJutsu : function(args, o) {
        if ( o.S.phase == 'jutsu' 
             && arraySearch(o.S[args.pX].hand, args.card) !== null
             && o.Known[o.Accordance[args.card]] 
             && o.Known[o.Accordance[args.card]].type == 'J' 
             && o.Known[o.Accordance[args.card]].owner == args.pX
             && Can.enoughChakra(args, o)) 
        {
        	for (var i in o.Known[o.Accordance[args.card]].target) {
        		args.targetKey = i;
        		if (!Can.areAvailableTargets(args, o).length) {
        			allTarget = false;
        			break;
        		}
        	}
        	if (!Can.areAvailableUsers(args, o).length) return false; 
        	delete args.targetKey;
            return true;
        }
        else {
            // console.log(o.S.phase == 'jutsu' 
            //  , arraySearch(o.S[args.pX].hand, args.card) !== null
            //  , o.Known[o.Accordance[args.card]]
            //  )
        }
    },
    'areAvailableTargets' : function(args, o) { 

        var jutsu = o.Known[o.Accordance[args.card]];
        var target = args.targetKey ? jutsu.target[args.targetKey] : jutsu.target[0];

        var player = target.player == 'you' ? args.pX : (args.pX == 'pA' ? 'pB' : 'pa');
        if (target.zone == 'battle') {
            var role = player == o.S.activePlayer ? 'attack' : 'block';
        }
        else {
            role = target.zone;
        }

        var result = [];
        for (var i in o.S[player][role].team) {
            for (var c in o.S[player][role].team[i]) {
                var ninja = o.S[player][role].team[i][c];
                if ( target.func(o.Known[o.Accordance[ninja]], o)) {
                    result.push(ninja);
                }
            }
        }
        return result;
    },
    'areAvailableUsers' : function(args, o) {
        var result = [];

		var role = args.pX == o.S.activePlayer ? 'attack' : 'block';
		for (var i in o.S[args.pX][role].team) {
			for (var c in o.S[args.pX][role].team[i]) {
				var ninja = o.S[args.pX][role].team[i][c];
				if ( o.Known[o.Accordance[args.card]].requirement(o.Known[o.Accordance[ninja]], o)) {
					result.push(ninja);
				}
			}
		}

        return result;
    },
    /**
     * [description]
     * @param  {[type]} args {
     *                       cost : ['1'] || card : 'c011',
     *                       pX: 'pA'
     * }
     * @param  {[type]} o    [description]
     * @return {[type]}      [description]
     */
    'enoughChakra' : function(args, o) {
        var result = true;
       	var costs = args.cost || o.Known[o.Accordance[args.card]].cost;

       	var chackraDefault = []
       	for (var i in o.S[args.pX].chackra) {
       		var card = o.S[args.pX].chackra[i];
       		chackraDefault.push((o.Known[o.Accordance[card]].elements).split())
       	}
       	for (var c in costs) {

       		var chackra = [];
       		for (var i in chackraDefault) chackra.push(chackraDefault[i]);
            
       		var cost = [];
           	for (var i in costs[c]) {
                cost.push(costs[c][i]);
            }

            //console.log(cost, chackraDefault);

       		nextElementInCost:
       		for (var i in cost) { // перебираем элементы в цене
       			var itIs = false;
       			nextCardInChackra:
       			for (var j = chackraDefault.length - 1; j >= 0; j--) { // перебираем карты в чакре
       				// console.log(cost[i] , chackraDefault[j])
       				if (cost[i] == '1') {
       					itIs = true;
       					chackraDefault.splice(j,0)
       					continue nextElementInCost;
       				}
       				for (var k in chackraDefault[j]) { // перебираем элементы в карте чакры
       					if (chackraDefault[j][k] == cost[i]) {
	       					itIs = true;
       						chackraDefault.splice(j,0)
	       					continue nextElementInCost;
       					}
       				}
       			}
       			if (!itIs) {
       				result = false;
       			}
       		}

       	}
        console.log('can', result)
        return result;
    },
    removeFromTeam : function(o){
        if ( o.S.phase == 'organisation'
             && o.Known[o.Accordance[o.card]].type == 'N' 
             && o.Known[o.Accordance[o.card]].owner == o.pX 
        ){
            for (var i in o.S[o.pX].village.team) {
                if (arraySearch(o.S[o.pX].village.team[i], o.card) !== null) {
                    if (o.S[o.pX].village.team[i].length < 2) {
                        console.log('bad 2')
                        console.log(o.S[o.pX].village.team)
                        return false;  
                    }
                        console.log('good 2')
                    return true;
                }
            }
        }
        console.log(o.S.phase == 'organisation'
             , o.Known[o.Accordance[o.card]].type == 'N' 
             , o.Known[o.Accordance[o.card]].owner == o.pX)
        return false;
    },
}
if (module) {
    Actions = require(__dirname+'/Actions.js');
	module.exports = Can;
}
