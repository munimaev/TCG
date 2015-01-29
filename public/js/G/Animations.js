
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

/**
 * Запускае следующую анимацию
 */
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
	playerDrawCards: function(o) {
		LogI['playerDrawCards'] = 0;
		Log(1, 'playerDrawCards');
		Log(0, 'o', o);
		var Y = 0;
		if (!('cards' in o))
			return false;

		var $deck = $('.deck', '#youBar');
		var position = $deck.offset();
		for (var i in o.cards) {
			var id = o.cards[i];
			//console.log(o, you)
			var construct = {};
			if (you == o.pX) {
				Y = I.H * 2 / 3 - I.card.W / 2;
				construct = Known[Accordance[id]];
				construct.faceUp = true;
			} else {
				Y = I.H * 1 / 3 + I.card.W / 2;
			}
			construct.id = id;
			construct.owner = o.pX;
			construct.zona = 'hand';
			createCard(construct)
			// C[id] = new Card(construct);
			C[id].animation({
				'X': I.W / 2 - I.card.W / 2,
				'Y': Y,
				'W': I.card.W,
				x: 0,
				y: 0,
				z: 0,
				deg: 0,
				duration: 1000,
				additional: {
					incline: true,
					curveMoving: 'Y'
				}
			})
		}

		setTimeout(function() {
			AN.moveToPreview({
				cards: o.cards,
				pX: o.pX
			});
		}, 1005);

		setTimeout(function() {
			AN.moveToHand({
				cards: o.cards,
				pX: o.pX
			})
		}, 1765);
		//AnimationNext(1005)
		Log(-1, 'playerDrawCards');
	},
	moveToHand: function(o) {
		LogI['moveToHand'] = 0;
		Log(1, 'moveToHand');
		//console.log(I.hand);
		var needenCardsId = [];
		var needenCardsIdObj = {};

		for (var i in S[o.pX].hand) {
			needenCardsIdObj[S[o.pX].hand[i]] = true;
		}
		if ('cards' in o) {
			for (var i in o.cards) {
				needenCardsIdObj[o.cards[i]] = true;
			}
		}
		for (var i in needenCardsIdObj) {
			needenCardsId.push(i);
			createCard({
				id: i,
				zona: 'hand',
				owner: o.pX,
				position: "hand"
			})
			if (C[i].params.zona == 'presentation') {
				continue;
			}
			C[i].setZIndex(800)
			C[i].changeZone('movingHand')
		}

		var totalNumberOfCard = needenCardsId.length;

		var coordinateY = 0;
		if (o.pX == you) {
			coordinateY = I.hand.Y + I.hand.H / 2 - I.card.W / 2;
		} else {
			coordinateY = -6 + I.hand.H / 2 - I.card.W / 2;
		}
		var margin = 0;
		if (totalNumberOfCard > 4) {
			var step = (I.hand.W - I.card.W) / (totalNumberOfCard - 1);
		} else {
			var margin = (I.hand.W - I.card.W * totalNumberOfCard) / 2;
			var step = I.card.W;
		}
		for (var i in needenCardsId) {
			if (C[needenCardsId[i]].params.zona == 'presentation') {
				continue;
			}
			C[needenCardsId[i]].animation({
				'X': I.hand.X + margin + Number(i) * step,
				'Y': coordinateY,
				'W': I.card.W,
				duration: 50,
				additional: {
					after: {
						func: (function() {
							var card = C[needenCardsId[i]];

							return function() {
								card.changeZone('hand');
								card.setZIndex(400);
								card.$id.
								css('-webkit-transform', 'rotate3d(0,0,0,0deg)').
								css('-moz-transform', 'rotate3d(0,0,0,0deg)');
							};
						})()
					}
				}
			})
		}

		Log(-1, 'moveToHand');
	},
	moveToPreview: function(o) {
		LogI['moveToPreview'] = 0;
		Log(1, 'moveToPreview');
		Log(0, 'S', S[o.pX]);
		Log(0, 'pX', o.pX);

		var total = S[o.pX].hand.length;
		var rows = Math.ceil(total / 9);
		var margin = I.W / 9 - I.card.W;
		if (true) { // полтные карты превью
			margin = 1;
		}
		var cardInRow = Math.round(total / rows)
		var sideMargin = I.W - (margin + I.card.W) * cardInRow - margin / 2;
		var bottomMargin = margin;

		if (you == o.pX) {
			Y = /*I.hand.Y +*/ I.H - I.card.W /*- margin / 2*/ - bottomMargin
		} else {
			Y = /*I.hand.Y +*/ 0 // + I.card.W /*- margin / 2*/ - bottomMargin
		}
		for (var i in S[o.pX].hand) {
			if (!C[S[o.pX].hand[i]]) {
				//console.log('!card') ;continue;
			}
			if (C[S[o.pX].hand[i]].params.zona == 'presentation') continue;
			bottomMargin = (Math.ceil((Number(i) + 1) / cardInRow) - 1) * (I.card.W + margin);
			C[S[o.pX].hand[i]].animation({
				X: sideMargin / 2 + (margin + I.card.W) * (Number(i) % cardInRow),
				Y: Y,
				W: I.card.W,
				duration: 50,
				additional: {
					curveMoving: 'Y',
					incline: true
				},
				after: {
					func: (function() {
						var card = C[S[o.pX].hand[i]];
						var id = S[o.pX].hand[i];
						return function() {
							card.changeZone('handPrewiev');
						};
					})()
				}
			});
		}
		Log(-1, 'moveToPreview');
	},
	moveCardToZone : function(args, o) {
		// console.log('>--', args)
		LogI['moveCardToZone'] = 0;
		Log(1, 'moveCardToZone');
		Log(0, 'args', args);
		
		if ( !isZoneSimple(args.from)) {
			if ( isZoneSimple(args.to) ){
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
								} 
							} 
						}
				} );
			}
			else if ( !isZoneSimple(args.from) ) {
			}
		} 
		else if ( isZoneSimple(args.from) ) {
			if ( isZoneSimple(args.to) ) {
				if (args.to != 'stack' &&  args.to != 'mission' && !C[args.card]) {
					AN.moveCardFaceDownToZone(args)
					if (args.from == "mission") {
						AnimationPush({func:function() {
							 updTable();
						}, time:600, name: 'updTeams'});
					}
				} 
				else {
					if (args.from != 'stack' && args.to != 'mission') {
						if (args.to == 'hand' || (args.from == 'hand' && args.to == 'stack')) {
							AN.moveCardToCenter(args); // deck -> hand
						} else {
							AN.moveCardFaceDownToZone(args) // hand -> discard
						}
					}
					if (args.from == 'stack' && args.to == 'chackra') {
						AN.moveCardFaceDownToZone(args)
					}

					AnimationPush({
						func: function() {
							updTable();
						},
						time: 600,
						name: 'updTeams'
					});
				}
			}
			else if ( !isZoneSimple(args.to) ) {
				AN.moveCardToCenter(args);
				//TODO возможно следующую анимацию надо перенести
				//в allback  функцию ждя предыдущей функции
				AnimationPush({func:function() {
					 updTable();
				}, time:600, name: 'updTeams'});
			}
		}
        updAllCount();
		Log(-1, 'moveCardToZone');
	},
	moveCardToCenter : function(args) {
		if ('outCard' in args) {
			var outCard = args.outCard;
		} else {
			if (args.to == 'hand' || args.to == 'discard') {
				var outCard = false;
			} else {
				var outCard = true;
			}
		}
		// console.log('outCard',outCard)
		var X = args.presentation == true ? I.card.W/ 2 : I.table.W / 2 + I.table.Y - I.card.W;

		if (you == args.pX) {
			C[args.card].setZIndex(825);
			var animationArgs = {
				X: X,
				Y: I.table.H / 2 - I.card.W,
				H: I.card.W * 2,
				duration: 820,
				additional: {
					outCard: outCard,
					after: {}
				}
			}
			if (args.afterFunc) {
				animationArgs.additional.after.func = args.afterFunc;
			}
			C[args.card].animation(animationArgs);
		}
		else if (you != args.pX) {
			C[args.card].setZIndex(825);
			var afterAnimationArgs = {
				y: 0,
				deg: 0,
				duration: 410,
				additional: {
					//outCard: outCard,
					after: {}
				}
			};
			if (args.afterFunc) {
				afterAnimationArgs.additional.after.func = args.afterFunc;
			}
			var animationArgs = {
				X: X,
				Y: I.table.H / 2 - I.card.W,
				H: I.card.W * 2,
				y: 1,
				deg: 90,
				duration: 410,
				additional: {
					incline: true,
					after: {
						func: function() {
							C[args.card].setNewParams(Known[Accordance[args.card]]);
							C[args.card].params.incline.y = -1;
							C[args.card].params.incline.deg = 90;
							C[args.card].params.W = I.card.W * 2;
							C[args.card].$id.empty();
							if (args.to == 'hand' || args.to == 'discard') {
								C[args.card].fillAsFaceDown(C[args.card].$id);
								C[args.card].params.faceUp = false;
							} else {
								C[args.card].fillAsFaceUp(C[args.card].$id);
							}

							C[args.card].updateLinks();
							C[args.card].updateMouse();
							C[args.card].animation(afterAnimationArgs);
						}
					}
				}
			}
			C[args.card].animation(animationArgs)
		}
			// AnimationPush({func:function() {
			//	 updTeams();
			// }, time:1200, name: 'updTeams'});
	},
	moveCardFaceDownToZone : function(args) {
		if (!C[args.card]) return false; //перемещение между закрытыми областями
		if (you == args.pX) var z = G.you[args.to]
		else var z = G.opp[args.to];
		var afterAfterFunc = function() {
			C[args.card].animation({
				X: z.X + 4,
				Y: z.Y + 2,
				H: z.H,
				duration: 300,
				additional: {
					fadeIn: true,
					curveMoving: 'Y',
					incline: false,
					after: {
						func: function() {
							// console.log('+++DESTROY+++', args.card)
							C[args.card].destroyCard();
						}
					}
				}
			})
		}
		C[args.card].setZIndex(825);
		C[args.card].params.teamPosition = null;
		C[args.card].removeTeamPower();
		C[args.card].animation( { 
			X: z.X + z.W/2 - I.card.W / 2, 
			Y:  I.H / 3 * (you == args.pX ? 2 : 1)- I.card.W/2,
			duration: 300, additional: { 
				intoCard: true, 
				curveMoving: 'Y', 
				after: { func: function() {
					setTimeout(
						afterAfterFunc
						,200
					)
				} 
			}
		}});
	},
	damage : function(cardID, o) {
		C[cardID].effect({type:'simple', target:'one', pic:"public/pics/damage.png"})
	},
	reward : function(cardID, o) {
		if (C[cardID]) {
			C[cardID].effect({type:'simple', target:'one', pic:"public/pics/reward.png"})
		} else {
			console.log('ERR C[cardID] is undefined ')
		}
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
	bigBanner: function(o) {
		var sprite = $('<div />', {})
			.css('width', I.scroll.W)
			.css('height', I.scroll.H)
			.css('top', I.scroll.Y)
			.css('left', I.scroll.X)
			.css('position', 'absolute')
			.css('opacity', 0)
			.append($('<img />', {
				src: o.bigBannerPics,
				width: I.scroll.W,
				height: I.scroll.H,
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
	hideNoir : function(o){
		Context.workingUnit = null;
		Context.clickAction = null;
		if (o.condidateCount) {
			for (var i in o.condidateCount) {
				if (C[o.condidateCount[i]]) {
					C[o.condidateCount[i]].setZIndex(200);
				}
			}
		}
		$( '#noir' ).css( 'width', 0 ).css( 'height', 0 ).html( '' );
		AN.stop = false;
		AnimationNext();
	},
	showCostBar : function(args, o) {

		var elementSize = Math.round(I.card.W / 3)

		var barWrap = $('<div />', {'class' : 'scrollWrap', 'id':'costBar'} )

		var bar = $('<div />', {'class' : 'scroll'} )

		var barCheck = $('<div />', {'class' : 'scrollCards'} )

		var barConteiner = $('<div />',{'id':'costBarConteiner'});

		barConteiner.css('height', elementSize + 2)
		
		if(!('playingJutsu' in Meta)) Meta.playingJutsu = []
		
		if (args.card) {
			var jutsu = o.Known[o.Accordance[args.card]];
			var needenCost = jutsu.cost;
		} 
		if (args.cost) {
			var needenCost = args.cost;
		}
		for (var i in needenCost) {
			Meta.playingJutsu.push([])
			for (var j in needenCost[i]) {
				Meta.playingJutsu[i].push({element:needenCost[i][j], card: null})
			}
		}
		barCheck.append(barConteiner)
		bar.append(barCheck);
		barWrap.append(bar);
        H.animate.append(barWrap);


		AN.updCostBar(Meta.playingJutsu )
	},
	updCostBar : function(playingJutsu) {


		var elementSize = Math.round(I.card.W / 3)

		var barConteiner = $('#costBarConteiner')
		barConteiner.empty();
		barConteiner.width(0)

		for (var i in playingJutsu) {
			for (var j in playingJutsu[i]) {

				if (barConteiner.width()) {
					barConteiner.css('width', barConteiner.width() + 9)
				}

				var classCircle = 'jutsuCost ' + 'jutsuCost'+ playingJutsu[i][j].element;
				if (playingJutsu[i][j].card != null) {
					classCircle += ' payd';
				}
				console.log(playingJutsu[i][j])
				barConteiner.append($('<div />', {
					'class' : classCircle
				})
					.css('width', elementSize)
					.css('height', elementSize)
				)
				barConteiner.css('width', barConteiner.width() + (elementSize + 2))
			}
		}
	},
	/**
	 * [description]
	 * @param  {[type]} args {
	 *                       	cardLeft : idCard1,
	 *                       	cardRight: idCard2,
	 *                       	choseLeftText : 'txt',
	 *                       	choseRigthText: 'txt'
	 *                       }
	 * @return {[type]}      [description]
	 */
	'selectFromTwo' : function(args) {
		var cellSize = I.H / 5;

		C[args.card1].animation({
			X:I.W / 2 - 2.5 * cellSize, Y:cellSize, W:cellSize*2, /*deg:30, y:1, x:0.5, additional: {incline:true}*/
		})
		C[args.card2].animation({
			X:I.W / 2 + 0.5 * cellSize, Y:cellSize, W:cellSize*2, /*deg:30, y:-1, x:0.5, additional: {incline:true}*/
		})
		var $text1 = $('<div />', {
				'text': args.text1 || ''
			})
			.css('width', 2 * cellSize)
			.css('height', cellSize)
			.css('position', 'absolute')
			.css('top', cellSize * 3.5)
			.css('left', I.W / 2 - 2.5 * cellSize)

		var $text2 = $('<div />', {
				'text': args.text2 || ''
			})
			.css('width', 2 * cellSize)
			.css('height', cellSize)
			.css('position', 'absolute')
			.css('top', cellSize * 3.5)
			.css('left', I.W / 2 + 0.5 * cellSize)

		$('#noir').append($text1)
		$('#noir').append($text2)

		$text1.animate({opacity:1},500)
		$text2.animate({opacity:1},500)

	},
	'selectFromThree' : function(args) {
		var cellSize = I.H / 10;

		var $text1 = $('<div />', {
				'text': args.text1 || '',
				'class' : 'styledButton',
				'click' : args.func1 || function(){}
			})
			.css('width', 2 * cellSize)
			.css('position', 'absolute')
			.css('top', cellSize * 3.5)
			.css('left', I.W / 2 - 4 * cellSize)

		var $text2 = $('<div />', {
				'text': args.text2 || '',
				'class' : 'styledButton',
				'click' : args.func2 || function(){}
			})
			.css('width', 2 * cellSize)
			.css('position', 'absolute')
			.css('top', cellSize * 3.5)
			.css('left', I.W / 2 - cellSize)

		var $text3 = $('<div />', {
				'text': args.text3 || '',
				'class' : 'styledButton',
				'click' : args.func3 || function(){}
			})
			.css('width', 2 * cellSize)
			.css('position', 'absolute')
			.css('top', cellSize * 3.5)
			.css('left', I.W / 2 + 2 * cellSize)

		$('#noir').append($text1)
		$('#noir').append($text2)
		$('#noir').append($text3)

		$text1.animate({opacity:1},500)
		$text2.animate({opacity:1},500)
		$text3.animate({opacity:1},500)

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
			$( '#noir' ).css( 'width', I.W ).css( 'height', I.H ).html( 'Выберите нового лидера для команды' );
			Context.workingUnit = 'card';
			Context.clickAction = function( card ) {				
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
		},
		discardExcess : function(args, o) {
			AN.stop = true;
			if (!('discardExcess' in Answers)) Answers.discardExcess = [];
			var condidateCount = [];
			$( '#noir' ).css( 'width', I.W ).css( 'height', I.H ).html( 'Сбросьте картs с руки до 6.' ); 
			AN.moveToPreview( { pX: args.pX } );
			Card.moveToPreviewToHandBlocker = true;

			var condidateCount = [];
			for (var i in S[args.pX].hand) {
				var cardId = S[args.pX].hand[i];
				if (true) {
					condidateCount.push(cardId);
					C[cardId].setZIndex(1202);
				}
			}

			Context.workingUnit = 'card';
			Context.clickAction = function( card ) {
				var change = false;
				for (var i in Answers.discardExcess) {
					if (Answers.discardExcess[i].card == card.id) {
						change = true;
						C[card.id].select(false);
						Answers.discardExcess.splice(i,1);
						console.log( AN.preStack.count, Animations.length)
						AnimationPush({func:function() {
							AN.Questions[args.question](args, getUniversalObject());
						}, time:1200, name: 'Questions - ' + args.question });
						AnimationPush({func:function() {
							AN.Questions[args.question](args, getUniversalObject());
						}, time:1200, name: 'Questions - ' + args.question });

						console.log( AN.preStack.count, Animations.length)
						AN.preStack.count++;
						Card.moveToPreviewToHandBlocker = true;
						break;
					}
				}
				if (!change) {
					Answers.discardExcess.push( {
						pX   : you,
						card : card.id,
					});
					C[card.id].select(true);
					AN.preStack.countDown()
					Card.moveToPreviewToHandBlocker = false;
				}
				AN.hideNoir({ condidateCount:condidateCount });
			}
		},
		discardCardFromHand : function(args, o) {
			AN.stop = true;
			if (!('discardCardFromHand' in Answers)) Answers.discardCardFromHand = [];
			var condidateCount = [];
			$( '#noir' ).css( 'width', I.W ).css( 'height', I.H ).html( 'Сбросьте картs с руки до 6.' ); 
			AN.moveToPreview( { pX: args.pX } );
			Card.moveToPreviewToHandBlocker = true;

			var condidateCount = [];
			for (var i in S[args.pX].hand) {
				var cardId = S[args.pX].hand[i];
				if (true) {
					condidateCount.push(cardId);
					C[cardId].setZIndex(1202);
				}
			}

			if (!condidateCount.length) {
				Card.moveToPreviewToHandBlocker = false;
				AN.hideNoir({ condidateCount:condidateCount });
				AN.preStack.countDown();
				return;
			}

			Context.workingUnit = 'card';
			Context.clickAction = function( card ) {
				Answers.discardCardFromHand.push( {
					pX   : you,
					card : card.id,
				});
				C[card.id].select(true);
				Card.moveToPreviewToHandBlocker = false;
				AN.hideNoir({ condidateCount:condidateCount });
				AN.preStack.countDown();
			}
		},
		selectUserForJutsu : function(args, o) {
			console.log('ARGS', args)
			var jutsu = Known[Accordance[args.card]];
			AN.stop = true;
			var condidateCount = [];

			$( '#noir' ).css( 'width', I.W ).css( 'height', I.H ).html( 'Выберите исполльзующнго для техники.' );
			
			condidateCount = Can.areAvailableUsers(args, o);
			for (var i in condidateCount) {
				C[condidateCount[i]].setZIndex(1202);
			}

			Context.workingUnit = 'card';
			Context.clickAction = function( card ) {
				var itis = false;
				for (var i in Answers.selectUserAndTargetForJutsu) {
					if (Answers.selectUserAndTargetForJutsu[i].card == args.card) {
						if (!('target' in Answers.selectUserAndTargetForJutsu[i])) {
							Answers.selectUserAndTargetForJutsu[i].user = []
						}
						Answers.selectUserAndTargetForJutsu[i].user.push(card.id);
						itis = true;
						break;
					}
				}
				if (!itis) {
					if (!('selectUserAndTargetForJutsu' in Answers)) Answers.selectUserAndTargetForJutsu = [];
					Answers.selectUserAndTargetForJutsu.push({
						card: args.card, user : [card.id], pX:you, cause:'playJutsu',from:'hand', to:'stack'
					})
				}
				AN.hideNoir({ condidateCount:condidateCount });
			}
		},

		selectTargetsForJutsu : function(args, o) {
			if (!('selectUserAndTargetForJutsu' in Answers)) Answers.selectUserAndTargetForJutsu = [];

			var jutsu = Known[Accordance[args.card]];
			for (var i in jutsu.target) {

				AN.preStack.count++;
				args.targetKey = i;
				AnimationPush({func:function() {
					AN.Questions.selectOneTargetForJutsu(args, o);
				}, time:1000, name: 'Questions - selectTargetsForJutsu'});
			}
			AN.preStack.countDown();
		},

		selectOneTargetForJutsu : function(args, o) {
			var jutsu = Known[Accordance[args.card]];
			var target = jutsu.target[args.targetKey];
			AN.stop = true;
			var condidateCount = [];
			$( '#noir' ).css( 'width', I.table.W ).css( 'height', I.table.H ).html( 'Выберите цель для техники.' ); 


			Context.workingUnit = 'card';
			if (typeof(jutsu.target[args.targetKey]) == 'string') {
				if (jutsu.target[args.targetKey] == 'user' ) {

				}
			} 
			else {
				AN.preStack.count++;
				condidateCount = Can.areAvailableTargets(args, o);
				for (var i in condidateCount) {
					C[condidateCount[i]].setZIndex(1202);
				}
				AN.preStack.countDown();
				Context.clickAction = function( card ) {
					var itis = false;
					for (var i in Answers.selectUserAndTargetForJutsu) {
						if (Answers.selectUserAndTargetForJutsu[i].card == args.card) {
							if (!('target' in Answers.selectUserAndTargetForJutsu[i])) {
								Answers.selectUserAndTargetForJutsu[i].target = []
							}
							Answers.selectUserAndTargetForJutsu[i].target.push(card.id);
							itis = true;
							break;
						}
					}
					if (!itis) {
						if (!('selectUserAndTargetForJutsu' in Answers)) Answers.selectUserAndTargetForJutsu = [];
						Answers.selectUserAndTargetForJutsu.push({
							card: args.card, target : [card.id], pX:you, cause:'playJutsu',from:'hand', to:'stack'
						})
					}
					AN.hideNoir({ condidateCount:condidateCount });
					AN.preStack.countDown();
				}
			}
		},

		'selectChackra' : function(args, o) {
			btnArea('chackra','you');
			AN.showCostBar(args, o);

			AnimationPush({func:function() {
				AN.Questions.payChackra((function(args){return args})(args), getUniversalObject());
			}, time:1200, name: 'Questions - payChackra'  });
		},

		'payChackra' : function(args, o) {
			AN.stop = true;
			var condidateCount = [];

			Context.workingUnit = 'card';
			Context.clickAction = function( card ) {

				var chackra = o.Known[o.Accordance[card.id]].elements.split()

				toNextElementInCost:
				for (var i in Meta.playingJutsu) {
					var isPaid = false;
					for (var j in Meta.playingJutsu[i]) {
						if (Meta.playingJutsu[i][j].card == card.id) {
							Meta.playingJutsu[i][j].card = null;
							card.select(false);
							isPaid  = true;
						}
					}
					if (!isPaid) {
						for (var j in Meta.playingJutsu[i]) {
							for (var k in chackra) {
								if (Meta.playingJutsu[i][j].card == null
									&& (Meta.playingJutsu[i][j].element == chackra[k]
										|| Meta.playingJutsu[i][j].element == '1'
										|| Meta.playingJutsu[i][j].element == 'X' )) 
								{
									card.select(true);
									isPaid  = true;
									//вот где-то тут надо добавить добавление выбранной карты в цену техники в виде массива для оплаты значения X
									Meta.playingJutsu[i][j].card = card.id;
									continue toNextElementInCost;
								}
							}
						}
					}
				}
				AN.updCostBar(Meta.playingJutsu)

				var allIsPaid = true;
				var paidForJutsu = [];
				for (var i in Meta.playingJutsu) {
					for (var j in Meta.playingJutsu[i]) {
						if (Meta.playingJutsu[i][j].card == null){
							allIsPaid = false;
						} else {
							paidForJutsu.push(Meta.playingJutsu[i][j].card)
						}
					}
				}

				if (allIsPaid) {
					$('#costBar').remove();
					Meta.playingJutsu = [];
					btnArea('chackra','you');
					if (!('selectUserAndTargetForJutsu' in Answers)) Answers.selectUserAndTargetForJutsu = [];
					Answers.selectUserAndTargetForJutsu.push({
						card: args.card, chackra: paidForJutsu,  pX:you, cause:'playJutsu',from:'hand', to:'stack'
					})
					
					AN.stop = false;
					AnimationNext();
				}
			}
		},

		'selectHandCost' : function(args, o) {
			if (!('primal' in Answers)) Answers.primal = {};
			if (!('selectHandCost' in Answers.primal)) Answers.primal.selectHandCost = [];
			if (o.Known[o.Accordance[args.card]].hc == 0) {
				Answers.primal.selectHandCost.push({
					pX   : you,
					card : args.card,
					handCost : []
				});
				AN.preStack.countDown();
				return;
			}
			AN.stop = true;
			var condidateCount = [];
			$( '#noir' ).css( 'width', I.W ).css( 'height', I.H ).html( 'Выберите карты для оплаты цены руки.' ); 
			AN.moveToPreview( { pX: args.pX } );
			Card.moveToPreviewToHandBlocker = true;

			var condidateCount = [];
			for (var i in S[args.pX].hand) {
				var cardId = S[args.pX].hand[i];
				if (cardId != args.card) {
					condidateCount.push(cardId);
					C[cardId].setZIndex(1202);
				}
			}

			Context.workingUnit = 'card';
			Context.clickAction = function( card ) {
				var change = false;
				Answers.primal.selectHandCost.push({
					pX   : you,
					card : args.card,
					handCost : [card.id]
				});
				C[card.id].$mouse.mouseout();
				AN.preStack.countDown()
				Card.moveToPreviewToHandBlocker = false;
				AN.hideNoir({ condidateCount:condidateCount });
			}

		}
	},
	preStack : {
		count : 0,
		countDown : function() {
			
			//console.log('stackPrepArfterIsRun = ',stackPrepArfterIsRun)
			AN.preStack.count--;
			// console.log('countDown',AN.preStack.count)
			if (AN.preStack.count < 1) {
				if (stackPrepBeforIsRun ) {
					stackPrepBeforIsRun = false;
					// console.log('b')
					applyStackNormal();
				}
				else if (stackPrepArfterIsRun ) {
					stackPrepArfterIsRun = false;
					// console.log('a')
					applyStackAfter();
				}
				else {
					// console.log('Answers', Answers)
					//
					// console.log('t2 = ' + (Date.now() - updactTimeStart))
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
			setTimeout(AN.preStack.countDown,1000)
		},
		'afterQuestion' : function(args) {
			//console.log('afterQuestion', args)
			console.log(args, you)
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
			setTimeout(AN.preStack.countDown,550);
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
			// console.log(args);
			Actions.retrunTeamToVillage(args, getUniversalObject());
		},
		'adNewTurn' : function(args) {
			console.log(args, getUniversalObject());
			AN.uturn(args, getUniversalObject())
			setTimeout (AN.preStack.countDown, 1210)
		},
		'drawCard' : function(args) {
			// console.log(args);
			Actions['DrawXcards'](args, getUniversalObject())
		},
		'putCardInPlay' : function(args) {
			if (args.pX == you) {
				AnimationPush({func:function() {
					AN.Questions.selectHandCost(args, getUniversalObject());
				}, time:1000, name: 'Questions - selectHandCost'});
			}
			else {
				AN.preStack.countDown();
			}
		},
		'playJutsu' : function(args) {
			if (args.pX == you) {
				AnimationPush({func:function() {
					AN.Questions.selectChackra(args, getUniversalObject());
				}, time:1000, name: 'Questions - selectChackra'});
				AnimationPush({func:function() {
					AN.Questions.selectUserForJutsu(args, getUniversalObject());
				}, time:1000, name: 'Questions - selectUserForJutsu'});
				AnimationPush({func:function() {
					AN.Questions.selectTargetsForJutsu(args, getUniversalObject());
				}, time:5, name: 'Questions - selectTargetsForJutsu'});
			}
			else {
				AN.preStack.countDown();
			}
		},
		'charge' : function(args) {
			Actions.moveCardToZone(args, getUniversalObject())
			setTimeout(AN.preStack.countDown,1000)
		},
		'winner' : function(args) {
			Actions.winner(args, getUniversalObject())
		},
		'winner' : function(args) {
			Actions.winner(args, getUniversalObject())
			Actions.winner(args, getUniversalObject())
		},
		'startDrawHand' : function(args) {
			console.log('startDrawHand')
			AN.preStack.countDown();
		},
		'discardExcess' : function(args) {
			Actions.discardExcess(args, getUniversalObject());
		},
		'addJutsuToStack' : function(args) {
			Actions.addJutsuToStack(args, getUniversalObject());
			setTimeout(AN.preStack.countDown,760)
		},
		'prepareStartStack' : function(args) {
			Actions.prepareStartStack(args, getUniversalObject());
			AN.preStack.countDown();
		},
		'resolveJutsuInStack' : function(args) {
			Actions.resolveJutsuInStack(args, getUniversalObject());
		},
		'increaseNinjaPower' : function(args){
			Actions.increaseNinjaPower(args, getUniversalObject());
		},
		'clearAtEndOfTurnEffect' : function(args) {
			Actions.clearAtEndOfTurnEffect(args, getUniversalObject());
			AN.preStack.countDown();
		},
		'prepareEffect' : function(args) {
			// console.log('---!--- prepareEffect')
			// console.log(args);
			var question = 'question' + (args.step || '');
				if (args.effectType == 'trigger') {
					Known[Accordance[args.card]].effect.trigger[args.trigger][args.effectKey][question](args, getUniversalObject());
				}
				if (args.effectType == 'activate') {
					Known[Accordance[args.card]].effect.activate[args.effectKey][question](args, getUniversalObject());
				}
		},
		'adEndOfTurn' : function() {
			AN.preStack.countDown();
		},
		'adJutsu' : function() {
			AN.preStack.countDown();
		},
		'discardCardFromHand' : function() {
			if (args.pX == you) {
				AnimationPush({func:function() {
					AN.Questions.discardCardFromHand(args, getUniversalObject());
				}, time:1000, name: 'Questions - discardCardFromHand'});
			}
			else {
				AN.preStack.countDown();
			}
		},
		'removePermanentCounter' : function(args) {
			Actions.removePermanentCounter(args, getUniversalObject());
		},
		'discardMission' : function(args) {
			Actions.discardMission(args, getUniversalObject());
			setTimeout(AN.preStack.countDown,760)
		},
		'adMoveCardToZone' : function(args) {
			AN.preStack.countDown();
		},
		'adHealingNinja' : function(args) {
			AN.preStack.countDown();
		},
		'healingNinja' : function(args) {
			Actions.healingNinja(args, getUniversalObject());
			setTimeout(AN.preStack.countDown,1500)
		},
		'adRemoveCardFromGame' : function(args) {
			AN.preStack.countDown();
		},
		'adShuffle' : function(args) {
			AN.preStack.countDown();
		},
		'shuffle' : function(args) {
			AN.preStack.countDown();
		},
		'adCoin' : function (args) {
			AN.preStack.countDown();
		},
		'coin' : function (args) {
			Actions.coin(args, getUniversalObject());
			setTimeout(AN.preStack.countDown,1000)
		},
		'adInjureTarget' : function(args) {
			AN.preStack.countDown();
		},
		'injureTarget' : function(args) {
			Actions.injureTarget(args, getUniversalObject());
			setTimeout(AN.preStack.countDown,500)
		},
		'removeCardFromGame' : function(args) {
			Actions.removeCardFromGame(args, getUniversalObject());
			setTimeout(AN.preStack.countDown,500)
		},
	}
}
