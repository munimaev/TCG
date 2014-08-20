
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
    charge : function(o) {
        if ( o.S.phase == 'mission' 
             && arraySearch(o.S[o.pX].hand, o.card) !== null
             && o.Known[o.Accordance[o.card]]
             && o.Known[o.Accordance[o.card]].owner == o.pX) 
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
     * @param  {[type]} o.c1.card - первая выбранная
     * @param  {[type]} o.c2.card - вторая выбранная
     * @param  {[type]} o.pX
     */
    orgAddToTeam : function(o){
        console.log(  o.S.phase == 'organisation'
             , o.Known[o.Accordance[o.c1.card]].type == 'N' 
             , o.Known[o.Accordance[o.c2.card]].type == 'N' 
             , o.Known[o.Accordance[o.c1.card]].owner == o.pX 
             , o.Known[o.Accordance[o.c2.card]].owner == o.pX )
        if ( o.S.phase == 'organisation'
             && o.Known[o.Accordance[o.c1.card]].type == 'N' 
             && o.Known[o.Accordance[o.c2.card]].type == 'N' 
             && o.Known[o.Accordance[o.c1.card]].owner == o.pX 
             && o.Known[o.Accordance[o.c2.card]].owner == o.pX 
        ){
            for (var i in o.S[o.pX].village.team) {
                if (arraySearch(o.S[o.pX].village.team[i], o.c2.card) !== null) {
                    return true;
                }
            }
        }
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
    orgChangeInTeam : function(o){
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
	putInPlay : function(o) {
        if ( o.S.phase == 'mission' 
        	 && arraySearch(o.S[o.pX].hand, o.card) !== null
        	 && o.Known[o.Accordance[o.card]].type == 'N' 
        	 && o.Known[o.Accordance[o.card]].owner == o.pX 
             && o.S.counters.playedNinjaActivePlayer == 0  
             && o.S[o.pX].turnCounter >=  o.Known[o.Accordance[o.card]].ec) {
            return true;
        }
        else {
            console.log(  
              /*o.Known[o.Accordance[o.card]].owner , o.pX*/ )
        }
    },
    removeFromTeam : function(o){
        if ( o.S.phase == 'organisation'
             && o.Known[o.Accordance[o.card]].type == 'N' 
             && o.Known[o.Accordance[o.card]].owner == o.pX 
        ){
            for (var i in o.S[o.pX].village.team) {
                if (arraySearch(o.S[o.pX].village.team[i], o.card) !== null) {
                    if (o.S[o.pX].village.team[i].length < 2) return false;  
                    return true;
                }
            }
        }
        return false;
    },
}
if (module) {
	module.exports = Can;
}
