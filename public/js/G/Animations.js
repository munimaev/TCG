
dateObj = new Date()
var Animations = [];
var AnimationIsRun = false;
function AnimationPush(o) {
	Animations.push(o);
	AnimationNext();
}

function AnimationNext() {
	if (AnimationIsRun || !Animations.length) return;
	var animation = Animations.splice(0,1);
	AnimationIsRun = true;
	console.log(animation[0].name)
	debugger;
	animation[0].func();
	setTimeout(function(){
		AnimationIsRun = false;
		AnimationNext();
	}, animation[0].time)
}
var AN = {
	pA : {
		handPrewiev : []
	},
	pB : {
		handPrewiev : []
	},
	playerDrawCards : function(o) {
		LogI['playerDrawCards'] = 0;
	    Log( 1, 'playerDrawCards' );
	    Log( 0, 'o' ,o);
	    var Y = 0;
	    if ( !('cards' in o) )
	        return false;

	    var $deck = $( '.deck', '#youBar' );
	    var position = $deck.offset();
	    for (var i in o.cards) {
	    	var id = o.cards[i];

	    	var construct = {};
			if (you == o.pX) {
				Y =  I.H * 2 / 3 - I.card.W / 2;
				construct =  Known[Accordance[id]];
				construct.faceUp = true;
			} else {
				Y =  I.H * 1 / 3 + I.card.W / 2;
			}
			construct.id = id;
			construct.owner = o.pX;
	        C[id] = new Card(construct);
	        C[id].animation( {
	            'X': I.W / 2 - I.card.W / 2,
	            'Y': Y,
	            'W': I.card.W,
	            x: 0, y: 0, z: 0, deg: 0,
	            duration: 1000,
	            additional: { incline: true, curveMoving: 'Y' }
	        } )
	    }

	    setTimeout( function() {
	        AN.moveToPreview( { cards: o.cards , pX :o.pX } );
	    }, 1005 );

	    setTimeout( function() {
	        AN.moveToHand( {  cards: o.cards , pX :o.pX }  )
	    }, 1765 );
	    //AnimationNext(1005)
		Log( -1, 'playerDrawCards' );
	},
	moveToHand : function(o) {
		LogI['moveToHand'] = 0;
	    Log( 1, 'moveToHand' );
	    Log( 0, 'C' , C);
	    //console.log(I.hand);
	    var needenCardsId = [ ];
	    var needenCardsIdObj = { };

	    for ( var i in S[o.pX].hand ) {
	        needenCardsIdObj[S[o.pX].hand[i]] = true;
	    }
	    if ( 'cards' in o ) {
	        for ( var i in o.cards ) {
	            needenCardsIdObj[o.cards[i]] = true;
	        }
	    }
	    for ( var i in needenCardsIdObj ) {
	        needenCardsId.push( i );
	        createCard({
	        	id:i,
		        zona:'hand',
		        owner:o.pX,
		        position:"hand"
		    })
	        C[i].changeZone( 'movingHand' )
	    }

	    var totalNumberOfCard = needenCardsId.length;

	    var coordinateY = 0;
	    if (o.pX == you) {
	    	coordinateY = I.hand.Y + I.hand.H / 2 - I.card.W / 2;
	    } else {
	    	coordinateY = -6 + I.hand.H / 2 - I.card.W / 2;
	    }
	    var margin = 0;
	    if ( totalNumberOfCard > 4 ) {
	        var step = (I.hand.W - I.card.W) / (totalNumberOfCard - 1);
	    } else {
	        var margin = (I.hand.W - I.card.W * totalNumberOfCard) / 2;
	        var step = I.card.W;
	    }
	    for ( var i in needenCardsId ) {
	        C[needenCardsId[i]].animation( {
	            'X': I.hand.X + margin + Number( i ) * step,
	            'Y': coordinateY,
	            duration: 50,
	            additional : {
		            after: {
		                func: (function() {
		                    var card = C[needenCardsId[i]];

		                    return function() {
		                        card.changeZone( 'hand' );
		                    };
		                })()
		            }
		        }
	        })
	    }

		Log( -1, 'moveToHand' );
	},
	moveToPreview : function( o ) {
		LogI['moveToPreview'] = 0;
	    Log( 1, 'moveToPreview' );
	    Log( 0, 'S' ,S[o.pX]);
	    Log( 0, 'pX' ,o.pX);

	    var total = S[o.pX].hand.length;
	    var rows = Math.ceil( total / 9 );
	    var margin = I.W / 9 - I.card.W;
	    if ( true ) { // полтные карты превью
	        margin = 1;
	    }
	    var cardInRow = Math.round( total / rows )
	    var sideMargin = I.W - (margin + I.card.W) * cardInRow - margin / 2;
	    var bottomMargin = margin;

		if (you == o.pX) {
			Y = /*I.hand.Y +*/ I.H - I.card.W /*- margin / 2*/ - bottomMargin
		} else {
			Y = /*I.hand.Y +*/ 0 // + I.card.W /*- margin / 2*/ - bottomMargin
		}
	    for ( var i in S[o.pX].hand ) {
	        bottomMargin = (Math.ceil( (Number( i ) + 1) / cardInRow ) - 1) * (I.card.W + margin);
	        C[S[o.pX].hand[i]].animation( {
	            X: sideMargin / 2 + (margin + I.card.W) * (Number( i ) % cardInRow),
	            Y: Y,
	            duration: 50,
	            additional: { curveMoving: 'Y', incline: true },
	            after: {
	                func: (function() {
	                    var card = C[S[o.pX].hand[i]];
	                    var id = S[o.pX].hand[i];
	                    return function() {
	                        card.changeZone( 'handPrewiev' );
	                    };
	                })()
	            }
	        } );
	    }
	    Log( -1, 'moveToPreview' );
	},
	moveCardToZone : function(o) {
	    //console.log('>--', o.cardID)
	    if ( !isZoneSimple(o.from)) 
	    {
	        if ( isZoneSimple(o.to) )
	        {
	    		var z = G[o.pX == you ? 'you' : 'opp'][o.to];
	    		//console.log(z)
		        C[o.cardID].params.teamPosition = null;
		        C[o.cardID].removeTeamPower();

		        C[o.cardID].animation( { X: z.X + 4, Y: z.Y + 2, H: z.H, additional: { 
		        	intoCard: true, 
		        	incline: false, 
		        	fadeIn: true, 
		        	//curveMoving: 'Y', 
		        	after: { func: function() {
                        C[o.cardID].destroyCard();
                        //updateCardCount( { owner: o.owner, area: o.to } );
                        delete C[o.cardID];
                        updTable();
                        //startTable();
                    } } } } );
	        }
	        else if ( !isZoneSimple(o.from) )
	        {

	            

	        }
	    } 
	    else if ( isZoneSimple(o.from) ) 
	    {
	        if ( isZoneSimple(o.to) ) 
	        {
				if (you == o.owner) var z = G.you[o.to]
	    		else var z = G.opp[o.to];
		        C[o.card].params.teamPosition = null;
		        C[o.card].removeTeamPower();

		        C[o.card].animation( { X: z.X + 4, Y: z.Y + 2, H: z.H, additional: { 
		        	intoCard: true, 
		        	incline: false, 
		        	fadeIn: true, 
		        	curveMoving: 'Y', 
		        	after: { func: function() {
                        C[o.card].destroyCard();
                        //updateCardCount( { owner: o.owner, area: o.to } );
                        delete C[o.card];
                        updTable();
                        //startTable();
                    } } } } );
            }
	        else if ( !isZoneSimple(o.to) ) 
	        {
	        	if (you == o.owner) {
		        	C[o.card].animation( { 
			        	X: I.table.W / 2 + I.table.Y - I.card.W, 
			        	Y: I.table.H / 2 - I.card.W, 
			        	H: I.card.W * 2, 
			        	additional: {
			        		outCard:true
			        	}
		            })
	            }
	        	else if  (you != o.owner) {
		        	C[o.card].animation( { 
			        	X: I.table.W / 2 + I.table.Y - I.card.W, 
			        	Y: I.table.H / 2 - I.card.W, 
			        	H: I.card.W * 2, 
			        	y:1,
			        	deg:90,
			        	duration:600,
			        	additional: { 
			        		incline: true,  
			        		after: { func: function() {
			        			C[o.card].setNewParams(Known[Accordance[o.card]]);
			        			C[o.card].params.incline.y = -1;
			        			C[o.card].params.incline.deg = 90;
			        			C[o.card].params.W = I.card.W * 2 ;
		                        C[o.card].$id.empty();
		                        C[o.card].fillAsFaceUp( C[o.card].$id );
		                        C[o.card].updateLinks();
		                        C[o.card].updateMouse();
		                        C[o.card].animation({
		                        	y:0,
						        	deg:0,
						        	duration:600,
						        	additional: { 
						        		outCard:true,
						        		after : {
						        			func: function(){console.log(C[o.card].params.incline)}
						        		}
						        	} 
						        });
		           			}} 
		                }
		            })
	        	}
			    AnimationPush({func:function() {
			        updTeams();
			    }, timer:1200, name: 'updTeams'});
	        }
	    }
	},
	damage : function(cardID, o) {
		C[cardID].effect({type:'simple', target:'one', pic:"public/pics/damage.png"})
	},
	reward : function(cardID, o) {
		C[cardID].effect({type:'simple', target:'one', pic:"public/pics/reward.png"})
	},
	uturn : function(cardID, o) {
            var sprite = $('<div />', {})
                .css('width', I.scroll.W)
                .css('height', I.scroll.H)
                .css('top', I.scroll.Y)
                .css('left', I.scroll.X)
                .css('position', 'absolute')
                .css('opacity',0)
                .append($('<img />',{
                    src :"public/pics/uturn.png",
                    width :  I.scroll.W,
                    height :  I.scroll.H,
                }))
            H.animate.append(sprite);
            sprite.animate({
                    opacity: 1,
                }, 600, 
                function() {
                    sprite.animate({

                            opacity: 0,
                        }, 600, 
                        function() {
                            sprite.remove()
                        });
                });
	},
	autoNextPhase : function(o) {
		if (Can.pressNextBtn(o))
		console.log('> pressNextBtn')
			socket.emit('pressNextBtn',{u:Client})
	}
}
