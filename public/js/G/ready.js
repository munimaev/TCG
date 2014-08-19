var module = null;
var H = {
    you : {deck:{},discard:{},chackra:{},rewards:{},turnCounter:{}},
    opp : {deck:{},discard:{},chackra:{},rewards:{},turnCounter:{}},
    phase : null,
};
var ready = false;
function arraySearch(array, value) {
    for ( var i in array) {
        if (array[i] == value) {
            return i;
        }
    }
    return null
}
$( document ).ready(function() {

    H.you.deck.span    = $("#youBar .deck span");
    H.you.discard.span = $("#youBar .discard span");
    H.you.chackra.span = $("#youBar .chackra span");
    H.you.rewards.span = $("#youBar .rewards span");
    H.you.rewards.pic  = $("#youBar .rewards pic");
    H.you.turnCounter.span = $("#youBar .turnCounter span");
    H.you.turnCounter.pic  = $("#youBar .turnCounter pic");
    H.opp.deck.span    = $("#oppBar .deck span");
    H.opp.discard.span = $("#oppBar .discard span");
    H.opp.chackra.span = $("#oppBar .chackra span");
    H.opp.rewards.span = $("#oppBar .rewards span");
    H.opp.rewards.pic  = $("#oppBar .rewards pic");
    H.opp.turnCounter.span = $("#oppBar .turnCounter span");
    H.opp.turnCounter.pic  = $("#oppBar .turnCounter pic");
    H.next = $("#next");
    H.phase = $("#phase");
    H.animate = $("#animate");

	// var urlGet = {};
	// for (var i in l = location.search.substr(1).split('&')) {
	//     var m = l[i].split('=');
	//     urlGet[m[0]] = m[1];
	// }
	socket.emit('initGame', {ses:ses});
    ready = true;
    if (S && ready) {
        socket.emit('imJoined',Client)
    }
})

