var Stadies = {
    order: [ 'start', 'draw', 'mission', 'organisation', 'attack', 'block', /*'jutsu',*/ 'shutdown', 'comeback', 'winner', 'end' ],
    current: 'organisation',
    start : {
        rusName : 'Начало хода',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        atStart : function() {}
    },
    draw : {
        rusName : 'Взятие карты',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        atStart : function() {}
    },
    mission : {
        rusName :  'Фаза миссии', //'Организовать команды'
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        atStart : function() {}
    },
    organisation: {
        rusName :  'Фаза организации', //'Выбрать команды для сражения',//
        workingUnit: 'card',
        clickAction: function( _this ) {
            organisationMove( _this );
        },
        party: 'attacker',
        atStart : function() {}
    },
    attack : {
        rusName : 'Фаза атаки',
        workingUnit : 'team',
        clickAction : function(_this){
            var obj =  {
                S : S,
                Known : Known,
                Accordance : Accordance,
                card : _this.id,
                pX : you,
                team : _this.params.team,
                from : _this.params.zona,
                to : (_this.params.zona == 'village' ? 'attack' : 'village'),
            };
            if (Can.moveTeamToAttack(obj)) {
                obj.S = obj.Known = obj.Accordance = null;
                socket.emit('moveTeamToAttack',{
                    u:Client, 
                    arg: obj 
                })
            }
        },
        party: 'attacker',
        atStart : function() {}
    },
    block : {
        rusName : 'Фаза блока',
        workingUnit : 'team',
        clickAction : function(_this){
            blockMove(_this);
        },
        party: 'blocker',
        atStart : function() {}
    },
    jutsu : {
        rusName : 'Обмен техниками',
        workingUnit : 'card',
        clickAction : null,
        party: 'both',
        atStart : function() {}
    },
    shutdown : {
        rusName : 'Фаза подсчета',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        atStart : function(o) {
        }
    },
    comeback : {
        rusName : 'Фаза возврата',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        atStart : function() {}
    },
    winner : {
        rusName : 'Фаза побы',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        atStart : function() {}
    },
    end : {
        rusName : 'Закончить хад',//'Конца хода',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        atStart : function() {}
    },
}
if (module) {
        module.exports = Stadies;
}
