var socket = io();
	socket.on('connected', function(d){
});

var Client = {};
var you = "pX";
var opp = "pX";
var Animation = [];
var Accordance = {};
var Known = {};
var Meta = {
	toNextPhase : {
		pB : false,
		pA : false,
	}
}
var S = null; // snapshot
var C = {}; // cards

socket.on('C_init', function(d){
	Client.you = you = d.you;
	Client.opp = opp = d.opp;
	Client.table = d.table
	Client.ses = ses;
	S = d.snapshot;
	updAllCount();
    if (S && ready) {
		socket.emit('imJoined',Client)
	}
	//console.log('Client',Client)
});


// работа с интерфейсом
function updAreaCount(player, area) {
	var count =  S[Client[player]][area].length;
	H[player][area].span.html(count)
}
function updRewardsCount(player) {
	var count =  S[Client[player]].rewards;
	H[player].rewards.span.html(count)
}
function updTurnCounter(player) {
	var count =  S[Client[player]].turnCounter;
	H[player].turnCounter.span.html(count)
}
function updAllCount() {
	var P, A;
	for (var p in P = ['you','opp']) {
		for (var a in A = ['deck', 'discard', 'chackra']) {
			updAreaCount(P[p],A[a]);
		}
		updRewardsCount(P[p]);
		updTurnCounter(P[p]);
	}
}

socket.on('bothIsJoin', function(d) {
	Accordance = d.accordance;
	Known = d.known;
	console.log(d)
	if (d.isNewGame) socket.emit('startDrawHand', {u:Client});
    	updTable();
})

socket.on('log', function(d){
	console.log(d.txt)
});

function get_S()          { return S;}
function get_you()        { return you;}
function get_Stadies()    { return Stadies;}
function get_Known()      { return Known;}
function get_Accordance() { return Accordance;}

function get_arg(txt) {
	if (typeof(txt) == 'string' && txt.substr(0,4) == 'get_') return window[txt]();
	return txt;
}



function applyUpd(d) {
	if (d.upd) {
//		console.log("↳ upd ",d.upd)
		if (d.upd.known) for (var i in d.upd.known) {
			Known[i] = d.upd.known[i];
		}
		if (d.upd.accordance) for (var i in d.upd.accordance) {
			Accordance[i] = d.upd.accordance[i];
		}
		if (d.upd.meta) for (var i in d.upd.meta) {
			Meta[i] = d.upd.meta[i];
		}
	}
}
socket.on('update',function(d) {
	 applyUpd(d);
})

socket.on('action',function(d) {
	 applyAct(d);
})

function applyAct(d) {
	if (d.acts) {
//		console.log("↳ acts ",d.acts)
		for (var i in d.acts) {
			for (var i2 in d.acts[i].arg) {
				d.acts[i].arg[i2] = get_arg(d.acts[i].arg[i2])
			}
			Actions[d.acts[i].act](d.acts[i].arg)
		}
	}
}
socket.on('updact',function(d) {
	 applyUpd(d);
	 applyAct(d);
})
