var module = null;
var H = {
    you : {deck:{},discard:{},chackra:{}},
    opp : {deck:{},discard:{},chackra:{}},
    phase : null,
};
var ready = false;
function arraySearch(array, value) {
    for ( var i in array) {
        console.log('msg',i,array[i], value)
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
    H.opp.deck.span    = $("#oppBar .deck span");
    H.opp.discard.span = $("#oppBar .discard span");
    H.opp.chackra.span = $("#oppBar .chackra span");
    H.next =  $("#next");
    H.phase =  $("#phase");

	var urlGet = {};
	for (var i in l = location.search.substr(1).split('&')) {
	    var m = l[i].split('=');
	    urlGet[m[0]] = m[1];
	}
	socket.emit('initGame', urlGet);
    ready = true;
    if (S && ready) {
        socket.emit('imJoined',Client)
    }
})

