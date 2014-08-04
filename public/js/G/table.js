/**
 * Из переданных индификотров карт создает команду. Определяя для каждой карты свою анимацию. 
 * @param {object} o Инофрмацию о картах в команде.
 * @param {array} o.support Инофрмацию о картах в команде.
 * @param {array} o.leader Инофрмацию о картах в команде.
 * @param {object} o2 Информация о расположения команды.
 * @param {object} o2.player Контролирующий игрок 'you' / 'opp' определяет в какаю строрнону будет "повернута" команда.
 * @param {integer} o2.X Отступ от верхнего края экрана в px.
 * @param {integer} o2.Y Отступ от левого края экарана в px
 * @param {string} o2.team Индификатор команды.
 * @param {string} o2.zona Индифификатор зоны который будет присвоен для карт в команде.
 */
function createteam( o, o2 ) {
    Log(1,'createteam');
    //Log(0,'team',o2.team);
    //Log(0,'zona', o2.zona);
    var a = -1; // множитель +-1 указывающий с какой стороны от центра расположена карта
    var gridWidth = 10 + 5 * o.support.length;
    if ( o.support.length % 2 == 1 ) {
        var gridWidth = 5 + 5 * o.support.length;
    }
    o.width = gridWidth * o2.sqr;
    var gridHeight;
    var gridCell = o2.sqr;
    var posTop = 0;
    var posLeft = o.width / 2 - 5 * gridCell;
    var oppMod1 = 0;
    if ( o2.player == 'opp' ) {
        oppMod1 = 4 * gridCell;
    }
    if (o.leader[0]) {
        createCard({
            id: o.leader[0],
            zona:o2.zona,
            owner:window[o2.player],
            team: o2.team,
            position:'leader'
        });
        window[o.leader[0]].animation( { X: posLeft + o2.X,
            Y: posTop + o2.Y + oppMod1, W: 10 * gridCell,
            additional: { outCard: true } } );
        window[o.leader[0]].changeZone(  o2.zona);
        window[o.leader[0]].params.team = o2.team;
        window[o.leader[0]].params.teamPosition = 'leader';
        window[o.leader[0]].setZIndex( 200 );
    }
    
    var countOdd = -2;
    
    for ( var i in o.support ) {
        a *= -1;
        var ii = Number( i ) + 1;
        if ( a < 0 )
            posLeft = o.width / 2 + (10 + ((ii / 2 - 1) * 5)) * a * gridCell;
        else
            posLeft = o.width / 2 + ((ii - 1) / 2 * 5 + 2) * gridCell;
        if ( countOdd < 0 ) {
            posTop = 6 * gridCell;
            if ( o2.player == 'opp' ) {
                posTop = posTop - 6 * gridCell;
            }
        }
        else {
            posTop = 1 * gridCell;
            if ( o2.player == 'opp' ) {
                posTop = posTop + 4 * gridCell;
            }
        }
        countOdd++;
        if ( countOdd === 2 ) {
            countOdd = -2;
        }
        createCard({
            id:o.support[i],
            zona:o2.zona,
            owner:window[o2.player],
            team: o2.team,
            position:'support'
        });
        window[o.support[i]].animation( { X: posLeft + o2.X, Y: posTop + o2.Y,
            W: 8 * gridCell, additional: { outCard: true } } );
        window[o.support[i]].changeZone( o2.zona );
        window[o.support[i]].params.team = o2.team;
        window[o.support[i]].params.teamPosition = 'support';
        window[o.support[i]].setZIndex( 200 );
        window[o.support[i]].removeTeamPower(o2.player);
    }
    if (o.leader[0]) {
        window[o.leader[0]].addTeamPower(o2.player);
    }
    Log(-1,'createteam');

}

//==============================================================================
/**
 * Полное обнолвение игрового стола. Все игровые лементы перемещаются согласно новому состоянию глобального объекта S.
 */
function startTable() {
    Log(1,'startTable');
    if (!clearS()) { 
        Log(0,'clearS', 'false');
        Log(-1,'startTable');
        return false;
    }
    // Подсчитать колическто клеток для всех команд обоих
    var totalSquareYou = getSquareForPlayer( { player: you } );
    var totalSquareOpp = getSquareForPlayer( { player: opp } );
    var totalSquareBtl = getSquareForBattle();

    var maxTotalSqrW = totalSquareYou.village.sqrW;
    if ( totalSquareYou.village.sqrW < totalSquareOpp.village.sqrW ) {
        maxTotalSqrW = totalSquareOpp.village.sqrW;
    }
    var maxTotalSqrH = totalSquareYou.village.sqrH + totalSquareOpp.village.sqrH;

    maxTotalSqrH = 50;
    var square = I.table.H / maxTotalSqrH;
    if ( square > I.table.W / maxTotalSqrW ) {
        square = I.table.W / maxTotalSqrW;
    }
    totalSquareBtl.square = square;
    // Пдсчитать расположение команд
    // применить анимацию
    startTablePlayer( { player: you, square: square, sqrH: maxTotalSqrH,
        sqrW: maxTotalSqrW, zones: totalSquareYou } );
    startTablePlayer( { player: opp, square: square, sqrH: maxTotalSqrH,
        sqrW: maxTotalSqrW, zones: totalSquareOpp } );

    // Боевая часть
    var sqrsMission = getSqrsMission();
    var sqrsClient = getSqrsClient();
    var grid = {
        W: sqrsMission + totalSquareBtl.W + sqrsClient,
        Wb: sqrsMission + totalSquareBtl.Wb + sqrsClient,
        Hb: 50,
        S: 0,
        total: {
            mission: sqrsMission, // левый край
            village: totalSquareBtl, // центр
            client: sqrsClient   // правый край
        }
    };
    grid.S = I.table.H / grid.Hb < I.table.W / grid.Wb ? I.table.H / grid.Hb : I.table.W / grid.Wb;
    startTableBattle( grid );
    Log(-1,'startTable');
}

/**
 * Опредеяет сколько улвных квадратов на поле будут занимать карты миссии.
 * @param {type} o
 * @returns {Number}
 */
function getSqrsMission( o ) {
    var result = 0;
    return result;
}

/**
 * Опредеяет сколько улвных квадратов на поле будут занимать карты клиентов.
 * @param {type} o
 * @returns {Number}
 */
function getSqrsClient( o ) {
    var result = 0;
    return result;
}
//==============================================================================
function getSquareForPlayer( o ) {
    Log(1,'getSquareForPlayer');
    var a = { player: o.player };
    Log(-1,'getSquareForPlayer');
    var result = { 
        village: getSquareForVillage( a ),
        mission: getSquareForMission( a ),
        client: getSquareForClient( a ),
    };
    return result;
}

function getSquareForMission( o ) {
    var result = { sqrH: 0, sqrW: 0 };
    return result;
}

function getSquareForClient( o ) {
    var result = { sqrH: 0, sqrW: 0 };
    return result;
}

function getSquareForVillage( o ) {
    Log(1,'getSquareForVillage');
    var result = { sqrH: 14, sqrW: 0 };
    var order = S[o.player].village.order;
    var team = S[o.player].village.team;
    for ( var i in order ) {
        var a = { link: team[order[i]] };
    //LogI.getSquareForVillage  = 1;
        var teamSqr = getSquareForTeam( a );
    //LogI.getSquareForVillage  = 0;
        result.sqrW += teamSqr.sqrW + 2;
        result.sqrH = teamSqr.sqrH > result.sqrH ? teamSqr.sqrH : result.sqrH;
        
    }
    result.sqrW++;
    result.sqrH += 2;
    Log(-1,'getSquareForVillage');
    return result;
}
//==============================================================================

function getSquareForTeam( o ) {
    Log(1,'getSquareForTeam');
    var result = { sqrH: 14, sqrW: 0 };
    result.sqrW = 10 + o.link.support.order.length * 5;
    Log(-1,'getSquareForTeam');
    return result;
}

function startTablePlayer( o ) {
    Log(1,'startTablePlayer');
    var result = false;
    var villageSqr = o.square;
    var leftX = o.square;
    var topY = I.table.Y + 4 * villageSqr;

    if ( o.player == you )
        topY = I.table.Y + (o.sqrH / 2 + 6) * villageSqr;

    if ( Stadies.current == 'attack' 
        || Stadies.current == 'block'  
        || Stadies.current == 'jutsu'
        || Stadies.current == 'shutdown' ) {
        villageSqr = 7 * o.square / 14;
        if ( I.table.W / o.zones.village.sqrW < villageSqr ) {
            villageSqr = I.table.W / o.zones.village.sqrW;
        }
        ;
        topY = I.table.Y + o.square;
        if ( o.player == you )
            topY = I.table.Y + (25 + 17) * o.square;
    }
    ;

    if ( o.zones.village.sqrW * villageSqr < I.table.W ) {
        leftX = (I.table.W - o.zones.village.sqrW * villageSqr) / 2 + o.square;
    }

    var order = S[o.player].village.order;
    var teams = S[o.player].village.team;

    for ( var i in order ) {
        var team = teams[order[i]];
        createteam(
            { leader: team.leader.order,
                support: team.support.order
            },
        { 
            sqr: villageSqr,
            Y: topY,
            X: leftX,
            player: o.player == you ? 'you' :'opp',
            team : order[i],
            zona: 'village'
        }
        );
        leftX += villageSqr * (12 + 5 * team.support.order.length);
        if ( team.support.order.length % 2 == 1 ) {
            //leftX -= 4 * villageSqr;
        }
    }
    Log(-1,'startTablePlayer');
    return result;
}

function getSquareForBattle( o ) {
    Log(1,'getSquareForBattle');

    // Количесвто пар на столе не может превышать количесвто атакующих команд
    // Поэетому парсим атакующих и сравниваем их с блокирующей командой
    // Записываем максимальную ширину
    var result = { W: 0, Wb: 0, H: 14, Hb: 16, pair: [ ] };
    var attacker = S.activePlayer;
    var blocker = attacker == 'pA' ? 'pB' : 'pA';
    var order = S[attacker].attack.order;
    var teams = S[attacker].attack.team;
    for ( var i in order ) {
        var teamA = teams[order[i]].support.order.length * 5 + 10;
        var blockerID = teams[order[i]].opposing;
        Log(0,'blockerID',blockerID);
        var teamB = 0;
        if (S[blocker].block.team[blockerID]){
            teamB = S[blocker].block.team[blockerID].support.order.length * 5 + 10;
        }
        var pairSqr = teamA > teamB ? teamA : teamB;
        result.pair.push( {
            attack: teams[order[i]],
            attackId: order[i],
            block: S[blocker].block.team[blockerID],
            blockId: blockerID,
            W: pairSqr
        } );
        result.W += 2 + pairSqr;
    }
    result.W = result.W > 2 ? result.W - 2 : 0;
    result.Wb = result.W > 2 ? result.W + 2 : result.W;
    Log(-1,'getSquareForBattle');
    return result;
}

function startTableBattle( grid ) {
    Log(1,'startTableBattle');
    Log(0,'grid',grid);
    var marginLeft = 0;
    var marginLeftOpp = 0;
    if ( grid.Wb * grid.S < I.table.W ) {
        marginLeft = marginLeftOpp = (I.table.W - grid.Wb * grid.S) / 2;
    }
    
    var oppRole , youRole;
    if (you === S.activePlayer) {
        youRole = 'attack';
        oppRole = 'block';
    } 
    else {
        youRole = 'block';
        oppRole = 'attack';
    }
        
    //Log(-1,'startTableBattle');
    for ( var i in grid.total.village.pair ) {
        var correctionOpp = 0;
        var correctionYou = 0;
        var pair = grid.total.village.pair[i];
        // console.log( pair );
        
        var attackCount =0;
        if ( pair[youRole]) {
            var attackCount = Math.floor( pair[youRole].support.order.length / 2 );
        }
        var blockCount = 0;
        if ( pair[oppRole]) {
            var blockCount = Math.floor( pair[oppRole].support.order.length / 2 );
        }
        if ( attackCount > blockCount ) {
            correctionOpp += 5 * (attackCount - blockCount) * grid.S;
        }
        if ( blockCount > attackCount ) {
            correctionYou += 5 * (blockCount - attackCount) * grid.S;
        }
        
        marginLeft += grid.S;
        if (pair[youRole]) {
            createteam(
                {
                    leader: pair[youRole].leader.order,
                    support: pair[youRole].support.order
                },
            {
                sqr: grid.S,
                player: 'you',
                X: marginLeft + correctionYou,
                Y: I.table.Y + I.table.H / 2 + grid.S,
                team: pair[youRole + 'Id'],
                zona: youRole
            }
            );
        }
        if (pair[oppRole]) {
            createteam(
                {
                    leader: pair[oppRole].leader.order,
                    support: pair[oppRole].support.order
                },
            {
                sqr: grid.S,
                player: 'opp',
                X: marginLeft + correctionOpp,
                Y: I.table.Y + 10 * grid.S,
                team: pair[oppRole + 'Id'],
                zona: oppRole
            }
            );
        };
        marginLeft += (pair.W + 1) * grid.S;
    }
    Log(-1,'startTableBattle');
}
