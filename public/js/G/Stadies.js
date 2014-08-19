var Stadies = {
    order: [ 'start', /*'draw',*/ 'mission', 'organisation', 'attack', 'block', /*'jutsu',*/ 'shutdown'/*, 'comeback', 'winner', 'end'*/ ],
    current: 'organisation',
    start : {
        rusName : 'Начало хода',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        autoNextPhase : true,
    },
    draw : {
        rusName : 'Взятие карты',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        autoNextPhase : true,
    },
    mission : {
        rusName :  'Фаза миссии', //'Организовать команды'
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        autoNextPhase : false,
    },
    organisation: {
        rusName :  'Фаза организации', //'Выбрать команды для сражения',//
        workingUnit: 'card',
        clickAction: function( _this ) {
            organisationMove( _this );
        },
        party: 'attacker',
        autoNextPhase : false,
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
        autoNextPhase : false,
    },
    block : {
        rusName : 'Фаза блока',
        workingUnit : 'team',
        clickAction : function(_this){
            blockMove(_this);
        },
        party: 'blocker',
        autoNextPhase : false,
    },
    jutsu : {
        rusName : 'Обмен техниками',
        workingUnit : 'card',
        clickAction : null,
        party: 'both',
        autoNextPhase : false,
    },
    shutdown : {
        rusName : 'Фаза подсчета',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        autoNextPhase : true,
    },
    comeback : {
        rusName : 'Фаза возврата',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        autoNextPhase : true,
    },
    winner : {
        rusName : 'Фаза побы',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        autoNextPhase : true,
    },
    end : {
        rusName : 'Закончить хад',//'Конца хода',
        workingUnit : 'card',
        clickAction : null,
        party: 'attacker',
        autoNextPhase : true,
    },
}
if (module) {
        module.exports = Stadies;
}
