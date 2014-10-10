var CardBase = {
    "n1092": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 2,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "n1092",
        "number": "n1092",
        "elements": "W",
        "name": "Kankuro",
        "effectText" : "",
        "effect" : {}
    },
    "n847": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 0,
        "si": 0,
        "img": "n847",
        "number": "n847",
        "elements": "W",
        "name": "Mizuki (Childhood)",
        "effectText" : {
        	effectName : "Премечивый нрав",
        	"effects" : [
        		{"effect":"Когда этот ниндзя сбрасываеться в результате подсчета, оппонент перемещает случайную карту из своей руки наверх колоды.",
        		"valid" : true}
        	]
        },
        "effect" : {
        	"trigger" : {
        		"moveCardToZone" : [{
        			"condition" : function(args, o) {
        				if (o.Known[args.card].number == 'n847'
        					&& (args.from == "block"
        						|| args.from == "attack")
        					&& args.cause == "resultOfshutdown"
        				) {
        					return true;
        				}
        				return false;
        			},
        			"result" : function(result, args, o) {
        				var opp = args.pX == 'pA' ? 'pB' : 'pA' ;
        				if (!o.S[opp].hand.length) return result;
        				if (!('toStack' in result)) result.toStack = {};
        				if (!('cardTriggerEffect' in result.toStack)) result.toStack.moveCardToZone = [];
        				
        				console.log(o.S[opp].hand)

        				var card = o.S[opp].hand[Math.round(Math.random() * (o.S[opp].hand.length - 1) )];
        				result.toStack.moveCardToZone.push({
							pX  : opp,
							card  : card ,
							cause  : 'effectOfcard' ,
							from  : 'hand' ,
							to  : 'deck' ,
							team  : null,
							options : {moveTo : 'top'}
        				});


        				return result;
					}
        		}]
        	}
        }
    },
    "n602": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 2,
        "sh": 0,
        "ai": 1,
        "si": 0,
        "img": "n602",
        "number": "n602",
        "elements": "W",
        "name": "Matsuri",
        "effectText" : "",
        "effect" : {}
    },
    "n1474": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 0,
        "sh": 2,
        "ai": 0,
        "si": 1,
        "img": "n1474",
        "number": "n1474",
        "elements": "W",
        "name": "Epidemic Prevention Officer",
        "effectText" : "",
        "effect" : {}
    },
    "n1321": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 3,
        "ai": 2,
        "si": 2,
        "img": "n1321",
        "number": "n1321",
        "elements": "W",
        "name": "Crow",
        "effectText" : "",
        "effect" : {}
    },
    "n1319": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 0,
        "sh": 2,
        "ai": 0,
        "si": 0,
        "img": "n1319",
        "number": "n1319",
        "elements": "W",
        "name": "Yaoki",
        "effectText" : "",
        "effect" : {}
    },
    "nus025": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 0,
        "sh": 2,
        "ai": 0,
        "si": 0,
        "img": "nus025",
        "number": "nus025",
        "elements": "W",
        "name": "Temari",
        "effectText" : "",
        "effect" : {}
    },
    "n1322": {
        "type": "N",
        "ec": 1,
        "hc": 0,
        "ah": 0,
        "sh": 3,
        "ai": 0,
        "si": 1,
        "img": "n1322",
        "number": "n1322",
        "elements": "W",
        "name": "Black Ant",
        "effectText" : "",
        "effect" : {}
    },
    "n1086": {
        "type": "N",
        "ec": 1,
        "hc": 0,
        "ah": 0,
        "sh": 3,
        "ai": 0,
        "si": 1,
        "img": "n1086",
        "number": "n1086",
        "elements": "W",
        "name": "Crow",
        "effectText" : "",
        "effect" : {}
    },
    "n180": {
        "type": "N",
        "ec": 2,
        "hc": 0,
        "ah": 3,
        "sh": 2,
        "ai": 1,
        "si": 1,
        "img": "n180",
        "number": "n180",
        "elements": "W",
        "name": "Yashamaru",
        "effectText" : "",
        "effect" : {}
    },
    "n1325": {
        "type": "N",
        "ec": 2,
        "hc": 0,
        "ah": 1,
        "sh": 3,
        "ai": 1,
        "si": 3,
        "img": "n1325",
        "number": "n1325",
        "elements": "W",
        "name": "Salamander",
        "effectText" : "",
        "effect" : {}
    },
    "n1267": {
        "type": "N",
        "ec": 2,
        "hc": 0,
        "ah": 5,
        "sh": 1,
        "ai": 5,
        "si": 0,
        "img": "n1267",
        "number": "n1267",
        "elements": "W",
        "name": "Gaara of the Desert",
        "effectText" : "",
        "effect" : {}
    },
    "n1418": {
        "type": "N",
        "ec": 4,
        "hc": 0,
        "ah": 3,
        "sh": 3,
        "ai": 3,
        "si": 3,
        "img": "n1418",
        "number": "n1418",
        "elements": "W",
        "name": "Chiyo",
        "effectText" : "",
        "effect" : {}
    },
    "n1481": {
        "type": "N",
        "ec": 4,
        "hc": 0,
        "ah": 3,
        "sh": 3,
        "ai": 3,
        "si": 2,
        "img": "n1481",
        "number": "n1481",
        "elements": "WE",
        "name": "Kankuro",
        "effectText" : "",
        "effect" : {}
    },
    "n1484": {
        "type": "N",
        "ec": 5,
        "hc": 1,
        "ah": 5,
        "sh": 4,
        "ai": 0,
        "si": 3,
        "img": "n1484",
        "number": "n1484",
        "elements": "W",
        "name": "Temari",
        "effectText" : "",
        "effect" : {}
    },
    "n1420": {
        "type": "N",
        "ec": 5,
        "hc": 1,
        "ah": 5,
        "sh": 4,
        "ai": 2,
        "si": 3,
        "img": "n1420",
        "number": "n1420",
        "elements": "W",
        "name": "Sasori",
        "effectText" : "",
        "effect" : {}
    },
    "n130": {
        "type": "N",
        "ec": 5,
        "hc": 1,
        "ah": 5,
        "sh": 1,
        "ai": 3,
        "si": 1,
        "img": "n130",
        "number": "n130",
        "elements": "W",
        "name": "Баки",
        "effectText" : "",
        "effect" : {}
    },
    "n483": {
        "type": "N",
        "ec": 5,
        "hc": 1,
        "ah": 6,
        "sh": 2,
        "ai": 4,
        "si": 2,
        "img": "n483",
        "number": "n483",
        "elements": "W",
        "name": "Gaara of the Desert",
        "effectText" : "",
        "effect" : {}
    },
    "j001": {
        "type": "J",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "j001",
        "number": "j001",
        "elements": "EF",
        "name": "Кунай",
        "cost" : [['W','W', '1']],
        "costText" : [['WW1']],
        "effectText" : "",
        "requirement" : function(card,o) {
            return true;
        },
        "target" : [{player:'you', zone: 'battle', func: function() {
            return true;
        }}],
        "effect" : {
            "trigger" : {
                "resolve" : [
                    {
                        func : function(result, args, o) {
                            if (!('toStack' in  result)) result.toStack = {};
                            if (!('increaseNinjaPower' in  result.toStack)) result.toStack.increaseNinjaPower = [];
                            console.log('args'.red)
                            console.log(args)
                            result.toStack.increaseNinjaPower.push({
                                card : args.target[0],
                                attack : 5,
                                support : 2,                        
                            });
                            return result;
                        }
                    }
                ]
            }
        }
    },
    "n1427": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 0,
        "si": 0,
        "img": "n1427",
        "number": "n1427",
        "elements": "E",
        "name": "Choji Akimichi",
        "effectText" : "",
        "effect" : {}
    },
    "n1423": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "n1423",
        "number": "n1423",
        "elements": "E",
        "name": "Neji Hyuga",
        "effectText" : "",
        "effect" : {}
    },
    "n699": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 0,
        "sh": 0,
        "ai": 0,
        "si": 0,
        "img": "n699",
        "number": "n699",
        "elements": "E",
        "name": "Koharu Utatane (Childhood)",
        "effectText" : "",
        "effect" : {}
    },
    "n700": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 0,
        "sh": 0,
        "ai": 0,
        "si": 0,
        "img": "n700",
        "number": "n700",
        "elements": "E",
        "name": "Homura Mitomon (Childhood)",
        "effectText" : "",
        "effect" : {}
    },
    "n1272": {
        "type": "N",
        "ec": 0,
        "hc": 0,
        "ah": 0,
        "sh": 2,
        "ai": 0,
        "si": 0,
        "img": "n1272",
        "number": "n1272",
        "elements": "E",
        "name": "Shiho",
        "effectText" : "",
        "effect" : {}
    },
    "nus014": {
        "type": "N",
        "ec": 1,
        "hc": 0,
        "ah": 0,
        "sh": 2,
        "ai": 0,
        "si": 0,
        "img": "nus014",
        "number": "nus014",
        "elements": "E",
        "name": "Shikamaru Nara",
        "effectText" : "",
        "effect" : {}
    },
    "n348": {
        "type": "N",
        "ec": 1,
        "hc": 0,
        "ah": 1,
        "sh": 1,
        "ai": 1,
        "si": 1,
        "img": "n348",
        "number": "n348",
        "elements": "E",
        "name": "Tenten",
        "effectText" : "",
        "effect" : {}
    },
    "n724": {
        "type": "N",
        "ec": 1,
        "hc": 0,
        "ah": 0,
        "sh": 2,
        "ai": 0,
        "si": 1,
        "img": "n724",
        "number": "n724",
        "elements": "E",
        "name": "Yoshino Nara",
        "effectText" : "",
        "effect" : {}
    },
    "n1429": {
        "type": "N",
        "ec": 2,
        "hc": 0,
        "ah": 2,
        "sh": 2,
        "ai": 1,
        "si": 2,
        "img": "n1429",
        "number": "n1429",
        "elements": "E",
        "name": "Hinata Hyuga",
        "effectText" : "",
        "effect" : {}
    },
    "n1366": {
        "type": "N",
        "ec": 3,
        "hc": 0,
        "ah": 2,
        "sh": 2,
        "ai": 1,
        "si": 2,
        "img": "n1366",
        "number": "n1366",
        "elements": "E",
        "name": "Foo",
        "effectText" : "",
        "effect" : {}
    },
    "n823": {
        "type": "N",
        "ec": 4,
        "hc": 0,
        "ah": 6,
        "sh": 2,
        "ai": 2,
        "si": 0,
        "img": "n823",
        "number": "n823",
        "elements": "E",
        "name": "Asuma Sarutobi",
        "effectText" : "",
        "effect" : {}
    },
    "n1279": {
        "type": "N",
        "ec": 4,
        "hc": 0,
        "ah": 4,
        "sh": 3,
        "ai": 1,
        "si": 3,
        "img": "n1279",
        "number": "n1279",
        "elements": "E",
        "name": "Inoichi Yamanaka",
        "effectText" : "",
        "effect" : {}
    },
    "n515": {
        "type": "N",
        "ec": 4,
        "hc": 0,
        "ah": 5,
        "sh": 3,
        "ai": 0,
        "si": 0,
        "img": "n515",
        "number": "n515",
        "elements": "E",
        "name": "Shikaku Nara",
        "effectText" : "",
        "effect" : {}
    },
    "n516": {
        "type": "N",
        "ec": 4,
        "hc": 0,
        "ah": 6,
        "sh": 0,
        "ai": 0,
        "si": 0,
        "img": "n516",
        "number": "n516",
        "elements": "E",
        "name": "Choza Akimichi",
        "effectText" : "",
        "effect" : {}
    },
    "n589": {
        "type": "N",
        "ec": 4,
        "hc": 0,
        "ah": 6,
        "sh": 2,
        "ai": 2,
        "si": 0,
        "img": "n589",
        "number": "n589",
        "elements": "EF",
        "name": "Sasuke Uchiha",
        "effectText" : "",
        "effect" : {}
    },
    "pr046": {
        "type": "N",
        "ec": 5,
        "hc": 1,
        "ah": 5,
        "sh": 4,
        "ai": 3,
        "si": 2,
        "img": "pr046",
        "number": "pr046",
        "elements": "EF",
        "name": "Yamato",
        "effectText" : "",
        "effect" : {}
    },
    "n844": {
        "type": "N",
        "ec": 5,
        "hc": 1,
        "ah": 7,
        "sh": 1,
        "ai": 4,
        "si": 0,
        "img": "n844",
        "number": "n844",
        "elements": "EF",
        "name": "Yugito Ni'i",
        "effectText" : "",
        "effect" : {}
    },
    "m466": {
        "type": "M",
        "ec": 1,
        "hc": 1,
        "img": "m466",
        "number": "m466",
        "elements": "E",
        "name": "Lunchbox",
        "effectText" : {
            "effects" : [
                {"effect":"Пстоянная 2"},
                {"effect":"Когда эффект это мисси применяеться, возьмите 1 карту."},
                {"effect":"Ваши ниндзя получают +1/+1."}
            ]
        },
        "effect" : {
            "permanent" : 2,
            "trigger" : {
                "resolve" : [
                    {
                        "func" : function(result, args, o){
                            console.log(args)
                            if (!('toStack' in result)) result.toStack = {};

                            if (!('drawCard' in result.toStack)) result.toStack.drawCard = [];
                            result.toStack.drawCard.push({
                                player:  args.owner,
                                numberOfCard: 1, 
                                drawCardCause: 'cardeffect'
                            });

                            if (!('applyUpd' in result.toStack)) result.toStack.applyUpd = [];
                            result.toStack.applyUpd.push({
                                forPlayer: args.owner, 
                                cards : [o.S[args.owner].deck[0], o.S[args.owner].deck[1]]
                            })

                            return result;
                        }    
                    }
                ]
            },
            "static" : {                // подконтрольная облась powerNinja
                "powerNinja" : [
                    {    
                        "condition" : function(args, o) {
                            return Actions.cardPath({
                                card:args.card, 
                                path:{
                                    players:[o.Known[o.Accordance[args.self]].owner],
                                    zones: ['village','attack', 'block']
                                }},o);
                        },
                        "conditionSelf" : function(args, o) {
                            return Actions.cardPath({
                                card:args.self, 
                                path:{
                                    players:[o.Known[o.Accordance[args.self]].owner],
                                    zones: ['mission']
                                }},o);
                        },
                        "powerMod" : {
                            attack : 1,
                            support : 1,                        
                        }
                    }
                ]
            }
        }
    },
    "m589": {
        "type": "M",
        "ec": 2,
        "hc": 1,
        "img": "m589",
        "number": "m589",
        "elements": "E",
        "name": "BBQ House",
        "effectText" : {
            "effects" : [
                {"effect":"Пстоянная 3"},
                {"effect":"В конце каждого хода, в котором ваш оппонент выигрываете или получает 1 или более боевых наград, он должен сбросить 1 карт из своей руки."}
            ]
        },
        "effect" : {}
    },
    "m673": {
        "type": "M",
        "ec": 1,
        "hc": 1,
        "img": "m673",
        "number": "m673",
        "elements": "E",
        "name": "Student and Sensei",
        "effectText" : {
            "effects" : [
                {"effect":"Ваш оппонент получает 1 боевую награду. В этом случае возьмите 2 карты."}
            ]
        },
        "effect" : {
            "trigger" : {
                "resolve" : [
                    {
                        "func" : function(result, args, o){
                            console.log(args)
                            if (!('toStack' in result)) result.toStack = {};


                            if (!('givingReward' in result.toStack)) result.toStack.givingReward = [];
                            result.toStack.givingReward.push({
                                pX: args.owner == 'pA' ? 'pB' : 'pA',  
                                zone: 'stack', 
                                card: args.card, 
                                rewardsCount : 1, 
                                causeOfReward : 'effectOfcard'
                            })

                            if (!('drawCard' in result.toStack)) result.toStack.drawCard = [];
                            result.toStack.drawCard.push({
                                player:  args.owner,
                                numberOfCard: 2, 
                                drawCardCause: 'cardeffect'
                            });

                            if (!('applyUpd' in result.toStack)) result.toStack.applyUpd = [];
                            result.toStack.applyUpd.push({
                                forPlayer: args.owner, 
                                cards : [o.S[args.owner].deck[0], o.S[args.owner].deck[1]]
                            })

                            return result;
                        }
                    }
                ]
            }
        }
    },
    "m777": {
        "type": "M",
        "ec": 3,
        "hc": 1,
        "img": "m777",
        "number": "m777",
        "elements": "E",
        "name": "After the battle",
        "effectText" : {
            "effects" : [
                {"effect":"Сбросьте карту, в этом случае возьмите 3 карты."}
            ]
        },
        "effect" : {
            "trigger" : {
                "resolve" : [
                    {
                        "func" : function(result, args, o){
                            console.log("m777".yellow)
                            console.log(args)
                            if (!('toStack' in result)) result.toStack = {};
                            if (!('prepareCardEffect' in result.toStack)) result.toStack.prepareEffect = [];
                            result.toStack.prepareEffect.push({
                                pX : args.owner + '',
                                card: args.card, 
                                effectType : 'trigger', 
                                trigger:'resolve', 
                                effectKey: 0});
                            return result;
                        },
                        "question" : function(args, o) {
                            if (args.pX == you) {
                                AN.stop = true;
                                if (!('cardEffect' in Answers)) Answers.cardEffect = [];
                                var condidateCount = [];
                                $( '#noir' ).css( 'width', I.table.W ).css( 'height', I.table.H ).html( 'Выберите карту для сброса.' ); 
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
                                    args.discartedCard = card.id;
                                    Answers.cardEffect.push(args)
                                    AN.hideNoir({ condidateCount:condidateCount });
                                    Card.moveToPreviewToHandBlocker = false;
                                    AN.preStack.countDown();
                                }
                            }
                            else {
                                AN.preStack.countDown();
                            }
                        },
                        "cardEffect" : function(result, args, o) {

                            if (!('drawCard' in result)) result.drawCard = [];
                            result.drawCard.push({
                                player:  args.pX,
                                numberOfCard: 3, 
                                drawCardCause: 'cardeffect'
                            });

                            if (!('applyUpd' in result)) result.applyUpd = [];
                            var topDeck = [];
                            for (var i = 0; i<=2; i++) {
                                topDeck.push(o.S[args.pX].deck[0])
                                var topArrgs = {
                                    pX  : args.pX,
                                    card  : o.S[args.pX].deck[0] ,
                                    cause  : 'effectOfcard' ,
                                    from  : 'deck' ,
                                    to  : 'hand' ,
                                    team  : null
                                }
                                Actions.moveCardToZone(topArrgs, o);
                            }
                            result.applyUpd.push({
                                forPlayer: args.pX, 
                                cards : topDeck
                            })

                            if (!('moveCardToZone' in result)) result.moveCardToZone = [];
                            var moveArgs = {
                                pX  : args.pX,
                                card  : args.discartedCard ,
                                cause  : 'effectOfcard' ,
                                from  : 'hand' ,
                                to  : 'discard' ,
                                team  : null
                            }                            
                            Actions.moveCardToZone(moveArgs, o);
                            result.moveCardToZone.push(moveArgs);

                        }
                    }
                ]
            }
        }
    },
    "m821": {
        "type": "M",
        "ec": 1,
        "hc": 1,
        "img": "m821",
        "number": "m821",
        "elements": "E",
        "name": "Decoding the Message",
        "effectText" : {
            "effects" : [
                {"effect":"Пстоянная 3"},
                {"effect":"Ваши ниндзя с 'Тень' получают +1/+1 и +2 к ментальной силе."},
                {
                    "when" : ["Обмен техниками"],
                    "cost" : "E1",
                    "effect":"Ваша целевая команада с ниндзя с 'Тень' и сражающася против нее команда (если такая есть) вступают в ментальную битву на этапе полсчета.",
                }
            ]
        },
        "effect" : {
            "permanent" : 3
        }
    },
    "m859": {
        "type": "M",
        "ec": 2,
        "hc": 1,
        "img": "m859",
        "number": "m859",
        "elements": "E",
        "name": "The Nara Clan",
        "effectText" : {
            "effects" : [
                {"effect":"Пстоянная"},
                {
                    "when" : ["Attacker", "Mission"],
                    "cost" : "Выберите тип карты. Затем откройте верхнюю карту вашей колоды.",
                    "effect":"Если открытая карты имеет загаданный вами тип, положите ее в свою руку.",
                }
            ]
        },
        "effect" : {
            "permanent" : true,}
    }
};
if (module) {
    module.exports = CardBase;
}




