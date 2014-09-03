
dateObj = new Date()
var Animations = [];
var AnimationIsRun = false;
function AnimationPush(o) {
	//console.log('push ' + o.name + ' - ' + o.time)
	Animations.push(o);
	//console.log('-----------');
	// for (var i in Animations) {
	//console.log(i, Animations[i].name);
	// }
	//console.log('-----------');
	AnimationNext();
}

function AnimationNext() {
	if (AnimationIsRun || !Animations.length || AN.stop) return;
	var animation = Animations.splice(0,1);
	AnimationIsRun = animation[0].name;
	animation[0].func();
	setTimeout(function(){
		AnimationIsRun = false;
		AnimationNext();
	}, animation[0].time)
}
var AN = {
	stop : false,
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
	    	//console.log(o, you)
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
		    C[i].setZIndex( 800 )
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
		                        card.setZIndex( 400 )
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
	    	if (!C[S[o.pX].hand[i]]) {
	    		//console.log('!card') ;continue;
	    	}
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
	moveCardToZone : function(args, o) {
	    console.log('>--', o)
	    
	    if ( !isZoneSimple(args.from)) 
	    {
	        if ( isZoneSimple(args.to) )
	        {
	    		var z = G[args.pX == you ? 'you' : 'opp'][args.to];
	    		//console.log(z)
				C[args.card].setZIndex(825);
		        C[args.card].params.teamPosition = null;
		        C[args.card].removeTeamPower();

		        C[args.card].animation( { X: z.X + 4, Y: z.Y + 2, H: z.H, additional: { 
		        	intoCard: true, 
		        	incline: false, 
		        	fadeIn: true, 
		        	//curveMoving: 'Y', 
		        	after: { func: function() {
                        C[o.card].destroyCard();
                        //updateCardCount( { owner: o.owner, area: o.to } );
                        delete C[o.card];
                        //updTable();
                        //startTable();
                    } } } } );
	        }
	        else if ( !isZoneSimple(args.from) )
	        {

	            

	        }
	    } 
	    else if ( isZoneSimple(args.from) ) 
	    {
	        if ( isZoneSimple(args.to) ) 
	        {
				if (you == args.pX) var z = G.you[args.to]
	    		else var z = G.opp[args.to];
				C[args.card].setZIndex(825);
		        C[args.card].params.teamPosition = null;
		        C[args.card].removeTeamPower();

		        C[args.card].animation( { X: z.X + 4, Y: z.Y + 2, H: z.H, additional: { 
		        	intoCard: true, 
		        	incline: false, 
		        	fadeIn: true, 
		        	curveMoving: 'Y', 
		        	after: { func: function() {
                        C[args.card].destroyCard();
                        //updateCardCount( { owner: o.owner, area: o.to } );
                        delete C[args.card];
                        //updTable();
                        //startTable();
                    } } } } );
            }
	        else if ( !isZoneSimple(args.to) ) 
	        {
	        	if (you == args.pX) {
					C[args.card].setZIndex(825);
		        	C[args.card].animation( { 
			        	X: I.table.W / 2 + I.table.Y - I.card.W, 
			        	Y: I.table.H / 2 - I.card.W, 
			        	H: I.card.W * 2, 
			        	additional: {
			        		outCard:true
			        	}
		            })
	            }
	        	else if  (you != args.pX) {
					C[args.card].setZIndex(825);
		        	C[args.card].animation( { 
			        	X: I.table.W / 2 + I.table.Y - I.card.W, 
			        	Y: I.table.H / 2 - I.card.W, 
			        	H: I.card.W * 2, 
			        	y:1,
			        	deg:90,
			        	duration:600,
			        	additional: { 
			        		incline: true,  
			        		after: { func: function() {
			        			C[args.card].setNewParams(Known[Accordance[args.card]]);
			        			C[args.card].params.incline.y = -1;
			        			C[args.card].params.incline.deg = 90;
			        			C[args.card].params.W = I.card.W * 2 ;
		                        C[args.card].$id.empty();
		                        C[args.card].fillAsFaceUp( C[args.card].$id );
		                        C[args.card].updateLinks();
		                        C[args.card].updateMouse();
		                        C[args.card].animation({
		                        	y:0,
						        	deg:0,
						        	duration:600,
						        	additional: { 
						        		outCard:true,
						        		after : {
						        			func: function(){
						        				//console.log(C[o.card].params.incline)
						        			}
						        		}
						        	} 
						        });
		           			}} 
		                }
		            })
	        	}
			    // AnimationPush({func:function() {
			    //     updTeams();
			    // }, time:1200, name: 'updTeams'});
	        }
	    }
	},
	damage : function(cardID, o) {
		C[cardID].effect({type:'simple', target:'one', pic:"public/pics/damage.png"})
	},
	reward : function(cardID, o) {
		C[cardID].effect({type:'simple', target:'one', pic:"public/pics/reward.png"})
	},
	uturn : function(args, o) {
		var o = o || {};
		o.bigBannerPics = "public/pics/uturn.png";
		AN.bigBanner(o);
	},
	winner : function(o) {
		var o = o || {};
		if (o.winner == you) o.bigBannerPics = "public/pics/win.png";
		if (o.winner == opp) o.bigBannerPics = "public/pics/lose.jpg";
		AN.bigBanner(o);
	},
	bigBanner : function(o) {
            var sprite = $('<div />', {})
                .css('width', I.scroll.W)
                .css('height', I.scroll.H)
                .css('top', I.scroll.Y)
                .css('left', I.scroll.X)
                .css('position', 'absolute')
                .css('opacity',0)
                .append($('<img />',{
                    src : o.bigBannerPics,
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
		if (Can.pressNextBtn(o)){
			socket.emit('pressNextBtn',{u:Client})
		}
	},
	changePahseName : function(newName,afterFunc) {
		if (H.phase.html() !== newName) {
			H.phase.animate({opacity:0},250, function(){
				H.phase.html(newName);
				H.phase.animate({opacity:1},250,afterFunc);	
			})
		}
	},
	Questions : {
		/**
		 * Указвает игроку выбрать нового лидера
		 * @param  {[type]} o объект с аргументами
		 * @param  {[type]} o.pX хлебная крошка в пути до команды
		 * @param  {[type]} o.zone хлебная крошка в пути до команды
		 * @param  {[type]} o.team хлебная крошка в пути до команды
		 * @return {[type]}   [description]
		 */
		newLeader : function(args, o) {
			AN.stop = true;
			//console.log('newLeader')
		    if (!('newLeader' in Answers)) Answers.newLeader = [];
		    var condidateCount = [];
		    for (var i in S[args.pX][args.zone].team[args.team]) {
		    	var cardId = S[args.pX][args.zone].team[args.team][i];
		    	if (Can.newLeader({
			    		Known : Known,
			    		Accordance : Accordance,
			    		card : cardId,
			    		team : args.team,
			    		zone : args.zone,
			    		pX : args.pX,
			    		S : S
		    		})
		    	) {
		    		condidateCount.push(cardId);
		    		C[cardId].setZIndex(1202);
		    	}
		    }
		    //console.log(Answers);
		    if(!condidateCount.length) {
				AN.stop = false;
		    	AN.preStack.countDown();
		    	return;
		    }
		    $( '#noir' ).css( 'width', I.table.W ).css( 'height', I.table.H ).html( 'Выберите нового лидера для команды' );
		    Context.workingUnit = 'card';
		    Context.clickAction = function( card ) {
		    	// Actions.newLeader( {
		    	// 	pX   : you,
			    // 	zone : args.zone,
		    	// 	team : args.team,
		    	// 	card : cardId,
		    	// }, o);
		    	//console.log(cardId, card.id)
		    	
		    	Answers.newLeader.push( {
		    		pX   : you,
			    	zone : args.zone,
		    		team : args.team,
		    		card : card.id,
		    	});
		    	AN.preStack.countDown()
		        Context.workingUnit = null;
		        Context.clickAction = null;
		        for (var i in condidateCount) {
		        	C[condidateCount[i]].setZIndex(200);
		        }
		        $( '#noir' ).css( 'width', 0 ).css( 'height', 0 ).html( '' );
				AN.stop = false;
				AnimationNext();
		    }
		}
	},
	preStack : {
		count : 0,
		countDown : function() {
			
			//console.log('stackPrepArfterIsRun = ',stackPrepArfterIsRun)
			AN.preStack.count--;
			//console.log('--',AN.preStack.count)
			if (AN.preStack.count < 1) {
				if (stackPrepBeforIsRun ) {
					stackPrepBeforIsRun = false;
					//console.log('b')
					applyStackNormal();
				}
				else if (stackPrepArfterIsRun ) {
					stackPrepArfterIsRun = false;
					//console.log('a')
					applyStackAfter();
				}
				else {
					//console.log('n', Answers)
					console.log(Answers);
					socket.emit('preStackDone',{u:Client, answers: Answers});
					Answers = {};
				}
			}
		},
		adWinnerAndLoser : function(args) {
			//console.log(args)
			setTimeout(function(){
					AN.preStack.count--;
					if (AN.preStack.count < 1) {
						socket.emit('preStackDone',{u:Client})
					}
				}, 500
			)
		},
		givingDamage : function(args) {
			C[args.card].effect({
				type : 'simple',
				target : 'one',
				afterFunc : AN.preStack.countDown
			})
		},
		'damageResult' : function(args) {
			if (args.result == 'death')  {
				C[args.card].effect({
					type : 'simple',
					target : 'one',
					pic : "public/pics/death.jpg",
					afterFunc : AN.preStack.countDown
				})
			}
			else if(args.result == 'injured'){
				Actions.injureTarget(args.card, getUniversalObject());
			}

		},
		'moveCardToZone' : function(args) {
			Actions.moveCardToZone(args, getUniversalObject(args))
		},
		'afterQuestion' : function(args) {
			//console.log('afterQuestion', args)
			if (args.pX === you) {

			    AnimationPush({func:function() {
					AN.Questions[args.question](args, getUniversalObject());
			    }, time:1200, name: 'Questions - ' + args.question });
				
			}
			else {
				AN.preStack.countDown();
			}
		},
		'updTable' : function(args) {
			updTable();
			setTimeout(AN.preStack.countDown,1100);
		},
		'toNextPhase' : function(args) {
	        
			Actions.toNextPhase(args, getUniversalObject());
		},
		'newLeader' : function(args) {
			//console.log(args);
			Actions.newLeader(args, getUniversalObject());
		},
		'givingReward' : function(args) {
			console.log(args);
			Actions.giveReward(args, getUniversalObject());
		},
		'returnToVillaje' : function(args) {
			console.log(args);
			Actions.retrunTeamToVillage(args, getUniversalObject());
		},
		'adNewTurn' : function(args) {
			console.log(args, getUniversalObject());
			AN.uturn(args, getUniversalObject())
			setTimeout (AN.preStack.countDown, 1210)
		},
		'drawCard' : function(args) {
			console.log(args);
			Actions['Draw X cards'](args, getUniversalObject())
		},
		'putCardInPlay' : function(args) {
			Actions.moveCardToZone(args, getUniversalObject())
		},
		'winner' : function(args) {
			Actions.winner(args, getUniversalObject())
		},
		'winner' : function(args) {
			Actions.winner(args, getUniversalObject())
		},
		'startDrawHand' : function(args) {
			console.log('startDrawHand')
			AN.preStack.countDown();
		}
	}
}
