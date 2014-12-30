/*
 MIT http://opensource.org/licenses/MIT
 @date 2013-05-11
*/
(function(a){var c={xy:function(b,e){return this.each(function(){a(this).css({position:"absolute",top:e,left:b})})},size:function(b,e){return this.each(function(){a(this).css({width:b,height:e})})},xysize:function(b,e,c,d){return this.each(function(){a(this).css({position:"absolute",top:e,left:b,width:c,height:d})})}};a.fn.putty=function(b){if(c[b])return c[b].apply(this,Array.prototype.slice.call(arguments,1));if("object"===typeof b||!b)return c.init.apply(this,arguments);a.error("Undefined method "+
b)};a(window).trigger("curtain_start");a(window).ready(function(){a(window).trigger("readyresize",[a(window).width(),a(window).height()]);a(window).trigger("curtain_end")});var f;a(window).resize(function(){a(window).trigger("curtain_start");a(window).trigger("readyresize",[a(window).width(),a(window).height()]);clearTimeout(f);f=setTimeout(function(){a(window).trigger("curtain_end")},100)});a.fn.readyresize=function(b){a(window).bind("readyresize",function(a,c,d){b(c,d)})};var d=!1;a.fn.curtain_start=
function(b){d||(d=!0,a(window).bind("curtain_start",b))};a.fn.curtain_end=function(b){d=!1;a(window).bind("curtain_end",b)}})(jQuery);



var I = {
    table : {
        X:0, Y:0, H:0, W:0
    },
    hand : {},
    card : {},
    scroll : {}
}
var G = {
    timers: { },
    selectedTeam: null,
    selectedCard: null,
    transferInitiative : false
}

$( document ).ready(function() {

    return false;
    for (var p in P = ['you','opp']) {
        if (!(window[P[p]] in G)) G[window[P[p]]] = {};
        for (var a in A = ['deck','chackra','discard']) {
            if (!(A[a] in G[window[P[p]]])) G[window[P[p]]][A[a]] = {};
            var area  = G[window[P[p]]][A[a]];
            area.barBtn = $('.'+A[a],'#'+P[p]+'Bar');
            area.countBtn = $('span',area.barBtn);
            updateCardCount({owner:window[P[p]],area:A[a]});
            area.barBtn.click(
                (function(){
                    var aa = A[a]+'';
                    var pp = P[p]+'';
                    return function(){
                        console.log(1)
                        areaClick({'owner':window[pp],'area':aa, 'clicker': you});
                    }
                })()
            );
        }
    }
    updCurentPhase();
    $('#next').click( function () {btnNextPhase()});
    $('#table').click( function () {emptyClick()})
})

$(window).readyresize(function(width, height) {
    if(width < 1000) {
        width = 1000;
    }
    if(height < 500) {
        height = 500;
    }
    if (document.body.clientHeight < height) {
        height = document.body.clientHeight;
    }
    //внутренние размеры основного фрейма
    var main_W = I.W = width;
    var main_H = I.H = height;

    var bar_H  = Math.round(width / 30) + 3;
    var bar_Y  = main_H + 3 - bar_H;
    var hand_W = I.hand.W = Math.round(main_W * 0.4);
    var controls_H = bar_H - 3;
    $('#main').putty('xysize', 0, 0, main_W , main_H);
    $('#oppBar').putty('xysize', 0, 0, main_W , bar_H );
    $('#youBar').putty('xysize', 0, main_H - bar_H , main_W , bar_H  );
    $('.avatar').putty('xysize', 1, 1, bar_H - 4, bar_H - 4);

    if (!('opp' in G)) G.opp = {};
    if (!('you' in G)) G.you = {};

    I.table.W = I.table.W = I.W;
    I.table.H = I.table.H = I.H - 2 * bar_H;
    I.table.Y = I.table.Y = bar_H;
    I.table.X = I.table.X = 0;
    var login_W = Math.round(main_W * 0.2) - bar_H ;
    $('.login')
            .putty('xysize', bar_H, 1, dd_W - 8,  bar_H - 5)
            .css('lineHeight',  (bar_H - 5) + 'px')
            .css('fontSize',  (bar_H - 5 ) / 1.5 + 'px');
    var dd_W = Math.round(main_W * 0.05);
    $('.discard')
            .putty('xysize', bar_H + login_W, 1, dd_W - 8,  bar_H - 12)
            .css('lineHeight',  (bar_H - 12) + 'px')
            .css('fontSize',  (bar_H - 12 ) / 1.5 + 'px');

    if (!('discard' in G.opp)) G.opp.discard = {L:{}};
    if (!('discard' in G.you)) G.you.discard = {L:{}};
    G.opp.discard.W = G.you.discard.W = dd_W - 8;
    G.opp.discard.H = G.you.discard.H = bar_H - 12;
    G.opp.discard.X = G.you.discard.X = bar_H + login_W;
    G.you.discard.Y = main_H - bar_H + 6;

    G.opp.discard.L.span = $("span #discard, #youBar")

    $('.deck')
            .putty('xysize', bar_H + login_W + dd_W, 1, dd_W - 8,  bar_H - 12)
            .css('lineHeight',  (bar_H - 12) + 'px')
            .css('fontSize',  (bar_H - 12 ) / 1.5 + 'px');


    if (!('deck' in G.opp)) G.opp.deck = {};
    if (!('deck' in G.you)) G.you.deck = {};
    G.opp.deck.W = G.you.deck.W = dd_W - 8;
    G.opp.deck.H = G.you.deck.H = bar_H - 12;
    G.opp.deck.X = G.you.deck.X = bar_H + login_W + dd_W;
    G.you.deck.Y = main_H - bar_H + 6;
    G.opp.deck.Y = 6;
    //Hand
    I.hand.W = hand_W ;
    I.hand.H = bar_H ;
    I.hand.X = I.hand.X = bar_H + login_W + dd_W+ dd_W;
    I.hand.Y = bar_Y;
    $('#youHand').putty('xysize', bar_H + login_W + dd_W+ dd_W, 1, hand_W, bar_H - 4);
    $('#oppHand').putty('xysize', bar_H + login_W + dd_W+ dd_W, 1, hand_W, bar_H - 4);
    $('#table').putty('xysize', 0, bar_H, main_W, main_H - 2 * bar_H );
    $('#noir').putty('xysize', 0, 0, 0, 0 )
            .css('lineHeight',  (bar_H - 5) + 'px')
            .css('fontSize',  (bar_H - 5 ) / 1.5 + 'px');

    //Chakra
    $('.chackra')
            .putty('xysize', bar_H + login_W + dd_W + dd_W + hand_W, 1, dd_W - 8,  bar_H - 12)
            .css('lineHeight',  (bar_H - 12) + 'px')
            .css('fontSize',  (bar_H - 12 ) / 1.5 + 'px');


    if (!('chackra' in G.opp)) G.opp.chackra = {};
    if (!('chackra' in G.you)) G.you.chackra = {};
    G.opp.chackra.W = G.you.chackra.W = dd_W - 8;
    G.opp.chackra.H = G.you.chackra.H = bar_H - 12;
    G.opp.chackra.X = G.you.chackra.X = bar_H + login_W + dd_W + dd_W + hand_W;
    G.you.chackra.Y = main_H - bar_H + 6;
    G.opp.chackra.Y = 6;

    // Rewards

    $('.rewards')
            .putty('xysize',  bar_H + login_W + dd_W * 3 + hand_W , -1, dd_W - 8,  bar_H - 8)            
            .css('lineHeight',  (bar_H - 5) + 'px')
            .css('fontSize',  (bar_H - 5 ) / 1.5 + 'px');

    if (!('rewards' in G.opp)) G.opp.rewards = {};
    if (!('rewards' in G.you)) G.you.rewards = {};
    G.opp.rewards.W = G.you.rewards.W = dd_W - 8;
    G.opp.rewards.H = G.you.rewards.H = bar_H - 12;
    G.opp.rewards.X = G.you.rewards.X = bar_H + login_W + dd_W + dd_W + hand_W + dd_W;
    G.you.rewards.Y = main_H - bar_H + 6;
    G.opp.rewards.Y = 6;

    // turn Counter

    $('.turnCounter')
            .putty('xysize',  bar_H + login_W + dd_W * 4 + hand_W , -1, dd_W - 8,  bar_H - 8)            
            .css('lineHeight',  (bar_H - 5) + 'px')
            .css('fontSize',  (bar_H - 5 ) / 1.5 + 'px');

    if (!('turnCounter' in G.opp)) G.opp.turnCounter = {};
    if (!('turnCounter' in G.you)) G.you.turnCounter = {};
    G.opp.turnCounter.W = G.you.turnCounter.W = dd_W - 8;
    G.opp.turnCounter.H = G.you.turnCounter.H = bar_H - 12;
    G.opp.turnCounter.X = G.you.turnCounter.X = bar_H + login_W + dd_W + dd_W  + dd_W + hand_W + dd_W;
    G.you.turnCounter.Y = main_H - bar_H + 6;
    G.opp.turnCounter.Y = 6;

    // Next Phase
    $('#next')
            .putty('xysize', main_W - dd_W * 1.5 - 1, 1, dd_W * 1.5 - 8,  bar_H - 12)
            .css('lineHeight',  (bar_H - 12) + 'px')
            .css('fontSize',  (bar_H - 12 ) / 1.5 + 'px');

    $('#phase')
            .putty('xysize', bar_H + login_W + dd_W * 3 + hand_W, -bar_H, (main_W - 0 - 1) - (bar_H + login_W + dd_W * 3 + hand_W),  bar_H - 12)
            .css('lineHeight',  (bar_H - 12) + 'px')
            .css('fontSize',  (bar_H - 12 ) / 1.5 + 'px');

    I.card.W = Math.round(main_W / 10);

    I.scroll.W = I.W - bar_H;
    I.scroll.H = I.H - 2 * (I.card.W - bar_H);
    I.scroll.Y = I.card.W - bar_H;
    I.scroll.X = 1 + bar_H / 2;

});



function btnArea(area,owner,args) {
    var args = args || {};
    var o = {
        owner :owner,
        area : area,
        clicker : you,
        args:args
    };
    areaClick(o);
}

function areaClick(o){
    if(!('owner' in o && 'area' in o && 'clicker' in o)) {
        alert('Недостаток аргументов areaClick/n'
                + 'owner: ' + o.owner
                + ', area: ' + o.area
                + ', clicker: ' + o.clicker);
        return false;
    };
    if (G[o.owner][o.area].isOpen) {
        var pX = o.owner == 'you' ? you : opp; 
        for (var i in S[pX][o.area]) {
            C[S[pX][o.area][i]].$mouse.mouseout();
            C[S[pX][o.area][i]].hidePrewiev();
        }
        emptyScroll(o);
        $('#' + o.owner + '_' + o.area + '_' + o.clicker).remove();
        $('.'+o.area,'#'+o.owner+'Bar').removeClass('selectedZone');
        G[o.owner][o.area].isOpen = false;
    }
    else {
        for ( var i in I.isArea) {
            var area = I.isArea[i];
            for (var i2 in A = ['you','opp']) {
                if (G[A[i2]][area].isOpen) {
                    console.log(A[i2],area)
                    areaClick({'owner':A[i2], 'area':area, clicker: you});
                }
            }
        }
        $('#main').append(
            $('<div />', {'class':'scrollWrap','id':o.owner + '_' + o.area + '_' + o.clicker})
                .css('width',I.scroll.W)
                .css('height',I.scroll.H)
                .css('top',I.scroll.Y)
                .css('left',I.scroll.X)
                .append($('<div />', {'class':'scroll','id':o.owner + '_' + o.area + '_' + o.clicker + '_'})
                    .css('height',I.scroll.H - 24)
                   // .css('width',I.scroll.W - 22)
                    .append($('<h3 />',{'text':D.names[o.area].rus})
                        .css('line-height',(I.scroll.H - 8) / 15 + 'px')
                        .css('font-size',(I.scroll.H - 8) / 15)
                        .css('height',(I.scroll.H - 8) / 15)
                        )
                    .append($('<div />',{'class':'scrollCards'})
                        .css('height',I.scroll.H - 49 - (I.scroll.H - 8) / 15)
                       // .css('width',I.scroll.W - 40 )
                       )
                )
        );
        $('.'+o.area,'#'+o.owner+'Bar').addClass('selectedZone');
        G[o.owner][o.area].isOpen = true;
        fillScroll(o);
    }
}

function fillScroll(o){
    var G = S[Client[o.owner]][o.area];
    var faceUp = false;
    if (o.area == 'chackra' || o.area == 'discard') {
        faceUp = true;
    }
    var params = {};
    for (var i in G) {
        var thisFaceUp = faceUp;
        if (o.args.faceUp && ~o.args.faceUp.indexOf(G[i])) thisFaceUp = true;
        params = Known[Accordance[G[i]]] || {};
        var preparams = {'id':G[i],'X':0,'Y':0,'H':I.card.W,'W':I.card.W, faceUp:thisFaceUp, zindex:600};
        for (var i2 in preparams) {
            params[i2] = preparams[i2];
        }
        C[G[i]] = new Card(params);
        C[G[i]].$id.css('position','relative').css('display','inline-block').css('margin','0 1.1% 1.1% 0');
        $('.scrollCards','#' + o.owner + '_' + o.area + '_' + o.clicker).append(C[G[i]].$id);
    }
}

function emptyScroll(o){
    var G = S[Client[o.owner]][o.area];
    for (var i in G) {
        C[G[i]].destroyCard();
        //delete window[G[i]];
    }
}

var Context = {
    workingUnit : null,
    clickAction : null,
}

// function atStart() {
//     Log(1,'atStart');
//     var newPhase = '';
//     for (var i in Stadies.order) {
//         if (Stadies.order[i] == Stadies.current ) {
//             if (Stadies.order.length > Number(i) + 1) {
//                 newPhase = Stadies.order[ Number(i) + 1];
//             } 
//             else {
//                 newPhase = Stadies.order[0]
//             }
//         }
//     }
//     switch (newPhase) {
//         case 'comeback': 
//             var arrP = ['pA','pB'];
//             for (var p in arrP) {
//                 var order = S[arrP[p]].attack.order;
//                 Log(0,'atStart',S[arrP[p]]);
//                 for (var t = order.length - 1; t >= 0 ; t--) {
//                     moveOutAttackJSON(window[S[arrP[p]].attack.team[order[t]].leader.order[0]]);
//                 }
//                 var order = S[arrP[p]].block.order;
//                 for (var t = order.length-1; t >= 0 ; t--) {
//                     moveOutBlockJSON(window[S[arrP[p]].block.team[order[t]].leader.order[0]]);
//                 }
//             }
//             return true;
//         break;
//     }
//     Log(-1,'atStart');
//     return true; 
// }

// Именование функций
// actionCardJS - действие с JS обеъектом карта
// actionCardHTML - дейсвтие с HTMl объектом - вся анимация на нем. Так же все
// дейсвтяи поьзователь совершает именно над этими объектами
// actionCardJSON
// actionCard - подразумеват что будут выполнены все предудещие функции

