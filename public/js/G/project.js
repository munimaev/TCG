var game;
/**
 * Наверняка, устаревшая функция анимирующая взятие карты.
 * @deprecated
 * @param {object} o Инофрмацию картах.
 * @param {array} o.cards Список инидифкоторов карт.
 */
function drawcards( o ) {
    Log( 1, 'drawcards' );

    if ( !('cards' in o) )
        return false;
    var $deck = $( '.deck', '#youBar' );
    var position = $deck.offset();
    for ( var i in o.cards ) {
        window[o.cards[i]] = new Card( { 'id': o.cards[i], 'X': position.left,
            'Y': position.top, 'H': $deck.width(), 'W': $deck.width(),
            'faceUp': true } );

        // window[o.cards[i]].params.zona = 'prewievHand';

        window[o.cards[i]].animation( {
            'X': I.W / 2 - I.card.W / 2,
            'Y': I.H * 2 / 3 - I.card.W / 2,
            'W': I.card.W,
            x: 0, y: 0, z: 0, deg: 0,
            duration: 1000,
            additional: { incline: true, curveMoving: 'Y' }
        } )
    }

    setTimeout( function() {
        moveToPreview( { cards: o.cards } );
    }, 1005 );

    setTimeout( function() {
        moveToHand( { cards: I.handPrewiev.cards } )
    }, 1765 );
    Log( -1, 'drawcards' );
}

/**
 * Наверняка, устаревшая функция анимирующая предпросмотр карт в руке.
 * @param {object} o Инофрмацию картах.
 * @param {array} o.cards Список инидифкоторов карт.
 */
function moveToPreview( o ) {
    Log( 1, 'moveToPreview' );
    var needenCardsId = [ ];
    var needenCardsIdObj = { };
    for ( var i in I.handPrewiev.cards ) {
        needenCardsIdObj[ I.handPrewiev.cards[i]] = true;
    }
    //console.log('needen',needenCardsIdObj);
    if ( 'cards' in o ) {
        for ( var i in o.cards ) {
            needenCardsIdObj[o.cards[i]] = true;
        }
    }
    //console.log('needen',needenCardsIdObj);
    for ( var i in needenCardsIdObj ) {
        needenCardsId.push( i );
        window[i].changeZone( 'movingHandPrewiev' );
    }
    var total = needenCardsId.length;
    var rows = Math.ceil( total / 9 );
    var margin = I.W / 9 - I.card.W;
    if ( true ) { // полтные карты превью
        margin = 1;
    }
    var cardInRow = Math.round( total / rows )
    var sideMargin = I.W - (margin + I.card.W) * cardInRow - margin / 2;
    var bottomMargin = margin;
    for ( var i in needenCardsId ) {
        bottomMargin = (Math.ceil( (Number( i ) + 1) / cardInRow ) - 1) * (I.card.W + margin);
        window[needenCardsId[i]].animation( {
            X: sideMargin / 2 + (margin + I.card.W) * (Number( i ) % cardInRow),
            Y: /*I.hand.Y +*/ I.H - I.card.W /*- margin / 2*/ - bottomMargin,
            duration: 50,
            after: {
                func: (function() {
                    var card = window[needenCardsId[i]];
                    var id = needenCardsId[i];
                    return function() {
                        card.changeZone( 'handPrewiev' );
                    };
                })()
            }
        } );
    }
    Log( -1, 'moveToPreview' );
}

/**
 * Наверняка, устаревшая функция анимирующая возврат карт в руку из предпросмтра.
 * @param {object} o Инофрмацию картах.
 * @param {array} o.cards Список инидифкоторов карт.
 */
function moveToHand( o ) {
    //console.log(I.hand);
    if ( !('cards' in o) )
        return fasle;
    var needenCardsId = [ ];
    var needenCardsIdObj = { };

    for ( var i in I.hand.cards ) {
        needenCardsIdObj[ I.hand.cards[i]] = true;
    }
    if ( 'cards' in o ) {
        for ( var i in o.cards ) {
            needenCardsIdObj[o.cards[i]] = true;
        }
    }
    for ( var i in needenCardsIdObj ) {
        needenCardsId.push( i );
        window[i].changeZone( 'movingHand' )
    }

    var totalNumberOfCard = needenCardsId.length;

    var coordinateY = I.hand.Y + I.hand.H / 2 - I.card.W / 2;
    var margin = 0;
    if ( totalNumberOfCard > 4 ) {
        var step = (I.hand.W - I.card.W) / (totalNumberOfCard - 1);
    } else {
        var margin = (I.hand.W - I.card.W * totalNumberOfCard) / 2;
        var step = I.card.W;
    }
    for ( var i in needenCardsId ) {
        window[needenCardsId[i]].animation( {
            'X': I.hand.X + margin + Number( i ) * step,
            'Y': coordinateY,
            duration: 50,
            after: {
                func: (function() {
                    var card = window[needenCardsId[i]];
                    return function() {
                        card.changeZone( 'hand' );
                    };
                })()
            }
        } )
    }
}

/**
 * Анимированное изменение счетчика карта в зонах (колода, сброс, чакра).
 * @param {object} o Инофрмацию счетчике.
 * @param {string} o.owner Контролирующий счетчик игрок 'you' / 'opp'.
 * @param {string} o.area Индификатор зоны 'deck' / 'chakra' / 'discard'.
 */
function updateCardCount( o ) {
    if ( !('owner' in o) || !('area' in o) )
        return false;
    var name = 'intervalsetCount' + o.owner + o.area;
    window[name] = setInterval(
        function() {
            var newVal = 0;

            if ( Number( $( G[o.owner][o.area].countBtn ).html() ) > Number( S[o.owner][o.area].order.length ) ) {
                newVal = Number( $( G[o.owner][o.area].countBtn ).html() ) - 1;
            }
            else {
                newVal = Number( $( G[o.owner][o.area].countBtn ).html() ) + 1;
            }

            $( G[o.owner][o.area].countBtn ).html( newVal );

            if ( newVal == Number( S[o.owner][o.area].order.length ) ) {
                clearInterval( window[name] );
            }
        }, 20
        );
}

/**
 * Анимированное взятие 6 карт.
 */
function draw6() {
    //console.log( 'draw6' );
    drawCardsFromZone( { cards: S[you].deck.order.splice( 0, 6 ), owner: you, zona: 'deck' } )
}

function draw3() {
    //console.log( 'draw6' );
    drawCardsFromZone( { cards: S[you].deck.order.splice( 0, 3 ), owner: you, zona: 'deck' } )
}

function draw1() {
    //console.log( 'draw6' );
    drawCardsFromZone( { cards: S[you].deck.order.splice( 0, 1 ), owner: you, zona: 'deck' } )
}

/**
 * Функция прикреплена к кнопке "Далее" меняет текущую фазу на следующую  {@link Stadies}.
 * Список фаз и их порядок определяется в {@link clearS}.
 */
function btnNextPhase() {    
    if (Can.pressNextBtn({pX:you,S:S,Stadies:Stadies,meta:Meta})) {
       // console.log("↰",{u:Client})
        Card.prototype.hideActionCircle();
        socket.emit('pressNextBtn',{u:Client, transferInitiativeFrom : G.transferInitiative})
        G.transferInitiative = false;
    }
}

// *
//  * Обновление поля указывающего текующую фазу.
//  * Список фаз и их порядок определяется в {@link Stadies}.
 
// function updCurentPhase() {
//     $( '#phase' ).html( Stadies[Stadies.current].rusName );
// }

/**
 * Создает экземпляр Card, так,
 * что бы его можно было красиво переместить в указанную зону.
 * @param {object} o Констаруктор объекта.
 * o.id - Имя создаваемого объекта.
 * o.owner - Игрок контролирующий карту {pA,pB}
 * o.zona - Игровая зона где должна появиться карта
 */
function createCard( o ) {

    // Проверка сущесвтоания
    if ( C[o.id] /*&& !o.condition*/) {/*console.log('Карта ' + o.id + ' уже есть.');*/
        return true;
    }

    if ( !o
        || !('id' in o) || !o.id
        || !('zona' in o) || !o.zona
        || !('owner' in o) || !o.owner
        || !('position' in o)
    ) return false;
    var constr = {
        id: o.id,
        X: 0,
        Y: 0,
        H: I.card.W,
        W: I.card.W,
        faceUp: true,
        owner: o.owner,
        zona: o.zona,
        position: o.position
    }
    // Создание в положении зависящем от игровой зоны где карта должна появиться
    switch ( o.zona ) {
        case 'villlage':
        case 'attack':
        case 'block':
        case 'hand':
        case 'deck':
        case 'discard':
        case 'chackra':
        default:
            if ( o.owner === you ) constr.Y = I.table.H + 500;
            if ( o.owner === opp ) constr.Y = -500;
            constr.X = I.table.W / 2;
            break;
    }
    if (Known[Accordance[o.id]]) {
        for (var i in Known[Accordance[o.id]] ) {
            constr[i] = Known[Accordance[o.id]][i];
        }
    } else {
        constr.faceUp = false;
    }
    if (constr.zona == '') {};
    C[o.id] = new Card( constr );
    C[o.id].setZIndex( 825 )
}

/**
 * Перемещает команду в зону атаки
 * @param {object} _this Объект Card  по которому был клик.
 */
function moveToAttackJSON( _this ) {
    Log( 1, 'moveToAttackJSON' );

    var out = S[_this.params.owner].village;
    var to = S[_this.params.owner].attack;
    var team = _this.params.team;
    changeZoneForCardInTeam( _this, 'attack' );
    moveTeamBetweanZonesJSON( out, to, team );

    Log( -1, 'moveToAttackJSON' );
}

/**
 * Перемещает команду из зону атаки
 *
 * @param {object} _this Объект Card  по которому был клик.
 */
function moveOutAttackJSON( _this ) {
    Log( 1, 'moveOutAttackJSON' );

    var to = S[_this.params.owner].village;
    var out = S[_this.params.owner].attack;
    var team = _this.params.team;

    clearOpposing( _this );
    changeZoneForCardInTeam( _this, 'village' );
    moveTeamBetweanZonesJSON( out, to, team );

    Log( -1, 'moveOutAttackJSON' );
}

/**
 * Перемещает команду из зону блока.
 * @param {object} _this Объект Card принадлежащий передвигаемой команде.
 */
function moveToBlockJSON( _this ) {
    Log( 1, 'moveToBlockJSON' );

    var to = S[_this.params.owner].block;
    var out = S[_this.params.owner].village;
    var team = _this.params.team;

    changeZoneForCardInTeam( _this, 'block' );
    moveTeamBetweanZonesJSON( out, to, team );

    Log( -1, 'moveToBlockJSON' );
}

/**
 * Перемещает команду из зоны блока в деревню.
 * @param {object} _this Объект Card принадлежащий передвигаемой команде.
 */
function moveOutBlockJSON( _this ) {
    Log( 1, 'moveOutBlockJSON' );

    var to = S[_this.params.owner].village;
    var out = S[_this.params.owner].block;
    var team = _this.params.team;

    clearOpposing( _this );
    changeZoneForCardInTeam( _this, 'village' );
    moveTeamBetweanZonesJSON( out, to, team );


    Log( -1, 'moveOutBlockJSON' );
}

/**
 * Перемещает команду team из зоны out в зону to.
 * @param {object} out ссылка на объект зоны в S.
 * @param {object} to ссылка на объект зоны в S.
 * @param {string} team индификатор передвигаемой команды.
 */
function moveTeamBetweanZonesJSON( out, to, team ) {
    LogI['moveTeamBetweanZonesJSON'] = 1;
    Log( 1, 'moveTeamBetweanZonesJSON' );
    to.team[team] = out.team[team];
    delete out.team[team];
    for ( var i in out.order ) {
        if ( out.order[i] == team ) {
            out.order.splice( i, 1 );
            break;
        }
    }

    Log( 0, 'team', team );
    to.order.push( team );
    Log( -1, 'moveTeamBetweanZonesJSON' );
}

/**
 * Задает свойству opposing значение null для команды объекта Card и команды сражающеся против нее.
 * @param {type} _this Объект Card входящий в состав команды.
 */
function clearOpposing( _this ) {
    Log( 1, 'clearOpposing' );
    if ( _this.params.zona == 'attack' ) {
        var oposingZone = 'block';
    } else if ( _this.params.zona == 'block' ) {
        var oposingZone = 'attack';
    } else {
        Log( 0, 'zona', _this.params.zona );
        Log( -1, 'clearOpposing' );
        return false;
    }
    var oposing = S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing;
    if ( oposing ) {
        S[otherPlayer( _this.params.owner )][oposingZone].team[oposing].opposing = null;
    }
    S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing = null;
    Log( -1, 'clearOpposing' );
}

/**
 * Возвращает условное имя оппонента указанного игрока.
 * @param {String} pX Может принимать значения 'pB' или 'pA'.
 * @returns {String} Значения 'pA' или 'pB'.
 */
function otherPlayer( pX ) {
    Log( 1, 'otherPlayer' );
    var result = '';
    if ( pX == 'pA' ) result = 'pB';
    if ( pX == 'pB' ) result = 'pA';
    Log( -1, 'otherPlayer' );
    return result;
}

/**
 * Управляет перемещением команд при блоке.
 * @param {Object} _this Объект Card с которм производится действие.
 */
function moveBlockers( _this ) {
    Log( 1, 'moveBlockers' );
    if ( _this.params.zona == 'village' && _this.params.owner != you ) {
        Log( 0, 'zona', _this.params.zona );
        Log( -1, 'moveBlockers' );
        return false;
    }
    Log( 0, 'G.selectedTeam', G.selectedTeam );
    if ( !G.selectedTeam ) {
        G.selectedTeam = {
            teamId: _this.params.team,
            owner: _this.params.owner,
            zona: _this.params.zona,
            card: _this
        };
        _this.select( true );

    }
    else {
        if ( G.selectedTeam.owner == you ) {
            if ( _this.params.owner == you ) {
                if ( _this.params.zona == 'village' ) {
                    if ( G.selectedTeam.zona == 'village' ) {
                        G.selectedTeam.card.select( false );
                        G.selectedTeam = {
                            teamId: _this.params.team,
                            owner: _this.params.owner,
                            zona: _this.params.zona,
                            card: _this
                        };
                        _this.select( true );
                    }
                    if ( G.selectedTeam.zona == 'block' ) {
                        var opposing = getLinkOnTeam( G.selectedTeam.card ).opposing;
                        if ( opposing ) {
                            moveOutBlockJSON( G.selectedTeam.card );
                        }
                        S[otherPlayer( _this.params.owner )]['attack'].team[opposing].opposing = _this.params.team;
                        getLinkOnTeam( _this ).opposing = opposing;
                        moveToBlockJSON( _this );
                    }
                }
                else if ( _this.params.zona == 'block' ) {
                    if ( G.selectedTeam.zona == 'village' ) {

                        var opposing = getLinkOnTeam( _this ).opposing;
                        if ( opposing ) {
                            moveOutBlockJSON( _this );
                        }
                        Log( 0, 'team', _this.params.team );
                        S[otherPlayer( G.selectedTeam.owner )]['attack'].team[opposing].opposing = G.selectedTeam.teamId;
                        S[G.selectedTeam.owner][G.selectedTeam.zona].team[G.selectedTeam.teamId].opposing = opposing;
                        moveToBlockJSON( G.selectedTeam.card );

                    }
                    if ( G.selectedTeam.zona == 'block' ) {
                        // поменять opposing у четрых команд
                        var anoterAtt1 = getLinkOnTeam( _this ).opposing;
                        var anoterAtt2 = getLinkOnTeam( G.selectedTeam.card ).opposing

                        S[G.selectedTeam.owner][G.selectedTeam.zona].team[G.selectedTeam.teamId].opposing = anoterAtt1;
                        S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing = anoterAtt2;

                        S[otherPlayer( G.selectedTeam.owner )]['attack'].team[anoterAtt2].opposing = _this.params.team;
                        S[otherPlayer( _this.params.owner )]['attack'].team[anoterAtt1].opposing = G.selectedTeam.teamId;
                    }
                }
                G.selectedTeam.card.select( false );
                G.selectedTeam = null;
                startTable();
            }
            if ( _this.params.owner == opp ) {
                if ( G.selectedTeam.zona == 'village' ) {
                    var opposing = S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing;
                    Log( 0, 'opposing', opposing );
                    if ( opposing ) {
                        var cardLink = S[G.selectedTeam.owner].block.team[opposing].leader.order[0];
                        Log( 0, 'cardLink', cardLink );
                        moveOutBlockJSON( window[cardLink] );
                    }
                    Log( 0, 'team', _this.params.team );
                    S[G.selectedTeam.owner][G.selectedTeam.zona].team[G.selectedTeam.teamId].opposing = _this.params.team;
                    S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing = G.selectedTeam.teamId;
                    moveToBlockJSON( G.selectedTeam.card );
                }
                if ( G.selectedTeam.zona == 'block' ) {
                    // G.selectedTeam - свой
                    // _this - оппонента
                    if ( getLinkOnTeam( _this ).opposing ) { //если перед оппонентом кто то есть
                        // поменять opposing у четрых команд
                        var anoterBlk = getLinkOnTeam( _this ).opposing;
                        var anoterAtt = getLinkOnTeam( G.selectedTeam.card ).opposing

                        S[G.selectedTeam.owner][G.selectedTeam.zona].team[anoterBlk].opposing = anoterAtt;
                        S[_this.params.owner][_this.params.zona].team[anoterAtt].opposing = anoterBlk;

                        S[G.selectedTeam.owner][G.selectedTeam.zona].team[G.selectedTeam.teamId].opposing = _this.params.team;
                        S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing = G.selectedTeam.teamId;
                    }
                    else {
                        // Очисть текущую заблокированную команду от блока
                        var anoterAtt = getLinkOnTeam( G.selectedTeam.card ).opposing
                        S[_this.params.owner][_this.params.zona].team[anoterAtt].opposing = null;


                        S[G.selectedTeam.owner][G.selectedTeam.zona].team[G.selectedTeam.teamId].opposing = _this.params.team;
                        S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing = G.selectedTeam.teamId;
                    }
                }
                G.selectedTeam.card.select( false );
                G.selectedTeam = null;
                startTable();
            }
        }
        else if ( G.selectedTeam.owner == opp ) {
            //Log(0,'opposing' ,opposing);
            if ( _this.params.owner == you ) {
                if ( _this.params.zona == 'village' ) {
                    var opposing = S[G.selectedTeam.owner][G.selectedTeam.zona].team[G.selectedTeam.teamId].opposing;
                    if ( opposing ) {
                        var cardLink = S[_this.params.owner].block.team[opposing].leader.order[0];
                        moveOutBlockJSON( window[cardLink] );
                    }
                    Log( 0, 'team', _this.params.team );
                    S[G.selectedTeam.owner][G.selectedTeam.zona].team[G.selectedTeam.teamId].opposing = _this.params.team;
                    S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing = G.selectedTeam.teamId;
                    moveToBlockJSON( _this );

                }
                if ( _this.params.zona == 'block' ) {

                    if ( getLinkOnTeam( _this ).opposing ) { //если перед оппонентом кто то есть
                        // поменять opposing у четрых команд
                        var anoterBlk = S[G.selectedTeam.owner][G.selectedTeam.zona].team[G.selectedTeam.teamId].opposing;
                        var anoterAtt = S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing;

                        S[G.selectedTeam.owner][G.selectedTeam.zona].team[anoterAtt].opposing = anoterBlk;
                        if ( anoterBlk ) {
                            S[_this.params.owner][_this.params.zona].team[anoterBlk].opposing = anoterAtt;
                        }
                        S[G.selectedTeam.owner][G.selectedTeam.zona].team[G.selectedTeam.teamId].opposing = _this.params.team;
                        S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing = G.selectedTeam.teamId;
                    }
                    else {
                        // Очисть текущую заблокированную команду от блока
                        var anoterAtt = getLinkOnTeam( _this ).opposing
                        S[G.selectedTeam.owner][G.selectedTeam.zona].team[anoterAtt].opposing = null;


                        S[G.selectedTeam.owner][G.selectedTeam.zona].team[G.selectedTeam.teamId].opposing = _this.params.team;
                        S[_this.params.owner][_this.params.zona].team[_this.params.team].opposing = G.selectedTeam.teamId;
                    }
                }
                G.selectedTeam.card.select( false );
                G.selectedTeam = null;
                startTable();
            }
            if ( _this.params.owner == opp ) {
                G.selectedTeam.card.select( false );
                G.selectedTeam = {
                    teamId: _this.params.team,
                    owner: _this.params.owner,
                    zona: _this.params.zona,
                    card: _this
                };
                _this.select( true );
            }
        }
    }
    Log( -1, 'moveBlockers' );
}

/**
 * Обрабатывает клик по пустому месту на поле.
 */
function emptyClick() {
    LogI['emptyClick'] = 0;
    Log( 1, 'emptyClick' );
    Log( 0, 'Stadies.current',Stadies.current );
    if ( Stadies.current == 'block'
        && G.selectedTeam != null
        && G.selectedTeam.owner == you
        ) {
        if ( G.selectedTeam.zona == 'block' ) {
            moveOutBlockJSON( G.selectedTeam.card );
            G.selectedTeam.card.select( false );
            G.selectedTeam = null;
            startTable();
        }
        else {
            G.selectedTeam.card.select( false );
            G.selectedTeam = null;
        }

    }
    else if ( S.phase == 'organisation'
        && G.selectedCard != null
        && Can.removeFromTeam({
            S:S,
            Known:Known,
            Accordance:Accordance,
            pX:you,
            card:G.selectedCard.id
        }) )
    {
        G.selectedCard.select( false );
        G.selectedCard.removeFromTeam();
        G.selectedCard = null;
    }
    else if (S.phase == 'block') {
        if (G.selectedTeam) {
            var arg = {
                S:S,
                attackTeam : getAttackTeamIdOnBlockTeamId(S,G.selectedTeam.teamId),
                blockTeam : null,
                pX : you,
                from : 'block'
            }
            if ( Can.block(arg) ) {
                socket.emit('block',{
                    u:Client, 
                    arg:{
                        attackTeam : getAttackTeamIdOnBlockTeamId(S,G.selectedTeam.teamId),
                        blockTeam : null,
                        pX : you,
                        from : 'block'
                    }
                })
            }
            G.selectedTeam.card.select( false );
            G.selectedTeam = null;
        }
    }
    else if (G.selectedCard != null) {
        G.selectedCard.select( false );
        G.selectedCard = null;
    }
    if (Card.prototype.displayedActionCircle) Card.prototype.displayedActionCircle.hideAction();
    Log( -1, 'emptyClick' );
}

/**
 * Обрабатывает клик по пустому месту на поле.
 */
function changeZoneForCardInTeam( _this, zona ) {
    Log( 1, 'changeZoneForCardInTeam' );
    var team = getLinkOnTeam( _this );
    Log( 0, 'team', getLinkOnTeam( _this ) );
    var role = [ 'leader', 'support' ];
    for ( var i in role ) {
        var order = team[role[i]].order;
        for ( var k in order ) {
            window[order[k]].changeZone( zona );
        }
    }
    Log( -1, 'changeZoneForCardInTeam' );
}
/**
 * Получает ссылку на объект-камнду.
 * @param {type} _this Объект Card участник команды.
 * @returns {Object} Ссылка на камнду.
 */
function getLinkOnTeam( _this ) {
    return S[_this.params.owner][_this.params.zona].team[_this.params.team];
}

function logSit() {
    var att1 = S[S.activePlayer].attack;
    var blk1 = S[otherPlayer( S.activePlayer )].block;
    console.log( "==========logSit==========" );
    console.log( att1.order );
    for ( var i in att1.order ) {
        console.log( att1.order[i] + ' => ' + att1.team[att1.order[i]].opposing );
    }
    console.log( "--------------------------" );
    console.log( blk1.order );
    for ( var i in blk1.order ) {
        console.log( blk1.team[blk1.order[i]].opposing + ' => ' + blk1.order[i] );
    }
    console.log( "==========================" );
}

/**
 * Отрисовывает анимацию нанесения одного повреждения от одного ниндзя к другому.
 * @param {string} from индификавтор карты отправителя.
 * @param {string} to индификатор карты получателя.
 */
function dealDamage( from, to ) {
    var from = window[from];
    var to = window[to];
    var H = from.params.H / 5;
    var X = from.params.position.X + from.params.H / 2 - H / 2;
    var Y = from.params.position.Y + from.params.H / 2 - H / 2;
    var ball = $( '<div />', {
        'class': 'damageBall'
    } ).css( 'top', Y + 'px' ).css( 'left', X + 'px' ).css( 'width', H + 'px' ).css( 'height', H + 'px' )
    $( '#animate' ).append( ball );
    ball.animate( {
        'left': to.params.position.X + to.params.H / 2 - H / 2,
        'top': to.params.position.Y + to.params.H / 2 - H / 2,
        'width': to.params.H / 5,
        'height': to.params.H / 5,
    }, 200, "linear", function() {

        ball.animate( {
            'left': to.params.position.X,
            'top': to.params.position.Y,
            'opasity': "toggle",
            'width': to.params.H,
            'height': to.params.H
        }, 50, "linear", function() {
            ball.remove();
        } )

    } )

}

/**
 * Визуально перемещает карту в одну из зон 'deck', 'chackra' или 'discard'. Содержит в себе функцию {@link moveCardToZoneJSON}.
 * @param {Object} card Объект Card.
 * @param {Object} o содрежит в себе информацю о пермещении
 * o.owner - владелец зоны
 * o.zona - индификатор зоны
 */
function moveCardToZone( card, o ) {
    Log( 1, 'moveCardToZone' );
    var o = o || { };
    o.owner = o.owner || 'pB';
    o.zona = o.zona || 'discard';
    o.team = getNewTeamId();
    var z = G[o.owner][o.zona];
    moveCardToZoneJSON( card, o );


    Log( 0, 'o.zona', o.zona );
    if ( o.zona == 'deck'
        || o.zona == 'discard'
        || o.zona == 'chackra'
        || o.zona == 'hand'
        ) {

        card.params.teamPosition = null;
        card.removeTeamPower();

        card.animation( { X: z.X + 4, Y: z.Y + 2, H: z.H, additional: { intoCard: true, incline: false, fadeIn: true, curveMoving: 'Y', after: { func: function() {
                        card.destroyCard();
                        updateCardCount( { owner: o.owner, area: o.zona } );
                        delete window[card.id];
                        startTable();
                    } } } } );
    } else if ( o.zona == 'village'
        || o.zona == 'attack'
        || o.zona == 'block' ) {
        Log( 0, 'S.pB.village', S.pB.village );
        card.params.teamPosition = 'leader';
        card.addTeamPower();
        startTable();
    }
    Log( -1, 'moveCardToZone' );
}

/**
 * Перемещает карту в одну из зон 'deck', 'chackra' или 'discard' внутри объекта JSON.
 * @param {Object} card Объект Card.
 * @param {Object} o Содрежит в себе информацю о пермещении:
 * o.owner - владелец зоны
 * o.zona - индификатор зоны
 */
function moveCardToZoneJSON( card, o ) {

    Log( 1, 'moveCardToZoneJSON' );
    if ( card.params.zona == 'village'
        || card.params.zona == 'block'
        || card.params.zona == 'attack' )
    {
        Log( 0, 'card.params.zona', card.params.zona );
        if ( o.zona == 'deck'
            || o.zona == 'discard'
            || o.zona == 'chackra'
            || o.zona == 'hand' )
        {
            var oldPos = S[card.params.owner][card.params.zona].team[card.params.team][card.params.teamPosition];
            S[o.owner][o.zona].order.push( card.id );
            for ( var i in oldPos.order ) {
                if ( oldPos.order[i] == card.id ) {
                    oldPos.order.splice( i, 1 );
                    break;
                }
            }
        }
        else if ( o.zona == 'village'
            || o.zona == 'block'
            || o.zona == 'attack' )
        {

            removeSelfFromTeamJSON( card )

            S[o.owner][o.zona].order.push( o.team );
            S[o.owner][o.zona].team[o.team] = { leader: { order: [ card.id ] }, support: { order: [ ] } };
            card.params.teamPosition = 'leader';
            card.params.team = o.team

        }
    } else if ( card.params.zona == 'deck'
        || card.params.zona == 'discard'
        || card.params.zona == 'chackra'
        || card.params.zona == 'hand' ) {
        if ( o.zona == 'deck'
            || o.zona == 'discard'
            || o.zona == 'chackra'
            || o.zona == 'hand' ) {
            Log( 0, 'o.owner', card.id );
            S[o.owner][o.zona].order.push( card.id );
        } else if ( o.zona == 'village'
            || o.zona == 'attack'
            || o.zona == 'block' ) {

            S[o.owner][o.zona].order.push( o.team );
            S[o.owner][o.zona].team[o.team] = { leader: { order: [ card.id ] }, support: { order: [ ] } };
            card.params.teamPosition = 'leader';
            card.params.team = o.team
        }
        for ( var i in S[card.params.owner][card.params.zona].order ) {
            Log( 0, 'S[card.params.owner][card.params.zona].order[i]', S[card.params.owner][card.params.zona].order[i] );
            if ( S[card.params.owner][card.params.zona].order[i] == card.id ) {
                S[card.params.owner][card.params.zona].order.splice( i, 1 );
                break;
            }
        }
        card.params.zona = o.zona;
    }
    Log( -1, 'moveCardToZoneJSON' );
}

function getNewTeamId() {
    return 'teamId' + Math.random( 1, 1000000 );
}

/**
 * Очищает объект S от неврных позиций карт. Например определяет нового лидера в команду без лидера или удаляет команду если в ней нету поддержки.
 */
function clearS() {
    LogI['clearS'] = 0;
    Log( 1, 'clearS' );
    var P = [ 'pA', 'pB' ];
    var Z = [ 'village', 'attack', 'block' ];
    for ( var p in P ) {
        for ( var z in Z ) {
            var zona = S[P[p]][Z[z]];
            for ( var t in zona.order ) {
                var team = zona.team[zona.order[t]];
                Log( 0, P[p] + ' ' + Z[z] + ' ' + zona.order[t] + ' = ', team );
                if ( team.leader.order.length == 0 && P[p] == you ) {
                    if ( team.support.order.length > 1 ) {
                        Log( 0, 'lenght', '0 ; support' + team.support.order.length )
                        shoseNewLeader( team );
                        return false;
                    }
                    else if ( team.support.order.length == 1 ) {
                        Log( 0, 'lenght', '1 ; support' + team.support.order.length );
                        team.leader.order.push( team.support.order[0] );
                        //team.leader.cards[team.support.order[0]] =  team.support.cards[team.support.order[0]];
                        team.support.order = [ ];
                        //team.support.cards = {};
                    }
                    else {
                        Log( 0, 'lenght', '>1 ; support' + team.support.order.length )
                        delete zona.team[zona.order[t]];
                        zona.order.splice( t, 1 );

                    }
                }
            }
        }
    }
    Log( -1, 'clearS' );
    return true;
}

function shoseNewLeader( team ) {
    Log( 1, 'shoseNewLeader' );
    Log( 0, 'team', team );
    for ( var i in team.support.order ) {
        window[team.support.order[i]].setZIndex( 500 );
    }
    $( '#noir' ).css( 'width', I.table.W ).css( 'height', I.table.H ).html( 'Выберите нового лидера для команды' );
    Context.workingUnit = 'card';
    Context.clickAction = function( card ) {
        makeAsLeader( card );
        Context.workingUnit = null;
        Context.clickAction = null;
        $( '#noir' ).css( 'width', 0 ).css( 'height', 0 ).html( '' );
        startTable();
    }
    Log( -1, 'shoseNewLeader' );
}

function makeAsLeader( card ) {
    if ( card.params.teamPosition != 'leader' ) {
        card.params.teamPosition = 'leader';
    }
    var team = getLinkOnTeam( card );
    if ( team.leader.order.lenhht && team.leader.order[0] != card.id ) {
        //OLD team.support.cards[team.leader.order[0]] =  team.leader.cards[team.leader.order[0]];
        //OLD delete team.leader.cards[team.leader.order[0]];
        team.support.order.push( team.leader.order[0] );
        team.leader.order = [ ];
    }
    for ( var i in team.support.order ) {
        if ( team.support.order[i] == card.id ) {
            //OLD team.leader.cards[team.support.order[i]] =  team.support.cards[team.support.order[i]];
            //OLD delete team.support.cards[team.support.order[i]]
            team.leader.order.push( team.support.order[i] );
            team.support.order.splice( i, 1 );
            break;
        }
    }
}

function returnAllToVillage() {
    Log( 1, 'returnAllToVillage' );
    if ( you == S.activePlayer ) {
        var youRole = 'attack';
        var oppRole = 'block';
        var youFunc = moveOutAttackJSON;
        var oppFunc = moveOutBlockJSON;
    }
    if ( opp == S.activePlayer ) {
        var oppRole = 'attack';
        var youRole = 'block';
        var oppFunc = moveOutAttackJSON;
        var youFunc = moveOutBlockJSON;
    }
    Log( 0, 'order', S[you][youRole].team );
    for ( var i in S[you][youRole].team ) {
        Log( 0, 'leader', S[you][youRole].team[i].leader.order[0] );
        var leader = S[you][youRole].team[i].leader.order[0];
        youFunc( window[leader] );
    }
    for ( var i in S[opp][oppRole].team ) {
        Log( 0, 'leader', S[opp][oppRole].team[i].leader.order[0] );
        var leader = S[opp][oppRole].team[i].leader.order[0];
        oppFunc( window[leader] );
    }
    Log( -1, 'returnAllToVillage' );
}

function drawCardsFromZone( o ) {
    Log( 1, 'drawCardsFromZone' );
    var z = G[o.owner][o.zona];
    var size = I.card.W;
    var margin = size / 10;
    var Hp = o.cards.length * size + (o.cards.length - 1) * margin;
    var Xp = I.W / 2 - Hp / 2;
    var Yp = I.H / 2 - size / 2;
    for ( var i in o.cards ) {
        var id = o.cards[i];
        window[id] = new Card( {
            id: id, X: z.X + 4, Y: z.Y + 2, H: z.H, faceUp: true, owner: o.owner
        } );
        $( window[id].$id ).css( 'opacity', 0 );
        window[id].setZIndex( 450 );
        window[id].animation( {
            X: Xp + (margin + size) * i,
            Y: Yp,
            H: size,
            additional: { fadeOut: true, curveMoving: 'X' }
        } );
        moveCardToZoneJSON( window[id], { owner: window[id].params.owner, zona: 'hand' } )
        window[id].params.zona = 'hand';
    }
    updateCardCount( { owner: o.owner, area: o.zona } );
    setTimeout( /*(function(){
     var cards = o;
     return function() {*/
        moveToHand( { owner: you } )/*;
         }})()*/, 550 );
    Log( -1, 'drawCardsFromZone' );
}

function moveToHand( o ) {
    Log( 1, 'collectCardsInHand' );
    var totalNumberOfCard = S[o.owner].hand.order.length;

    var coordinateY = I.hand.Y /*+ I.hand.H / 2 - I.card.W / 2*/;
    var margin = 0;
    if ( totalNumberOfCard > 4 ) {
        var step = (I.hand.W - I.card.W) / (totalNumberOfCard - 1);
    } else {
        var margin = (I.hand.W - I.card.W * totalNumberOfCard) / 2;
        var step = I.card.W;
    }
    for ( var i in S[o.owner].hand.order ) {
        Log( 0, 'x', Number( margin ) + Number( i ) * Number( step ) )
        window[S[o.owner].hand.order[i]].animation( {
            'X': I.hand.X + Number( margin ) + Number( i ) * Number( step ),
            'Y': coordinateY,
            duration: 250,
            additional: { curveMoving: 'Y', incline: false },
            after: {
                func: (function() {
                    var card = window[S[o.owner].hand.order[i]];
                    return function() {
                        // card.changeZone( 'hand' );
                    };
                })()
            }
        } )
    }

    Log( -1, 'collectCardsInHand' );
}

function prewievCardsInHand( o ) {
}

function moveToPreview( o ) {
    Log( 1, 'moveToPreview' );

    var total = S[o.owner].hand.order.length;
    var rows = Math.ceil( total / 9 );
    var margin = I.W / 9 - I.card.W;
    if ( true ) { // полтные карты превью
        margin = 1;
    }
    var cardInRow = Math.round( total / rows )
    var sideMargin = I.W - (margin + I.card.W) * cardInRow - margin / 2;
    var bottomMargin = margin;
    for ( var i in S[o.owner].hand.order ) {
        bottomMargin = (Math.ceil( (Number( i ) + 1) / cardInRow ) - 1) * (I.card.W + margin);
        window[S[o.owner].hand.order[i]].animation( {
            X: sideMargin / 2 + (margin + I.card.W) * (Number( i ) % cardInRow),
            Y: /*I.hand.Y +*/ I.H - I.card.W /*- margin / 2*/ - bottomMargin,
            duration: 50,
            additional: { curveMoving: 'Y', incline: true },
            after: {
                func: (function() {
                    var card = window[S[o.owner].hand.order[i]];
                    var id = S[o.owner].hand.order[i];
                    return function() {
                        card.changeZone( 'handPrewiev' );
                    };
                })()
            }
        } );
    }
    Log( -1, 'moveToPreview' );
}

function organisationMove( card ) {
    Log( 1, 'organisationMove' );
    if (   card.params.owner != you 
        || card.params.zona != 'village' 
        || card.params.type != 'N' 
        || S.activePlayer != you ) {
        Log( -1, 'organisationMove' );
        return false;
    }

    if ( !G.selectedCard ) {
        G.selectedCard = card;
        card.select( true );
    }
    else {
        if ( card.params.teamPosition == 'leader'
            && card.params.team != G.selectedCard.params.team ) {
            var obj = {
                S : S,
                Known : Known,
                Accordance : Accordance,
                card : card.id,
                pX : you,
            }
            //if ( Can.orgAddToTeam(obj) && Can.orgChangeInTeam(obj))
            card.showAction();
        }
        else {
            if (Can.organisation({
                S:S,
                c2:card.getMainParams(), 
                c1:G.selectedCard.getMainParams(),
                Known: Known,
                Accordance: Accordance,
                pX:you
                })) {
                card.hideAction();
                socket.emit('changeInTeam',{
                    u:Client, 
                    arg:{
                        c1 : G.selectedCard.getMainParams(),
                        c2 : card.getMainParams(),
                        pX : you
                    }
                })
            }
            //organisation( card, G.selectedCard );
        }
    }
    Log( -1, 'organisationMove' );
}

function organisation( card1, card2, nochange ) {
    console.log('DEL')
    // Log( 1, 'organisation' );
    // var nochange = nochange || false;
    // var card1pos = card1.params.teamPosition;
    // var card2pos = nochange ? 'support' : card2.params.teamPosition;
    // var owner = card1.params.owner;
    // var zona = card1.params.zona;
    // var team1 = card1.params.team;
    // var team2 = card2.params.team;
    // Log( 0, '[owner][zona][team1][team2]', '[' + owner + '][' + zona + '][' + team1 + '][' + team2 + ']' );
    // var Team1 = S[owner][zona].team[team1];
    // var Team2 = S[owner][zona].team[team2];

    // removeSelfFromTeamJSON( card1 );

    // if (card2pos == 'leader') Team2.splice(0,0,card1.id );
    // else Team2.push( card1.id );
    // if ( !nochange ) {
    //     removeSelfFromTeamJSON( card2 );
    //     if (card1pos == 'leader') Team1.splice(0,0,card2.id );
    //     else Team1.push( card2.id );
    // }
    // G.selectedCard.select( false );
    // G.selectedCard = null;
    // updTable();

    Log( -1, 'organisation' );
}

function removeSelfFromTeamJSON( card ) {
    console.log('DEL')
    // var team = S[card.params.owner][card.params.zona].team[card.params.team];
    // for ( var i in team ) {
    //     if ( team[i] == card.id ) {
    //         team.splice( i, 1 );
    //         return true;
    //     }
    // }
    // return false;
}


function updTeams() {
    //console.log('updTeams');
    var numbersOfLine = 50; //Количесвто горизонатльных линий  для сетки
    if (S.stack.length) numbersOfLine = 58;
    var maxSqrSize =(I.table.H - 2*(I.card.W/2 - I.table.Y/2)) / numbersOfLine;
    var maxSqrWidth = I.table.W / maxSqrSize;
    var position = {
        you : getPosition(you),
        opp : getPosition(opp),
    }
    // определить что больше ширина или высота
    
    // определить размер плитки
    var finalSqr = maxSqrSize;
    updPosition(position,finalSqr);
}
/**
 * [getPosition description]
 * @param  {[type]} pX [description]
 * @return {Object}    Объект вида :
 *                     {
 *                         village : {
 *                             W : number,
 *                             H : number,
 *                             team : {
 *                               /teamId/ : {
 *                                  W : number,
 *                                  H : number,
 *                                  S : number
 *                                } ...
 *                             }
 *                         },
 *                         battle : {
 *                             W : number,
 *                             H : number,
 *                             team : {
 *                               /teamId/ : {
 *                                  W : number,
 *                                  H : number,
 *                                  S : number
 *                                } ...
 *                             }
 *                         }
 *                     }
 */
function getPosition(pX) {
    var result = {
        village : getPositionVillage(pX),
        battle : getPositionBattle(pX)
    }
    result.W = result.village.W;
    return result;
}
/**
 * [getPositionVillage description]
 * @param  {[type]} pX [description]
 * @return {Object}    Объект вида :
 *                     {
 *                         W : number,
 *                         H : number,
 *                         team : {
 *                           /teamId/ : {
 *                              W : number,
 *                              H : number,
 *                              S : number
 *                            } ...
 *                         }
 *                     }
 */
function getPositionVillage(pX) {
    var result = {W:0,H:14,team:{}};
    for (var t in S[pX].village.team) {
        result.team[t] = getTeamSize( S[pX].village.team[t] );
        if (result.W > 0) result.W += 2;
        result.W += result.team[t].W;
    }
    return result;
}
/**
 * [getPositionBattle description]
 * @param  {[type]} pX   [description]
 * @param  {[type]} zone [description]
 * @return {Object}    Объект вида :
 *                     {
 *                         W : number,
 *                         H : number,
 *                         team : {
 *                           /teamId/ : {
 *                              W : number,
 *                              H : number,
 *                              S : number
 *                            } ...
 *                         }
 *                     }
 */
function getPositionBattle(pX, zone) {
    var result = {W:0,H:0,team:{}};
    if (pX == S.activePlayer) {
        for (var t in S[pX].attack.team) {
            result.team[t] = getTeamSize( S[pX].attack.team[t] );
            if (result.W > 0) result.W += 2;
            result.W += result.team[t].W;
        }
    } else {
        for (var t in S[pX].block.team) {
            result.team[t] = getTeamSize( S[pX].block.team[t] );
            if (result.W > 0) result.W += 2;
            result.W += result.team[t].W;
        }
    }
    return result;
}
/**
 * [getTeamSize description]
 * @param  {[type]} team [description]
 * @return {Object}    Объект вида :
 *                     {
 *                         W : number,
 *                         H : number,
 *                         S : number
 *                     }
 */
function getTeamSize( team ) {
    var result = { H: 14, W: 0 };
    result.W = 5 + team.length * 5;
    result.S = team.length;
    return result;
}
function updPosition(position,sqr) {
    var msqr = sqr;
    var isFight = false;
    if ( S.phase == 'attack' 
        || S.phase == 'block' 
        || S.phase == 'jutsu' 
        || S.phase == 'shutdown'
        || S.phase == 'comeback'
    )  isFight = true
    if (isFight) msqr = sqr / 2;

    var villageWidth = ( position.you.village.W ) * msqr;
    var marginLeft = (I.W - villageWidth) / 2; 
    var o2 = {
        X : marginLeft,
        Y : (I.H ) / 2 + (isFight ? (S.stack.length ? 21 : 17) :6) * sqr,
        zona : 'village',
        owner : you,
        player : 'you' ,
        sqr : msqr,
    }
    for (var t in position.you.village.team ) {
        var o = S[you].village.team[t];
        o2.team = t;
        createteam(o,o2);
        o2.X+= (position.you.village.team[t].W + 2 ) * msqr;
    }

    var villageWidth = ( position.opp.village.W ) * msqr;
    var marginLeft = (I.W - villageWidth) / 2;
    var o2 = {
        X : marginLeft,
        Y : (I.H ) / 2 - (isFight ? (S.stack.length ? 28 : 24 ): 22) * sqr,
        zona : 'village',
        owner : opp,
        player : 'opp' ,
        sqr : msqr,
    }
    for (var t in position.opp.village.team ) {
        var o = S[opp].village.team[t];
        o2.team = t;
        createteam(o,o2);
        o2.X += (position.opp.village.team[t].W + 2) * msqr;
    }

    if (isFight) {
        var attacker = S.activePlayer;
        var blocker = attacker == 'pA' ? 'pB' : 'pA' ;
        var youRole = attacker == you ? 'attack' : 'block';
        var oppRole = attacker == opp ? 'attacr' : 'block';
        var attackerRole = attacker == you ? 'you' : 'opp';
        var blockerRole = blocker == you ? 'you' : 'opp';
        var attackTeams = position[attackerRole].battle.team;
        var blockTeams = position[blockerRole].battle.team;

        var battleWidth = ( position.opp.battle.W > position.you.battle.W ? position.opp.battle.W : position.you.battle.W ) * sqr;
        var marginLeft = (I.W - battleWidth) / 2;
        var widthPairs = {};

        var comulativeMargin = marginLeft;

        for (var attackTeam in S.battlefield) {

            var width = getMaxWidthForTwoTeam(
                attackTeams[attackTeam], blockTeams[S.battlefield[attackTeam]] 
                )
            var additiinalMargin = 0;
            if (blockTeams[S.battlefield[attackTeam]] 
                && attackTeams[attackTeam].S < blockTeams[S.battlefield[attackTeam]].S) 
            {
                var raz = blockTeams[S.battlefield[attackTeam]].S - attackTeams[attackTeam].S;
                if (raz % 2 == 1) {
                    if (blockTeams[S.battlefield[attackTeam]].S % 2 == 1) {
                        additiinalMargin =(raz+1) / 2 * 5;
                    } else {
                        additiinalMargin =(raz-1) / 2 * 5;
                    }
                } else {
                    additiinalMargin = (raz / 2)  * 5;
                }
            }
            var upDownMoveYou = 1; 
            var upDownMoveOpp = -16; 
            if (S.stack.length) {
                upDownMoveYou = 5;
                upDownMoveOpp = -20; 
            } 
            var o2 = {
                X : comulativeMargin + additiinalMargin * sqr,
                Y : (I.H ) / 2 +  (attacker == you ? upDownMoveYou : upDownMoveOpp) * sqr,
                zona : 'attack',
                owner : attacker,
                player : attackerRole ,
                sqr : sqr,
            }
            var o = S[attacker].attack.team[attackTeam];
            o2.team = attackTeam;
            createteam(o,o2);
            if (S.battlefield[attackTeam]) {

                var additiinalMargin = 0;
                if (blockTeams[S.battlefield[attackTeam]].S < attackTeams[attackTeam].S) {
                    var raz = attackTeams[attackTeam].S - blockTeams[S.battlefield[attackTeam]].S ;
                    if (raz % 2 == 1) {
                        if (attackTeams[attackTeam].S % 2 == 1) {
                            additiinalMargin =(raz+1) / 2 * 5;
                        } else {
                            additiinalMargin =(raz-1) / 2 * 5;
                        }
                    } else {
                        additiinalMargin = (raz / 2)  * 5;
                    }
                }
                var o2 = {
                    X : comulativeMargin + additiinalMargin * sqr,
                    Y : (I.H ) / 2 +  (blocker == you ? upDownMoveYou : upDownMoveOpp) * sqr,
                    zona : 'block',
                    owner : blocker,
                    player : blockerRole ,
                    sqr : sqr,
                }
                var o = S[blocker].block.team[S.battlefield[attackTeam]];
                o2.team = S.battlefield[attackTeam];
                createteam(o,o2);
            }
            comulativeMargin += (width + 2 ) * sqr;
        }
    }

    if (S.stack.length) {

        var stackWidth = S.stack.length * sqr;
        var marginLeft = (I.W - S.stack.length * sqr * 8) / 2 ; 

        for (var i = S.stack.length - 1; i >= 0 ; i--) {

            createCard({
                id: S.stack[i].card,
                zona: 'stack',
                owner: S.stack[i].owner,
                team: null,
                position: null,
                condition: 'createstack'
            });

            C[S.stack[i].card].animation({
                X : marginLeft,
                Y : I.H / 2 - sqr * 4,
                W : 8 * sqr,
                additional : {
                    outCard: true
                }
            });
        }
    }
}

function getMaxWidthForTwoTeam( team1, team2 ) {
    if (!team1 && !team2) return 0;
    if (!team2) return team1.W;
    if (!team1) return team2.W;
    return team1.W > team2.W ? team1.W : team2.W;
}

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
    if (!o.length) {
        //console.log('error');
        return false;
    }
    //Log(0,'team',o2.team);
    //Log(0,'zona', o2.zona);
    var a = -1; // множитель +-1 указывающий с какой стороны от центра расположена карта
    var gridWidth = 10 + 5 *(o.length-2);
    if ( o.length % 2 == 1 ) {
        var gridWidth = 10 + 5 * (o.length -1);
    }
    var width = gridWidth * o2.sqr;
    var gridHeight;
    var gridCell = o2.sqr;
    var posTop = 0;
    var posLeft = width / 2 - 5 * gridCell;
    var oppMod1 = 0;
    if ( o2.player == 'opp' ) {
        oppMod1 = 4 * gridCell;
    }
    if (o[0]) {
        createCard({
            id: o[0],
            zona:o2.zona,
            owner:Known[Accordance[o[0]]].owner,
            team: o2.team,
            position:'leader',
            condition: 'createteam'
        });
        var afterFunc = (function(){
            var id =  o[0];
            return function(){
                C[id].setZIndex( 200 );
            }
        })()
        C[o[0]].animation( { X: posLeft + o2.X,
            Y: posTop + o2.Y + oppMod1, W: 10 * gridCell, x:0, y:0,z:0,deg:0,
            duration: 500,
            additional: { 
                outCard: true,
                after : {
                    func: afterFunc
                }
            } } );
        C[o[0]].changeZone(  o2.zona);
        C[o[0]].params.team = o2.team;
        C[o[0]].params.teamPosition = 'leader';
        
    }
    
    var countOdd = -2;
    
    for ( var i=1; i<=o.length-1; i++ ) {
        a *= -1;
        var ii = Number( i ) //+ 1;
        if ( a < 0 )
            posLeft = width / 2 + (10 + ((ii / 2 - 1) * 5)) * a * gridCell;
        else
            posLeft = width / 2 + ((ii - 1) / 2 * 5 + 2) * gridCell;
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
            id:o[i],
            zona:o2.zona,
            owner:Known[Accordance[o[0]]].owner,
            team: o2.team,
            position:'support',
            condition: 'createteam'
        });
        var afterFunc = (function(){
            var id =  o[i];
            return function(){
                C[id].setZIndex( 200 );
            }
        })()
        C[o[i]].animation( { X: posLeft + o2.X, Y: posTop + o2.Y,x:0, y:0,z:0,deg:0,
            duration: 500,
            W: 8 * gridCell, additional: { outCard: true,
                after : {
                    func: afterFunc
                } } } );
        C[o[i]].changeZone( o2.zona );
        C[o[i]].params.team = o2.team;
        C[o[i]].params.teamPosition = 'support';
        C[o[i]].removeTeamPower(o2.player);
    }
    if (o[0]) {
        C[o[0]].addTeamPower(o2.player);
    }
    Log(-1,'createteam');
}

function updCurrentPhase() {
    if (Can.pressNextBtn({pX:you,S:S,meta:Meta,Stadies:Stadies})) {
        H.next.removeClass('selectedZone');
    } else {
        H.next.addClass('selectedZone');
    }
    if (S) {
        AN.changePahseName( Stadies[S.phase].rusName );
    }
}

function updHands() {
    var pXs = ['pA','pB'];
    for (var pX in pXs) {
        AN.moveToHand( {  cards: {} , pX : you } )
        AN.moveToHand( {  cards: {} , pX : opp } )
    }
}

function updTable() {
    //console.log('updTable')
    if (G.selectedTeam) {
        G.selectedTeam = null;
    }
    AnimationPush({func:function() {
        updCurrentPhase();
        updAllCount()
        updHands();
        updTeams();
    }, time:510, name:'updTable'});
}

function getAttackTeamIdOnBlockTeamId(S,team) {
    for (var i in S.battlefield) {
        if (team == S.battlefield[i]) return i;
    }
    return null;
}
function blockMove(_this) {

    if ( !G.selectedTeam ) {
        G.selectedTeam = {
            teamId: _this.params.team,
            owner: _this.params.owner,
            zona: _this.params.zona,
            card: _this
        };
        _this.select( true );
        return true;
    }

    if ( G.selectedTeam.owner == you ) {
        if ( _this.params.owner == you ) {
            if ( _this.params.zona == 'village' ) {
                if ( G.selectedTeam.zona == 'village' ) {
                    G.selectedTeam.card.select( false );
                    G.selectedTeam = {
                        teamId: _this.params.team,
                        owner: _this.params.owner,
                        zona: _this.params.zona,
                        card: _this
                    };
                    _this.select( true );
                }
                if ( G.selectedTeam.zona == 'block' ) { 
                    var arg = {
                        S:S,
                        attackTeam : getAttackTeamIdOnBlockTeamId(S,G.selectedTeam.teamId),
                        blockTeam : _this.params.team,
                        pX : you,
                        from : _this.params.zona
                    }
                    if ( Can.block(arg) ) {
                        socket.emit('block',{
                            u:Client, 
                            arg:{
                                attackTeam : getAttackTeamIdOnBlockTeamId(S,G.selectedTeam.teamId),
                                blockTeam : _this.params.team,
                                pX : you,
                                from : _this.params.zona
                            }
                        })
                    }
                }
                G.selectedTeam.card.select( false );
                G.selectedTeam = null;
            }
            else if ( _this.params.zona == 'block' ) {
                if ( G.selectedTeam.zona == 'village' ) {
                    var arg = {
                        S:S,
                        attackTeam : getAttackTeamIdOnBlockTeamId(S,_this.params.team),
                        blockTeam : G.selectedTeam.teamId,
                        pX : you,
                        from : G.selectedTeam.zona
                    }
                    if ( Can.block(arg) ) {
                        socket.emit('block',{
                            u:Client, 
                            arg:{
                                attackTeam : getAttackTeamIdOnBlockTeamId(S,_this.params.team),
                                blockTeam : G.selectedTeam.teamId,
                                pX : you,
                                from : G.selectedTeam.zona
                            }
                        })
                    }
                }
                if ( G.selectedTeam.zona == 'block' ) {
                    var arg = {
                        S:S,
                        attackTeam : getAttackTeamIdOnBlockTeamId(S,_this.params.team),
                        blockTeam : G.selectedTeam.teamId,
                        pX : you,
                        from : G.selectedTeam.zona
                    }
                    if ( Can.block(arg) ) {
                        socket.emit('block',{
                            u:Client, 
                            arg:{
                                attackTeam : getAttackTeamIdOnBlockTeamId(S,_this.params.team),
                                blockTeam : G.selectedTeam.teamId,
                                pX : you,
                                from : G.selectedTeam.zona
                            }
                        })
                    }
                }
                G.selectedTeam.card.select( false );
                G.selectedTeam = null;
            }
        }
        if ( _this.params.owner == opp ) {
            if ( G.selectedTeam.zona == 'village' ) {
                var arg = {
                    S:S,
                    attackTeam : _this.params.team,
                    blockTeam : G.selectedTeam.teamId,
                    pX : you,
                    from : G.selectedTeam.zona
                }
                if ( Can.block(arg) ) {
                    socket.emit('block',{
                        u:Client, 
                        arg:{
                            attackTeam : _this.params.team,
                            blockTeam : G.selectedTeam.teamId,
                            pX : you,
                            from : G.selectedTeam.zona
                        }
                    })
                }
            }
            if ( G.selectedTeam.zona == 'block' ) {
                var arg = {
                        S:S,
                        attackTeam : _this.params.team,
                        blockTeam : G.selectedTeam.teamId,
                        pX : you,
                        from : G.selectedTeam.zona
                }
                if ( Can.block(arg) ) {
                    socket.emit('block',{
                        u:Client, 
                        arg:{
                            attackTeam : _this.params.team,
                            blockTeam : G.selectedTeam.teamId,
                            pX : you,
                            from : G.selectedTeam.zona
                        }
                    })
                }
            }
            G.selectedTeam.card.select( false );
            G.selectedTeam = null;
        }
    }
    else if ( G.selectedTeam.owner == opp ) {
        if ( _this.params.owner == you ) {
            if ( _this.params.zona == 'village' ) {
                var arg = {
                        S:S,
                        attackTeam : G.selectedTeam.teamId,
                        blockTeam :_this.params.team,
                        pX : you,
                        from : _this.params.zona
                }
                if ( Can.block(arg) ) {
                    socket.emit('block',{
                        u:Client, 
                        arg:{
                            attackTeam : G.selectedTeam.teamId,
                            blockTeam :_this.params.team,
                            pX : you,
                            from : _this.params.zona
                        }
                    })
                }
                G.selectedTeam.card.select( false );
                G.selectedTeam = null;
            }
            if ( _this.params.zona == 'block' ) {

                var arg = {
                        S:S,
                        attackTeam : G.selectedTeam.teamId,
                        blockTeam :_this.params.team,
                        pX : you,
                        from : _this.params.zona
                }
                if ( Can.block(arg) ) {
                    socket.emit('block',{
                        u:Client, 
                        arg:{
                            attackTeam : G.selectedTeam.teamId,
                            blockTeam :_this.params.team,
                            pX : you,
                            from : _this.params.zona
                        }
                    })
                }
                G.selectedTeam.card.select( false );
                G.selectedTeam = null;
            }
        }
        if ( _this.params.owner == opp ) {
            G.selectedTeam.card.select( false );
            G.selectedTeam = {
                teamId: _this.params.team,
                owner: _this.params.owner,
                zona: _this.params.zona,
                card: _this
            };
            _this.select( true );
        }
    }
}

/**
 * Функция возврежащет объет в котором бубут находиться ссылки на все осоновне объекты необъодимые для
 * для функций объект Can и Асtion 
 * @return {[type]} [description]
 */
function getUniversalObject(obj) {
    var res = {
        Accordance : Accordance,
        Known : Known,
        S : S,
        pX : you,
        Stadies : Stadies
    }
    var obj = obj || {};
    for (var i in obj) {
        res[i] = obj[i];
    }
    return res;
}
