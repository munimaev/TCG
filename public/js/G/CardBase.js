
if (module) {
    var Can = require('./Can.js');;
}
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
        "effectText": {
            "effectName": "Внеочередная атака",
            "effects": [{
                "when" : "Фаза миссии",
                "cost" : "Сбросить с руки карту с 'Манипуляция' или 'Марионетка'",
                "effect": "Найдите в вашей колоде ниндзя с 'Марионетка' положите ее в свою руку. Затем претасуйте колоду.",
            }]
        },
        "statuses":['Sand'],
        "atributes":['Manipulation'],
        "effect": {
            "activate": [{
                "can": function(args, o) {
                    var owner = o.Known[o.Accordance[args.card]].owner;
                    var battle = owner == o.S.activePlayer ? 'attack' : 'block';
                    // console.log(args)
                    var dict = [
                        ['Вы не контролируете эту карту.',
                            function() {if (!module) {return you == owner} else return true;}
                        ],
                        ['Вы уже испоользовали эту способность.',
                            function() {
                                return !(o.S.statuses[args.card] 
                                && o.S.statuses[args.card].atEndOfTurn 
                                && o.S.statuses[args.card].atEndOfTurn.activateUsed0)}
                        ],
                        ['Ниндзя должен быть в вашей деревне.',
                            function() {
                                return Actions.cardPath({
                                    card: args.card,
                                    path: {players: [owner],
                                        zones: ['village']}
                                }, o)
                            }
                        ],
                        ['Нет карт с Марионетка в вашей руке.',
                            function() {
                                return Actions.getCardForCondition({
                                    path: {
                                        players: [owner],
                                        zones: ['hand']
                                    },
                                    statuses: ['Puppet']
                                }, o).length;
                            }
                        ]
                    ]
                    // console.log(o.Known[o.Accordance[args.card]].type.bold);
                    return Actions.canCheckDict(dict);
                },
                "prepareEffect": function(args, o) {
                    if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
                    if (!('atEndOfTurn' in o.S.statuses)) o.S.statuses[args.card].atEndOfTurn = {};
                    o.S.statuses[args.card].atEndOfTurn.activateUsed0 = true; 

                    result = {
                        'prepareEffect': [{
                            pX: o.Known[o.Accordance[args.card]].owner,
                            card: args.card,
                            effectType: 'activate',
                            effectKey: 0
                        }]
                    }
                    return result;
                },
                "question" : function(args, o) {
                    if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
                    if (!('atEndOfTurn' in o.S.statuses)) o.S.statuses[args.card].atEndOfTurn = {};
                    o.S.statuses[args.card].atEndOfTurn.activateUsed0 = true; 

                    var owner = o.Known[o.Accordance[args.card]].owner;
                    if (args.pX == you) {
                        AnimationPush({func: function() {
                            AN.stop = true;
                            if (!('primal' in Answers)) Answers.primal = {};
                            if (!('cardEffect' in Answers.primal)) Answers.primal.cardEffect = [];
                            AN.moveToPreview({
                                pX: args.pX
                            });
                            Card.moveToPreviewToHandBlocker = true;

                            var owner = o.Known[o.Accordance[args.card]].owner;
                            var condidateCount = Actions.getCardForCondition({
                                path: {
                                    players: [owner],
                                    zones: ['hand']
                                },
                                statuses: ['Puppet'],
                                atributes: ['Manipulation'],
                                greedy: true

                            }, o);
                            $('#noir').css('width', I.W).css('height', I.H).html('<br>Выберите марионетку.');
                            for ( var i in condidateCount) {
                                C[condidateCount[i]].setZIndex(1202);
                            }

                            Context.workingUnit = 'card';
                            Context.clickAction = function( card ) {
                                args.selectedCard = card.id;
                                Answers.primal.cardEffect.push(args);
                                AN.hideNoir({ condidateCount:condidateCount });
                                Card.moveToPreviewToHandBlocker = false;
                                AN.preStack.countDown();
                            }
                        }, time:1000, name: 'Questions - selectChackra'});
                    } else {
                        AN.preStack.countDown();
                    }
                },
                "cardEffect": function(result, args, o) {
                    // console.log('CARDEFFECT'.bold)
                    var owner = o.Known[o.Accordance[args.card]].owner;

                    if (!('applyUpd' in result)) result.applyUpd = [];
                    result.applyUpd.push({
                        forPlayer: owner == 'pA' ? 'pB' : 'pA',
                        cards: [args.selectedCard]
                    })

                    if (!('adMoveCardToZone' in result)) result.adMoveCardToZone = [];
                    result.adMoveCardToZone.push({
                        pX: owner,
                        card: args.selectedCard,
                        cause: 'cardEffect',
                        from: 'hand',
                        to: 'discard',
                        team: null
                    })
                    for (var i in o.S[args.pX].deck) {
                        var cardId = o.Known[o.Accordance[o.S[args.pX].deck[i]]];
                        console.log(cardId.number, cardId.statuses)
                        if (cardId.statuses
                            && ~cardId.statuses.indexOf('Puppet')
                        ){
                            if (!('applyUpd' in result)) result.applyUpd = [];
                            result.applyUpd.push({
                                forPlayer: owner,
                                cards: [o.S[args.pX].deck[i]]
                            })
                        } 
                    }
                    if (!('prepareEffect' in result)) result.prepareEffect = [];
                    result.prepareEffect.push({
                        pX: o.Known[o.Accordance[args.card]].owner,
                        card: args.card,
                        effectType: 'activate',
                        effectKey: 0,
                        step: 1
                    })
                    return result;
                },
                "question1" : function(args, o) {   
                    if (args.pX == you) {
                        AnimationPush({func: function() {
                            AN.stop = true;
                            if (!('primal' in Answers)) Answers.primal = {};
                            if (!('cardEffect' in Answers.primal)) Answers.primal.cardEffect = [];

                            var owner = o.Known[o.Accordance[args.card]].owner;
                            var condidateCount = Actions.getCardForCondition({
                                path: {
                                    players: [owner],
                                    zones: ['deck']
                                },
                                statuses: ['Puppet']
                            }, o);

                            btnArea('deck','you',{faceUp:condidateCount});
                            Context.workingUnit = 'card';
                            Context.clickAction = function( card ) {
                                if (!~condidateCount.indexOf(card.id)) return;
                                args.selectedCard2 = card.id;
                                args.step = 1;
                                Answers.primal.cardEffect.push(args);
                                AN.hideNoir({ condidateCount:condidateCount });
                                btnArea('deck','you');
                                AN.preStack.countDown();
                            }
                        }, time:1000, name: 'Questions - selectChackra'});
                    } else {
                        AN.preStack.countDown();
                    }
                },
                "cardEffect1": function(result, args, o) {
                    var owner = o.Known[o.Accordance[args.card]].owner;

                    var unk = [];
                    for (var i in o.S[owner].deck) {
                        if (o.S[owner].deck[i] != args.selectedCard2) {
                            unk.push(o.S[owner].deck[i]);
                        }
                    }
                    if (!('applyUpd' in result)) result.applyUpd = [];
                    result.applyUpd.push({
                        forPlayer: owner,
                        cards: unk,
                        unknown : true
                    })
                    if (!('adMoveCardToZone' in result)) result.adMoveCardToZone = [];
                    result.adMoveCardToZone.push({
                        pX: args.pX,
                        card: args.selectedCard2,
                        cause: 'cardEffect',
                        from: 'deck',
                        to: 'hand',
                        team: null
                    })
                    if (!('prepareEffect' in result)) result.prepareEffect = [];
                    result.prepareEffect.push({
                        pX: o.Known[o.Accordance[args.card]].owner,
                        card: args.card,
                        effectType: 'activate',
                        effectKey: 0,
                        step: 2
                    })
                    return result;
                },
                "question2" : function(args, o) {
                    if (args.pX == you) {
                        console.log('!!!')
                        console.log(Known[Accordance[args.selectedCard2]])
                        if (!('primal' in Answers)) Answers.primal = {};
                        if (!('cardEffect' in Answers.primal)) Answers.primal.cardEffect = [];
                        args.step = 2;
                        Answers.primal.cardEffect.push(args);
                        AN.preStack.countDown();
                    } else {
                        AN.preStack.countDown();
                    }
                },
                "cardEffect2": function(result, args, o) {
                    Actions.shuffle({pX:o.Known[o.Accordance[args.card]].owner, zone:'deck'}, o);
                },
            }]
        }
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
        "effectText": {
            "effectName": "Премечивый нрав",
            "effects": [{
                "effect": "Когда этот ниндзя сбрасываеться в результате подсчета, оппонент перемещает случайную карту из своей руки наверх колоды.",
                "valid": true
            }]
        },
        "effect": {
            "trigger": {
                "moveCardToZone": [{
                    "conditionSelf": function(args, o) {
                        if (o.Known[args.card].number == 'n847' && (args.from == "block" || args.from == "attack") && args.cause == "resultOfshutdown") {
                            return true;
                        }
                        return false;
                    },
                    "result": function(result, args, o) {
                        var opp = args.pX == 'pA' ? 'pB' : 'pA';
                        if (!o.S[opp].hand.length) return result;
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('cardTriggerEffect' in result.toStack)) result.toStack.moveCardToZone = [];

                        console.log(o.S[opp].hand)

                        var card = o.S[opp].hand[Math.round(Math.random() * (o.S[opp].hand.length - 1))];
                        result.toStack.moveCardToZone.push({
                            pX: opp,
                            card: card,
                            cause: 'effectOfcard',
                            from: 'hand',
                            to: 'deck',
                            team: null,
                            options: {
                                moveTo: 'top'
                            }
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
        "name": "Матсури",
        "effectText": {
            effectName: "Последоавтель",
            "effects": [{
                "effect": "Ваши другие ниндзя с 'Песок'' получают +0/+1.",
            }]
        },
        "statuses":['Sand'],
        "effect": {
            "static": { // подконтрольная облась powerNinja
                "powerNinja": [{
                    "condition": function(args, o) {
                        if (args.card != args.self
                            && Actions.isHealt(args.self, o)
                            && o.Known[o.Accordance[args.card]].statuses 
                            && ~o.Known[o.Accordance[args.card]].statuses.indexOf('Sand')) {
                            return Actions.cardPath({
                                card: args.card,
                                path: {
                                    players: [o.Known[o.Accordance[args.self]].owner],
                                    zones: ['village', 'attack', 'block'],
                                }
                            }, o);
                        }
                        return false;
                    },
                    "conditionSelf": function(args, o) {
                        return Actions.cardPath({
                            card: args.self,
                            path: {
                                players: [o.Known[o.Accordance[args.self]].owner],
                                zones: ['village', 'attack', 'block']
                            }
                        }, o);
                    },
                    "powerMod": {
                        attack: 0,
                        support: 1,
                    }
                }]
            }
        }
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
        "name": "Офицер эпидемиологоической защииты",
        "effectText": {
            effectName: "Лечащие техники",
            "effects": [{
                "when" : "Обмен техниками или Ффаза миссии.",
                "cost" : "Удалите этого ниндзя в вашей руке из игры.",
                "effect": "Исцелите вашего ранненго ниндзя.",
            }]
        },
        "effect": {
            "activate": [{
                "can": function(args, o) {
                    var owner = o.Known[o.Accordance[args.card]].owner;
                    var dict = [
                        ['Вы не контролируете эту карту.',
                            function() {if (!module) {return you == owner} else return true;}
                        ],
                        ['Вы уже испоользовали эту способность.',
                            function() {
                                return !(o.S.statuses[args.card] 
                                && o.S.statuses[args.card].atEndOfTurn 
                                && o.S.statuses[args.card].atEndOfTurn.activateUsed0)}
                        ],
                        ['Ниндзя должен быть в руке.',
                            function() {
                                return Actions.cardPath({
                                    card: args.card,
                                    path: {players: [owner],
                                        zones: ['hand']}
                                }, o)
                            }
                        ],
                        ['Применяеться только в фазу миссии или обмена техниками.',
                            function() {
                                return o.S.phase === 'jutsu' || o.S.phase === 'mission';
                            }
                        ],
                        ['Нету раненных ниндзя.',
                            function() {
                                return Actions.getCardForCondition({
                                    path: {
                                        players: [owner],
                                        zones: ['attack','block','village']
                                    },
                                    injured: true
                                }, o).length;
                            }
                        ]
                    ]
                    // console.log(o.Known[o.Accordance[args.card]].type.bold);
                    return Actions.canCheckDict(dict);
                },
                "prepareEffect": function(args, o) {
                    if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
                    if (!('atEndOfTurn' in o.S.statuses)) o.S.statuses[args.card].atEndOfTurn = {};
                    o.S.statuses[args.card].atEndOfTurn.activateUsed0 = true; 

                    result = {
                        'prepareEffect': [{
                            pX: o.Known[o.Accordance[args.card]].owner,
                            card: args.card,
                            effectType: 'activate',
                            effectKey: 0
                        }]
                    }

                    if (!('applyUpd' in result)) result.applyUpd = [];
                    result.applyUpd.push({
                        forPlayer: args.owner == 'pA' ? 'pB' : 'pA',
                        cards: [args.card]
                    })
                    
                    // console.log(o.Known[o.Accordance[args.card]].type.bold);
                    return result;
                },
                "question" : function(args, o) {
                    if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
                    if (!('atEndOfTurn' in o.S.statuses)) o.S.statuses[args.card].atEndOfTurn = {};
                    o.S.statuses[args.card].atEndOfTurn.activateUsed0 = true; 

                    var owner = o.Known[o.Accordance[args.card]].owner;
                    if (args.pX == you) {
                        AN.stop = true;
                        if (!('primal' in Answers)) Answers.primal = {};
                        if (!('cardEffect' in Answers.primal)) Answers.primal.cardEffect = [];

                        var owner = o.Known[o.Accordance[args.card]].owner;
                        var condidateCount = Actions.getCardForCondition({
                            path: {
                                players: [owner],
                                zones: ['attack','block','village']
                            },
                            injured: true
                        }, o)
                        $('#noir').css('width', I.W).css('height', I.H).html('<br>Выберите раненного ниндзя.');
                        for ( var i in condidateCount) {
                            C[condidateCount[i]].setZIndex(1202);
                        }

                        Context.workingUnit = 'card';
                        Context.clickAction = function( card ) {
                            args.selectedCard = card.id;
                            Answers.primal.cardEffect.push(args);
                            AN.hideNoir({ condidateCount:condidateCount });
                            card.params.zona = 'presentation';
                            AN.moveCardToCenter({
                                card: args.card,
                                pX : owner,
                                from: 'hand',
                                presentation : true,
                                afterFunc : AN.preStack.countDown
                            })
                        }
                    } else {
                        C[args.card].params.zona = 'presentation';
                        AN.moveCardToCenter({
                            card: args.card,
                            pX : owner,
                            from: 'hand',
                            presentation : true,
                            afterFunc : AN.preStack.countDown
                        })
                    }
                },
                "cardEffect": function(result, args, o) {
                    // console.log('CARDEFFECT'.bold)
                    
                    var path = Actions.cardPath({card:args.selectedCard}, o);
                    if (!('adHealingNinja' in result)) result.adHealingNinja = [];
                    result.adHealingNinja.push({
                        pX: path.player,
                        card: args.selectedCard,
                        cause: 'cardEffect',
                        from: path.zone,
                        to: path.zone,
                        team: path.team,
                        cardInArray : path.cardInArray
                    })


                    if (!('prepareEffect' in result)) result.prepareEffect = [];
                    result.prepareEffect.push({
                            pX: o.Known[o.Accordance[args.card]].owner,
                            card: args.card,
                            effectType: 'activate',
                            effectKey: 0,
                            step: 1
                        })

                    // var path = Actions.cardPath({card:card.selectedCard}, o);
                    // if (!('adRemoveCardFromGame' in result)) result.adRemoveCardFromGame = [];
                    // result.adRemoveCardFromGame.push({
                    //     pX: args.pX,
                    //     card: args.card,
                    //     cause: 'cardEffect',
                    //     from: 'hand'
                    // })

                    return result;
                },
                "question1" : function(args, o) {
                        if (!('primal' in Answers)) Answers.primal = {};
                        if (!('cardEffect' in Answers.primal)) Answers.primal.cardEffect = [];
                    Answers.primal.cardEffect.push(args);
                    AN.preStack.countDown();
                },
                "cardEffect1": function(result, args, o) {
                    // console.log('CARDEFFECT'.bold)
                    
                    // var path = Actions.cardPath({card:args.selectedCard}, o);
                    // if (!('adHealingNinja' in result)) result.adHealingNinja = [];
                    // result.adHealingNinja.push({
                    //     pX: path.player,
                    //     card: args.selectedCard,
                    //     cause: 'cardEffect',
                    //     from: path.zone,
                    //     to: path.zone,
                    //     team: path.team,
                    //     cardInArray : path.cardInArray
                    // })


                    // if (!('prepareEffect' in result)) result.prepareEffect = [];
                    // result.prepareEffect.push({
                    //         pX: o.Known[o.Accordance[args.card]].owner,
                    //         card: args.card,
                    //         effectType: 'activate',
                    //         effectKey: 0,
                    //         step: 1
                    //     })

                    // var path = Actions.cardPath({card:card.selectedCard}, o);
                    if (!('adRemoveCardFromGame' in result)) result.adRemoveCardFromGame = [];
                    result.adRemoveCardFromGame.push({
                        pX: args.pX,
                        card: args.card,
                        cause: 'cardEffect',
                        from: 'hand'
                    })

                    return result;
                },
            }]
        }
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
        "effectText": "",
        "statuses" : ["Puppet"],
        "effect": {}
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
        "effectText": {
            effectName: "Кукловод песка",
            "effects": [{
                "when" : "Обмен техниками",
                "cost" : "1",
                "effect": "Переместите целевую марионетку из другой вашей отправленной в сражение в команду этого ниндзя на любую позицию.",
            }]
        },
        "atributes":['Manipulation'],
        "effect": {
            "activate": [{
                "can": function(args, o) {
                    var owner = o.Known[o.Accordance[args.card]].owner;
                    var battle = owner == o.S.activePlayer ? 'attack' : 'block';
                    var cards = Actions.getCardForCondition({
                        path: {
                            players: [owner],
                            zones: [battle]
                        },
                        statuses: ['Puppet']
                    }, o)
                    console.log(args)
                    var dict = [
                        ['Вы не контролируете эту карту.',
                            function() {if (!module) {return you == owner} else return true;}
                        ],
                        ['Вы уже испоользовали эту способность.',
                            function() {
                                return !(o.S.statuses[args.card] 
                                && o.S.statuses[args.card].atEndOfTurn 
                                && o.S.statuses[args.card].atEndOfTurn.activateUsed0)}
                        ],
                        ['Ниндзя должен быть отправлен в сражение.',
                            function() {
                                return Actions.cardPath({
                                    card: args.card,
                                    path: {players: [owner],
                                        zones: ['attack', 'block']}
                                }, o)
                            }
                        ],
                        ['Нет марионеток.',
                            function() {
                                return Actions.getCardForCondition({
                                    path: {
                                        players: [owner],
                                        zones: [battle]
                                    },
                                    statuses: ['Puppet']
                                }, o).length;
                            }
                        ],
                        ['Не достаточно чакры.',
                            function() {return Can.enoughChakra({cost: [['1']],pX: owner},o)}
                        ]
                    ]
                    // console.log(o.Known[o.Accordance[args.card]].type.bold);
                    return Actions.canCheckDict(dict);
                },
                "prepareEffect": function(args, o) {
                    if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
                    if (!('atEndOfTurn' in o.S.statuses)) o.S.statuses[args.card].atEndOfTurn = {};
                    o.S.statuses[args.card].atEndOfTurn.activateUsed0 = true; 

                    result = {
                        'prepareEffect': [{
                            pX: o.Known[o.Accordance[args.card]].owner,
                            card: args.card,
                            effectType: 'activate',
                            effectKey: 0
                        }]
                    }
                    // console.log(o.Known[o.Accordance[args.card]].type.bold);
                    return result;
                },
                "question" : function(args, o) {
                    if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
                    if (!('atEndOfTurn' in o.S.statuses)) o.S.statuses[args.card].atEndOfTurn = {};
                    o.S.statuses[args.card].atEndOfTurn.activateUsed0 = true; 

                    var owner = o.Known[o.Accordance[args.card]].owner;
                    if (args.pX == you) {

                        AnimationPush({func:function() {
                            AN.Questions.selectChackra({cost:['1'], pX: owner}, o, getUniversalObject());
                        }, time:100, name: 'Questions - selectChackra'});

                        AnimationPush({func: function() {
                            AN.stop = true;
                            if (!('primal' in Answers)) Answers.primal = {};
                            if (!('cardEffect' in Answers.primal)) Answers.primal.cardEffect = [];

                            var owner = o.Known[o.Accordance[args.card]].owner;
                            var battle = owner == o.S.activePlayer ? 'attack' : 'block';
                            var condidateCount = Actions.getCardForCondition({
                                path: {
                                    players: [owner],
                                    zones: [battle]
                                },
                                statuses: ['Puppet']
                            }, o);
                            $('#noir').css('width', I.W).css('height', I.H).html('<br>Выберите марионетку.');
                            for ( var i in condidateCount) {
                                C[condidateCount[i]].setZIndex(1202);
                            }

                            Context.workingUnit = 'card';
                            Context.clickAction = function( card ) {
                                args.selectedPuppet = card.id;
                                Answers.primal.cardEffect.push(args);
                                AN.hideNoir({ condidateCount:condidateCount });
                                AN.preStack.countDown();
                            }
                        }, time:1000, name: 'Questions - selectChackra'});
                    } else {
                        AN.preStack.countDown();
                    }
                },
                "cardEffect": function(result, args, o) {
                    // console.log('CARDEFFECT'.bold)
                    if (!('adMoveCardToZone' in result)) result.adMoveCardToZone = [];
                    var path = Actions.cardPath({card:args.card}, o);
                    console.log(args, path);
                    result.adMoveCardToZone.push({
                        pX: path.player,
                        card: args.selectedPuppet,
                        cause: 'cardEffect',
                        from: path.zone,
                        to: path.zone,
                        team: path.team,
                        cardInArray : path.cardInArray
                    })
                    // console.log(o.Known[o.Accordance[args.card]].type.bold);
                    return result;
                }
            }]
        }
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
        "effectText": "",
        "statuses":['Sand'],
        "effectText": {
            "effectName": "Коса ветра",
            "effects": [{
                "effect": "Когда этот ниндзя входит в игру, вы можете посмотреть все карты в руке оппонента, выберите 1 карту технкиик и перместите ее в чакру владельца.",
            }]
        },
        "effect": {
            "trigger": {
                "afterMoveCardToZone": [{
                    "condition": function(args, o) {
                        var card = o.Known[o.Accordance[args.card]]; 
                        if (card.number == 'nus025'
                            && args.cause == "play"
                        ) {
                            return true;
                        }
                        console.log(args)
                        console.log(card.number == 'nus025'
                            && args.cause == "play")
                        return false;
                    },
                    "conditionSelf": function(args, o) {
                        if (args.card == args.actionArgs.card) {
                            return true;
                        }
                        return false;
                    },
                    "ciclingCheck": function(args, o) {
                        return o.S.turnNumber + args.card + args.actionArgs.card;
                    },
                    "resultChange": function(result, args, o) {
                        var owner = o.Known[o.Accordance[args.card]].owner;
                        var opp = owner == 'pA' ? 'pB' : 'pA';
                        if(!('toStack' in result)) result.toStack = {};
                        if(!('prepareEffect' in result.toStack)) result.toStack.prepareEffect = [];
                        result.toStack.prepareEffect.push({
                            pX: owner,
                            card: args.card,
                            effectType: 'trigger',
                            trigger: 'afterMoveCardToZone',
                            effectKey: 0,
                            actionArgs: args.actionArgs
                        })

                        if (!('applyUpd' in result.toStack)) result.toStack.applyUpd = [];
                        result.toStack.applyUpd.push({
                            forPlayer: owner,
                            cards: o.S[opp].hand
                        })

                        console.log('resultChange'.bold.yellow)
                        console.log(result)
                        return result;
                    },
                    "question" : function(args, o) {

                        AnimationPush({func: function() {
                            C[args.card].concentrate();
                        }, time:500, name: 'Questions - card effect concentrate'});

                        AnimationPush({func: function() {
                            var owner = o.Known[o.Accordance[args.card]].owner;
                            var opp = owner == 'pA' ? 'pB' : 'pA';
                            AN.moveToPreview({
                                pX: opp
                            });
                            Card.moveToPreviewToHandBlocker = true;
                        }, time:500, name: 'Questions - card effect concentrate'});

                        var condidateCount = Actions.getCardForCondition({
                            path: {
                                players: [opp],
                                zones: ['hand']
                            }
                        }, o);

                        AnimationPush({func: function() {
                            for ( var i in condidateCount) {
                                C[condidateCount[i]].setZIndex(1202);
                                C[condidateCount[i]].flipUp(); 
                            }

                        }, time:1000, name: 'Questions - card effect flip'});

                        AnimationPush({func: function() {
                            var owner = o.Known[o.Accordance[args.card]].owner;
                            var opp = owner == 'pA' ? 'pB' : 'pA';
                            // console.log(owner, you, owner===you)
                            if (owner === you) {
                                AN.stop = true;
                                if (!('primal' in Answers)) Answers.primal = {};
                                if (!('cardEffect' in Answers.primal)) Answers.primal.cardEffect = [];
                                var owner = o.Known[o.Accordance[args.card]].owner;
                                var opp = owner == 'pA' ? 'pB' : 'pA';

                                Card.moveToPreviewToHandBlocker = true;

                                $('#noir').css('width', I.W).css('height', I.H).html('<br>Выберите технику.');
                                var jutsuCount = 0;
                                for ( var i in condidateCount) {
                                    if (C[condidateCount[i]].params.type === 'J') {
                                        jutsuCount++;
                                    }
                                }

                                Context.workingUnit = 'card';
                                Context.clickAction = function(card) {
                                    if (jutsuCount) {
                                        if (o.Known[o.Accordance[card.id]].type == 'J') {
                                            args.selectedCard = card.id;
                                            Answers.primal.cardEffect.push(args);
                                            AN.hideNoir({
                                                condidateCount: condidateCount
                                            });
                                            AN.preStack.countDown();
                                        } else {
                                            return;
                                        }
                                    } else {
                                        args.selectedCard = false;
                                        Answers.primal.cardEffect.push(args);
                                        AN.hideNoir({
                                            condidateCount: condidateCount
                                        });
                                        AN.preStack.countDown();
                                    }
                                }
                            } else {
                                setTimeout(AN.preStack.countDown, 500)
                            }
                        }, time:1, name: 'Questions - card effect concentrate'});
                    },
                    "cardEffect": function(result, args, o) {
                        // console.log('CARDEFFECT'.bold)
                        if (!('adMoveCardToZone' in result)) result.adMoveCardToZone = [];
                        var path = Actions.cardPath({
                            card: args.selectedCard
                        }, o);
                        console.log(args, path);
                        result.adMoveCardToZone.push({
                            pX: path.player,
                            card: args.selectedCard,
                            cause: 'cardEffect',
                            from: path.zone,
                            to: 'chackra',
                            team: null,
                            cardInArray: path.cardInArray
                        })

                        var owner = o.Known[o.Accordance[args.selectedCard]].owner;
                        var otherCard = [];
                        for (var i in o.S[owner].hand) {
                            if (o.S[owner].hand[i] !== args.selectedCard) {
                                otherCard.push(o.S[owner].hand[i]);
                            }
                        }

                        console.log('HAND'.red, o.S[owner].hand)
                        Actions.shuffle({pX:owner, zone:'hand', exept:args.selectedCard},o);
                        console.log('HAND'.red, o.S[owner].hand)


                        if (!('applyUpd' in result)) result.applyUpd = [];
                        result.applyUpd.push({
                            forPlayer: (owner == 'pA' ? 'pB' : 'pA'),
                            cards: otherCard,
                            unknown : true
                        })
                        result.applyUpd.push({
                            forPlayer: owner,
                            cards: otherCard,
                        })

                        var updS = {};
                        updS[owner] = {'hand':o.S[owner].hand}

                        console.log('updS'.red, updS)
                        result.applyUpd.push({
                            S:updS
                        })

                        if (args.selectedCard) {
                            if (!('prepareEffect' in result)) result.prepareEffect = [];
                            result.prepareEffect.push({
                                pX: owner,
                                card: args.card,
                                effectType: 'trigger',
                                trigger: 'afterMoveCardToZone',
                                effectKey: 0,
                                actionArgs: args.actionArgs,
                                step: 1,
                                //-----///
                                selectedCard: args.selectedCard
                            })
                        }



                        // console.log(o.Known[o.Accordance[args.card]].type.bold);
                        return result;
                    },
                    "question1": function(args, o) {
                        var selectedCard = o.Known[o.Accordance[args.selectedCard]];
                        var path = Actions.cardPath({
                            card: args.selectedCard,
                            path: {}
                        }, o);

                        AnimationPush({
                            func: function() {
                                AN.moveCardToCenter({
                                    pX: path.player,
                                    from: path.zone,
                                    card: args.selectedCard,
                                    presentation: true,
                                    outCard : false
                                }, o)
                            },
                            time: 820,
                            name: 'Questions - card effect card to center'
                        });

                        var otherCard = [];
                        for (var i in o.S[path.player].hand) {
                            if (o.S[path.player].hand[i] !== args.selectedCard) {
                                otherCard.push(o.S[path.player].hand[i]);
                            }
                        }
                        if (you !== path.player) {
                            AnimationPush({
                                func: function() {
                                    for (var i in otherCard) {
                                        C[otherCard[i]].flip();
                                    }
                                },
                                time: 1000,
                                name: 'Questions - card effect flip'
                            });
                        }

                        AnimationPush({
                            func: function() {
                                for (var i in otherCard) {

                                    var preCardId = otherCard[i];
                                    C[otherCard[i]].animation({
                                        Y: (path.player === you ? 2 : -1 ) * I.H ,
                                        X: I.W / 2,
                                        additional: {
                                            after: {
                                                func : function() {
                                                    var cardId = preCardId;
                                                    return function() {
                                                        console.log(cardId)
                                                        C[cardId].destroyCard(); 
                                                    }
                                                }()
                                            }
                                        }
                                    });
                                }
                                setTimeout(function() {
                                    Card.moveToPreviewToHandBlocker = false;
                                    AN.preStack.countDown();
                                }, 1000)
                            },
                            time: 1000,
                            name: 'Questions - card effect move-hide'
                        });
                    }
                }]
            }
        }
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
        "statuses" : ['Puppet'],
        "effectText": "",
        "effect": {}
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
        "effectText": {
            "effectName": "Деревянный воин",
            "effects": [{
                "effect": "Неуникальный.",
            },{
                "effect": "Пока этот ниндзя в однойкоманде с ниндзя с боевым атрибтом Манипуляция, этот ниндзя имеет следующий эффект:",
            },{
                "effect": "Когда этот ниндзя блокирует, вы может взять 1 карту.",
            }]
        },
        "statuses" : ["Sand","Puppet"],
        "effect":  {
            "trigger": {
                "atJutsu": [{
                    "func": function(result, args, o) {
                        console.log("atJutsu".yellow)
                        console.log(args)

                        var owner = o.Known[o.Accordance[args.card]].owner;

                        if (!('toStack' in result)) result.toStack = {};
                        if (!('drawCard' in result.toStack)) result.toStack.drawCard = [];
                        if (!('applyUpd' in result.toStack)) result.toStack.applyUpd = [];
                        var prepareDrawCard = Actions.prepareDrawCard({
                            player: owner,
                            number: 1,
                            drawCardCause:'cardeffect'
                        }, o)

                        result.toStack.drawCard.push(prepareDrawCard.drawCard[0]);
                        result.toStack.applyUpd.push(prepareDrawCard.applyUpd[0]);

                    console.log('result'.red, result)
                    console.log('prepareDrawCard.drawCard'.red, prepareDrawCard.drawCard)
                    console.log('result.toStack.drawCard'.red, result.toStack.drawCard)
                    console.log('prepareDrawCard.drawCard'.red, prepareDrawCard.applyUpd)
                    console.log('result.toStack.applyUpd'.red, result.toStack.applyUpd)
                        return result;
                    },
                    "conditionSelf": function(args, o) {
                        var owner = o.Known[o.Accordance[args.card]].owner;
                        var opp = owner == 'pA' ? 'pB' : 'pA';
                        var path = Actions.cardPath({
                            card: args.card,
                            path: {
                                players: [owner],
                                zones: ['block']
                            }
                        }, o);
                        console.log('path'.red, path)
                        if (!path) {
                            return false;
                        }
                        for (var c in o.S[owner].block.team[path.team]) {
                            var cardId = o.S[owner].block.team[path.team][c];
                            var atributes = o.Known[o.Accordance[cardId]].atributes;
                        console.log('atributes'.red, atributes)
                            if (atributes && ~atributes.indexOf('Manipulation')) {
                                return true;
                            }
                        }
                        return false;
                    }
                }]
            }
        }
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "statuses" : ["Puppet"],
        "effect": {}
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
        "effectText": "",
        "statuses":['Sand'],
        "effect": {}
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
        "effectText": "",
        "atributes":['Manipulation'],
        "effect": {}
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
        "effectText": "",
        "statuses":['Sand'],
        "atributes":['Manipulation'],
        "effect": {}
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
        "effectText": "",
        "statuses":['Sand'],
        "effect": {}
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
        "effectText": "",
        "atributes":['Manipulation'],
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "statuses":['Sand'],
        "effect": {}
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
        "cost": [
            ['W', 'W', '1']
        ],
        "costText": [
            ['WW1']
        ],
        "effectText": "",
        "requirement": function(card, o) {
            return true;
        },
        "target": [{
            player: 'you',
            zone: 'battle',
            func: function() {
                return true;
            }
        }],
        "effect": {
            "trigger": {
                "resolve": [{
                    func: function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('increaseNinjaPower' in result.toStack)) result.toStack.increaseNinjaPower = [];
                        // console.log('args'.red)
                        // console.log(args)
                        result.toStack.increaseNinjaPower.push({
                            card: args.target[0],
                            attack: 5,
                            support: 2,
                        });
                        return result;
                    }
                }]
            }
        }
    },
    "j517": {
        "type": "J",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "j517",
        "number": "j517",
        "elements": "E",
        "name": "Formation",
        "cost": [
            ['1']
        ],
        "costText": [
            ['1']
        ],
        "effectText": "",
        "requirement": function(card, o) {
            return true;
        },
        "target": [{
            player: 'you',
            zone: 'battle',
            func: function() {
                return true;
            }
        }],
        "effect": {
            "trigger": {
                "resolve": [{
                    func: function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('increaseNinjaPower' in result.toStack)) result.toStack.increaseNinjaPower = [];
                        result.toStack.increaseNinjaPower.push({
                            card: args.target[0],
                            attack: 5,
                            support: 2,
                        });
                        return result;
                    }
                }]
            }
        }
    },
    "j697": {
        "type": "J",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "j697",
        "number": "j697",
        "elements": "E",
        "name": "Expansion Jutsu: Super Slap!",
        "cost": [
            ['1']
        ],
        "costText": [
            ['1']
        ],
        "effectText": "",
        "requirement": function(card, o) {
            return true;
        },
        "target": [{
            player: 'you',
            zone: 'battle',
            func: function() {
                return true;
            }
        }],
        "effect": {
            "trigger": {
                "resolve": [{
                    func: function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('increaseNinjaPower' in result.toStack)) result.toStack.increaseNinjaPower = [];
                        result.toStack.increaseNinjaPower.push({
                            card: args.target[0],
                            attack: 5,
                            support: 2,
                        });
                        return result;
                    }
                }]
            }
        }
    },
    "j710": {
        "type": "J",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "j710",
        "number": "j710",
        "elements": "E",
        "name": "Shikamaru's Judjment",
        "cost": [
            ['1']
        ],
        "costText": [
            ['1']
        ],
        "effectText": "",
        "requirement": function(card, o) {
            return true;
        },
        "target": [{
            player: 'you',
            zone: 'battle',
            func: function() {
                return true;
            }
        }],
        "effect": {
            "trigger": {
                "resolve": [{
                    func: function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('increaseNinjaPower' in result.toStack)) result.toStack.increaseNinjaPower = [];
                        result.toStack.increaseNinjaPower.push({
                            card: args.target[0],
                            attack: 5,
                            support: 2,
                        });
                        return result;
                    }
                }]
            }
        }
    },
    "j890": {
        "type": "J",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "j890",
        "number": "j890",
        "elements": "E",
        "name": "Formidable Team",
        "cost": [
            ['1']
        ],
        "costText": [
            ['1']
        ],
        "effectText": "",
        "requirement": function(card, o) {
            return true;
        },
        "target": [{
            player: 'you',
            zone: 'battle',
            func: function() {
                return true;
            }
        }],
        "effect": {
            "trigger": {
                "resolve": [{
                    func: function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('increaseNinjaPower' in result.toStack)) result.toStack.increaseNinjaPower = [];
                        result.toStack.increaseNinjaPower.push({
                            card: args.target[0],
                            attack: 5,
                            support: 2,
                        });
                        return result;
                    }
                }]
            }
        }
    },
    "j504": {
        "type": "J",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "j504",
        "number": "j504",
        "elements": "W",
        "name": "Secret White Move: Chikamatsu's Ten Puppets",
        "cost": [
            ['1']
        ],
        "costText": [
            ['1']
        ],
        "effectText": "",
        "requirement": function(card, o) {
            return true;
        },
        "target": [{
            player: 'you',
            zone: 'battle',
            func: function() {
                return true;
            }
        }],
        "effect": {
            "trigger": {
                "resolve": [{
                    func: function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('increaseNinjaPower' in result.toStack)) result.toStack.increaseNinjaPower = [];
                        result.toStack.increaseNinjaPower.push({
                            card: args.target[0],
                            attack: 5,
                            support: 2,
                        });
                        return result;
                    }
                }]
            }
        }
    },
    "j447": {
        "type": "J",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "j447",
        "number": "j447",
        "elements": "W",
        "name": "Substitution by puppet",
        "cost": [
            ['1']
        ],
        "costText": [
            ['1']
        ],
        "effectText": "",
        "requirement": function(card, o) {
            return true;
        },
        "target": [{
            player: 'you',
            zone: 'battle',
            func: function() {
                return true;
            }
        }],
        "effect": {
            "trigger": {
                "resolve": [{
                    func: function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('increaseNinjaPower' in result.toStack)) result.toStack.increaseNinjaPower = [];
                        result.toStack.increaseNinjaPower.push({
                            card: args.target[0],
                            attack: 5,
                            support: 2,
                        });
                        return result;
                    }
                }]
            }
        }
    },
    "j631": {
        "type": "J",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "j631",
        "number": "j631",
        "elements": "W",
        "name": "Wind Scythe jutsu",
        "cost": [
            ['1']
        ],
        "costText": [
            ['1']
        ],
        "effectText": "",
        "requirement": function(card, o) {
            return true;
        },
        "target": [{
            player: 'you',
            zone: 'battle',
            func: function() {
                return true;
            }
        }],
        "effect": {
            "trigger": {
                "resolve": [{
                    func: function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('increaseNinjaPower' in result.toStack)) result.toStack.increaseNinjaPower = [];
                        result.toStack.increaseNinjaPower.push({
                            card: args.target[0],
                            attack: 5,
                            support: 2,
                        });
                        return result;
                    }
                }]
            }
        }
    },
    "j914": {
        "type": "J",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "j914",
        "number": "j914",
        "elements": "W",
        "name": "WindStyle: Pressure Damage",
        "cost": [
            ['1']
        ],
        "costText": [
            ['1']
        ],
        "effectText": "",
        "requirement": function(card, o) {
            return true;
        },
        "target": [{
            player: 'you',
            zone: 'battle',
            func: function() {
                return true;
            }
        }],
        "effect": {
            "trigger": {
                "resolve": [{
                    func: function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('increaseNinjaPower' in result.toStack)) result.toStack.increaseNinjaPower = [];
                        result.toStack.increaseNinjaPower.push({
                            card: args.target[0],
                            attack: 5,
                            support: 2,
                        });
                        return result;
                    }
                }]
            }
        }
    },
    "j100": {
        "type": "J",
        "ec": 0,
        "hc": 0,
        "ah": 3,
        "sh": 0,
        "ai": 2,
        "si": 0,
        "img": "j100",
        "number": "j100",
        "elements": "W",
        "name": "Sand burai",
        "cost": [
            ['1']
        ],
        "costText": [
            ['1']
        ],
        "effectText": "",
        "requirement": function(card, o) {
            return true;
        },
        "target": [{
            player: 'you',
            zone: 'battle',
            func: function() {
                return true;
            }
        }],
        "effect": {
            "trigger": {
                "resolve": [{
                    func: function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('increaseNinjaPower' in result.toStack)) result.toStack.increaseNinjaPower = [];
                        result.toStack.increaseNinjaPower.push({
                            card: args.target[0],
                            attack: 5,
                            support: 2,
                        });
                        return result;
                    }
                }]
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
        "effectText": {
            "effectName": "Внутрення сила",
            "effects": [{
                "effect": "Этот ниндзя получает +1/+0 за каждую вашу поятонную миссию в игре.",
                "valid": true
            }, {
                "when": ["Обмен техниками"],
                "cost": "Переместите постоянную миссию под вашим контролев вниз вашей колоды",
                "effect": "Этот ниндзя получает +2/+0 до конца хода.",
            }]
        },
        "effect": {
            "static": { // подконтрольная облась powerNinja
                "selfPower": [{
                    "condition": function(args, o) {
                        return Actions.cardPath({
                            card: args.self,
                            path: {
                                players: [o.Known[o.Accordance[args.self]].owner],
                                zones: ['village', 'attack', 'block']
                            }
                        }, o);
                    },
                    "getPowerMod": function(args, o) {
                        var result = {
                            attack: 0,
                            support: 0,
                        }
                        result.attack = o.S[o.Known[o.Accordance[args.self]].owner].mission.length;
                        return result;
                    }
                }]
            },
            "activate": [{
                "can": function(args, o) {
                    var owner = o.Known[o.Accordance[args.card]].owner;
                    console.log(owner, args)
                    var dict = [
                        ['Вы не контролируете эту карту.',
                            function() {if (!module) {return you == owner} else return true;}
                        ],
                        ['Применяеться только в фазу обмена техник.',
                            function() {return o.S.phase == "jutsu";}
                        ],
                        ['У вас нет мисси для уплаты цены эффекта.',
                            function() {return o.S[owner].mission.length;}
                        ],
                        ['Вы уже испоользовали эту способность.',
                            function() {
                                return !(o.S.statuses[args.card] 
                                && o.S.statuses[args.card].atEndOfTurn 
                                && o.S.statuses[args.card].atEndOfTurn.activateUsed0)}
                        ],
                        ['Ниндзя должен находиться в игре.',
                            function() {
                                return Actions.cardPath({
                                    card: args.card,
                                    path : {players: [owner],
                                    zones: ['village','attack','block']}
                                    }, o)
                            }
                        ]
                    ]
                    return Actions.canCheckDict(dict);

                },
                "prepareEffect": function(args, o) {
                    if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
                    if (!('atEndOfTurn' in o.S.statuses)) o.S.statuses[args.card].atEndOfTurn = {};
                    o.S.statuses[args.card].atEndOfTurn.activateUsed0 = true; 

                    result = {
                        'prepareEffect': [{
                            pX: o.Known[o.Accordance[args.card]].owner,
                            card: args.card,
                            effectType: 'activate',
                            effectKey: 0
                        }]
                    }
                    return result;
                },
                "question" : function(args, o) {
                    if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
                    if (!('atEndOfTurn' in o.S.statuses)) o.S.statuses[args.card].atEndOfTurn = {};
                    o.S.statuses[args.card].atEndOfTurn.activateUsed0 = true; 

                    if (args.pX == you) {
                        AN.stop = true;
                        if (!('primal' in Answers)) Answers.primal = {};
                        if (!('cardEffect' in Answers.primal)) Answers.primal.cardEffect = [];

                        var owner = o.Known[o.Accordance[args.card]].owner;
                        var condidateCount = Actions.getCardForCondition({
                            path: {
                                players: [owner],
                                zones: ['mission']
                            }
                        }, o);
                        $('#noir').css('width', I.W).css('height', I.H).html('<br>Выберите миссию для уплаты цены эффекта.');
                        for (var i in condidateCount) {
                            C[condidateCount[i]].setZIndex(1202);
                        }

                        Context.workingUnit = 'card';
                        Context.clickAction = function(card) {
                            args.selectedCard = card.id;
                            Answers.primal.cardEffect.push(args);
                            AN.hideNoir({
                                condidateCount: condidateCount
                            });
                            AN.preStack.countDown();
                        }
                    } else {
                        AN.preStack.countDown();
                    }
                },
                "cardEffect": function(result, args, o) {
                    // console.log('args'.red)
                    // console.log(args)

                    if (!('adMoveCardToZone' in result)) result.adMoveCardToZone = [];
                    result.adMoveCardToZone.push({
                        pX: o.Known[o.Accordance[args.selectedCard]].owner,
                        card: args.selectedCard,
                        cause: 'cardEffect',
                        from: 'mission',
                        to: 'deck',
                        team: null
                    })
                    if (!('increaseNinjaPower' in result)) result.increaseNinjaPower = [];
                    result.increaseNinjaPower.push({
                        card: args.card,
                        attack : 2,
                        support : 0
                    })
                    return result;
                }
            }]
        }
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
        "effectText": {
            "effectName": "План зашиты",
            "effects": [{
                "effect": "Когда 1 из ваших постоянных миссий земли должны  быть перемещены в из игры  под действием эффекта, вы можете переместить этого ниндзя в вашу чакру в этом случае переместит эту миссию в вашу руку. ",
            }]
        },
        "effect": {
            "trigger": {
                "instedMoveCardToZone": [{
                    "condition": function(args, o) {
                        var mission = o.Known[o.Accordance[args.card]]; 
                        if (mission.type == 'M'
                            && ~mission.elements.indexOf('E')
                            && args.from == "mission"
                            && args.cause == "discardMission"
                        ) {
                            return true;
                        }
                        return false;
                   
                    },
                    "conditionSelf": function(args, o) {
                        return Actions.cardPath({
                            card: args.card,
                            path: {
                                players: [o.Known[o.Accordance[args.card]].owner],
                                zones: ['village', 'attack', 'block']
                            }
                        }, o)
                    },
                    "ciclingCheck": function(args, o) {
                        return o.S.turnNumber + args.card + args.actionArgs.card;
                    },
                    "resultChange": function(result, args, o) {
                        result = {
                            'prepareEffect': [{
                                pX: o.Known[o.Accordance[args.card]].owner,
                                card: args.card,
                                effectType: 'trigger',
                                trigger: 'instedMoveCardToZone',
                                effectKey: 0,
                                actionArgs: args.actionArgs 
                            }]
                        }
                        console.log(result);
                        return result;
                    },
                    "question" : function(args, o) {
                        if (args.pX == you) {
                            AN.stop = true;
                            if (!('primal' in Answers)) Answers.primal = {};
                            if (!('cardEffect' in Answers)) Answers.primal.cardEffect = [];
                            var condidateCount = [];
                            $('#noir').css('width', I.W).css('height', I.H).html('Вы можете переместить этого ниндзя в вашу чакру в этом случае переместит эту миссию в вашу руку.');

                            var condidateCount = [args.card, args.actionArgs.card];
                            C[args.card].setZIndex(1202);
                            C[args.actionArgs.card].setZIndex(1202);
                            AN.selectFromTwo({
                                card1 : args.card,
                                card2 : args.actionArgs.card,
                                text1 : 'Сбросить этого ниндзя и вернуть миссию в руку.',
                                text2 : 'Переместить миссию как обычно.'
                            })
                            Context.workingUnit = 'card';
                            Context.clickAction = function(card) {
                                if (card.id == args.card) {
                                   args.useEffect = true; 
                                }
                                else {
                                   args.useEffect = false; 
                                }
                                Answers.primal.cardEffect.push(args)
                                AN.hideNoir({
                                    condidateCount: condidateCount
                                });
                                AN.preStack.countDown();
                            }
                        } else {
                            AN.preStack.countDown();
                        }
                    },
                    "cardEffect": function(result, args, o) {
                        if (args.useEffect) {
                            if (!('adMoveCardToZone' in result)) result.adMoveCardToZone = [];
                            result.adMoveCardToZone.push({
                                pX: args.actionArgs.pX,
                                card: args.card,
                                cause: 'cardEffect',
                                from: Actions.cardPath({
                                    card: args.card,
                                    path: {
                                        zones: ['village', 'attack', 'block'],
                                        players: [args.actionArgs.pX]
                                    }
                                }).zone,
                                to: 'chackra',
                                team: null
                            });
                            result.adMoveCardToZone.push({
                                pX: args.actionArgs.pX,
                                card: args.actionArgs.card,
                                cause: 'cardEffect',
                                from: args.actionArgs.zone,
                                to: 'hand',
                                team: null
                            });
                        }
                        else {
                            if (!('adMoveCardToZone' in result)) result.adMoveCardToZone = [];
                            result.adMoveCardToZone.push(args.actionArgs);
                        }
                    }
                }]
            }
        }
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": {
            "effectName": "Воля защищаь",
            "effects": [{
                "effect": "Когда вы кладетеде постоянную мисию земли с жетонами, вы можете положить на нее один дополнительный жетон.",
            }]
        },
        "effect": {
            "trigger": {
                "afterMoveCardToZone": [{
                    "condition": function(args, o) {
                        var mission = o.Known[o.Accordance[args.card]]; 
                        if (mission.type == 'M'
                            && ~mission.elements.indexOf('E')
                            && args.from == "stack"
                            && args.cause == "resolveJutsuFromStack"
                            && (mission.effect.permanent
                                && mission.effect.permanent !== true)
                        ) {
                            return true;
                        }
                        console.log(args)
                        console.log(mission.type == 'M'
                            , ~mission.elements.indexOf('E')
                            , args.from == "stack"
                            , args.cause == "resolveJutsuFromStack"
                            , mission.effect.permanent
                            , mission.effect.permanent !== true)
                        return false;
                   
                    },
                    "conditionSelf": function(args, o) {
                        return Actions.cardPath({
                            card: args.card,
                            path: {
                                players: [o.Known[o.Accordance[args.card]].owner],
                                zones: ['village', 'attack', 'block']
                            }
                        }, o)
                    },
                    "ciclingCheck": function(args, o) {
                        return o.S.turnNumber + args.card + args.actionArgs.card;
                    },
                    "resultChange": function(result, args, o) {
                        if(!('toStack' in result)) result.toStack = {};
                        if(!('prepareEffect' in result.toStack)) result.toStack.prepareEffect = [];
                        result.toStack.prepareEffect.push({
                            pX: o.Known[o.Accordance[args.card]].owner,
                            card: args.card,
                            effectType: 'trigger',
                            trigger: 'afterMoveCardToZone',
                            effectKey: 0,
                            actionArgs: args.actionArgs
                        })

                    console.log('resultChange'.bold.yellow)
                    console.log(result)
                        return result;
                    },
                    "question" : function(args, o) {
                        //TODO добавить анимацию отрабатывания эффекта
                        var mission = args.actionArgs.card;
                        if (o.S.statuses[mission]
                            && o.S.statuses[mission].permanent
                            && o.S.statuses[mission].permanent !== true
                        ) {
                            o.S.statuses[mission].permanent++;
                        }
                        var timer = 1;
                        if (C[mission]) {
                            C[mission].changePermanentCounter()
                            timer = 260;
                        }
                        setTimeout(AN.preStack.countDown, timer);
                    },
                }]
            }
        }
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
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
        "effectText": "",
        "effect": {}
    },
    "m466": {
        "type": "M",
        "ec": 1,
        "hc": 1,
        "img": "m466",
        "number": "m466",
        "elements": "E",
        "name": "=== Lunchbox ===",
        "effectText": {
            "effects": [{
                "effect": "Пстоянная 2"
            }, {
                "effect": "Когда эффект это мисси применяеться, возьмите 1 карту."
            }, {
                "effect": "Ваши ниндзя получают +1/+1."
            }]
        },
        "effect": {
            "permanent": 2,
            "trigger": {
                "resolve": [{
                    "func": function(result, args, o) {
                        console.log(args)
                        if (!('toStack' in result)) result.toStack = {};

                        if (!('drawCard' in result.toStack)) result.toStack.drawCard = [];
                        result.toStack.drawCard.push({
                            player: args.owner,
                            numberOfCard: 1,
                            drawCardCause: 'cardeffect'
                        });

                        if (!('applyUpd' in result.toStack)) result.toStack.applyUpd = [];
                        result.toStack.applyUpd.push({
                            forPlayer: args.owner,
                            cards: [o.S[args.owner].deck[0], o.S[args.owner].deck[1]]
                        })

                        return result;
                    }
                }]
            },
            "static": { // подконтрольная облась powerNinja
                "powerNinja": [{
                    "condition": function(args, o) {
                        return Actions.cardPath({
                            card: args.card,
                            path: {
                                players: [o.Known[o.Accordance[args.self]].owner],
                                zones: ['village', 'attack', 'block']
                            }
                        }, o);
                    },
                    "conditionSelf": function(args, o) {
                        return Actions.cardPath({
                            card: args.self,
                            path: {
                                players: [o.Known[o.Accordance[args.self]].owner],
                                zones: ['mission']
                            }
                        }, o);
                    },
                    "powerMod": {
                        attack: 1,
                        support: 1,
                    }
                }]
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
        "name": "=== BBQ House ===",
        "effectText": {
            "effects": [{
                "effect": "Пстоянная 3"
            }, {
                "effect": "В конце каждого хода, в котором ваш оппонент выигрываете или получает 1 или более боевых наград, он должен сбросить 1 карт из своей руки."
            }]
        },
        "effect": {
            "permanent": 3,
            "trigger": {
                "atEndOfTurn": [{
                    "func": function(result, args, o) {
                        console.log("atEndOfTurn".yellow)
                        console.log(args)

                        var owner = o.Known[o.Accordance[args.card]].owner;
                        var opp = owner == 'pA' ? 'pB' : 'pA';

                        if (!('afterQuestion' in result)) result.afterQuestion = [];

                        result.afterQuestion.push({
                            question : 'discardCardFromHand',
                            pX: opp,
                            numberOfCard: 1,
                            cause: 'cardeffect'
                        });

                        return result;
                    },
                    "conditionSelf": function(args, o) {
                        var owner = o.Known[o.Accordance[args.card]].owner;
                        var opp = owner == 'pA' ? 'pB' : 'pA';
                        if (!o.S[opp].counters.getBattleRewards.length) return false;
                        return Actions.cardPath({
                            card: args.card,
                            path: {
                                players: [owner],
                                zones: ['mission']
                            }
                        }, o);
                    }
                }]
            }
        }
    },
    "m673": {
        "type": "M",
        "ec": 1,
        "hc": 1,
        "img": "m673",
        "number": "m673",
        "elements": "E",
        "name": "=== Student and Sensei ===",
        "effectText": {
            "effects": [{
                "effect": "Ваш оппонент получает 1 боевую награду. В этом случае возьмите 2 карты."
            }]
        },
        "effect": {
            "trigger": {
                "resolve": [{
                    "func": function(result, args, o) {
                        console.log(args)
                        if (!('toStack' in result)) result.toStack = {};


                        if (!('givingReward' in result.toStack)) result.toStack.givingReward = [];
                        result.toStack.givingReward.push({
                            pX: args.owner == 'pA' ? 'pB' : 'pA',
                            zone: 'stack',
                            card: args.card,
                            rewardsCount: 1,
                            causeOfReward: 'effectOfcard'
                        })

                        if (!('drawCard' in result.toStack)) result.toStack.drawCard = [];
                        result.toStack.drawCard.push({
                            player: args.owner,
                            numberOfCard: 2,
                            drawCardCause: 'cardeffect'
                        });

                        if (!('applyUpd' in result.toStack)) result.toStack.applyUpd = [];
                        result.toStack.applyUpd.push({
                            forPlayer: args.owner,
                            cards: [o.S[args.owner].deck[0], o.S[args.owner].deck[1]]
                        })

                        return result;
                    }
                }]
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
        "name": "=== After the battle ===",
        "effectText": {
            "effects": [{
                "effect": "Сбросьте карту, в этом случае возьмите 3 карты."
            }]
        },
        "effect": {
            "trigger": {
                "resolve": [{
                    "func": function(result, args, o) {
                        if (!('toStack' in result)) result.toStack = {};
                        if (!('prepareCardEffect' in result.toStack)) result.toStack.prepareEffect = [];
                        result.toStack.prepareEffect.push({
                            pX: args.owner + '',
                            card: args.card,
                            effectType: 'trigger',
                            trigger: 'resolve',
                            effectKey: 0
                        });
                        return result;
                    },
                    "question": function(args, o) {
                        if (args.pX == you) {
                            AN.stop = true;
                            if (!('cardEffect' in Answers)) Answers.cardEffect = [];
                            var condidateCount = [];
                            $('#noir').css('width', I.W).css('height', I.H).html('Выберите карту для сброса.');
                            AN.moveToPreview({
                                pX: args.pX
                            });
                            Card.moveToPreviewToHandBlocker = true;

                            var condidateCount = [];
                            for (var i in S[args.pX].hand) {
                                var cardId = S[args.pX].hand[i];
                                console.log(' + '+cardId)
                                if (true) {
                                    condidateCount.push(cardId);
                                    C[cardId].setZIndex(1202);
                                }
                            }
                            // Context.workingUnit = 'card';
                            Context.clickAction = function(card) {
                                args.discartedCard = card.id;
                                Answers.cardEffect.push(args)
                                AN.hideNoir({
                                    condidateCount: condidateCount
                                });
                                Card.moveToPreviewToHandBlocker = false;
                                AN.preStack.countDown();
                            }
                        } else {
                            AN.preStack.countDown();
                        }
                    },
                    "cardEffect": function(result, args, o) {

                        if (!('drawCard' in result)) result.drawCard = [];
                        result.drawCard.push({
                            player: args.pX,
                            numberOfCard: 3,
                            drawCardCause: 'cardeffect'
                        });

                        if (!('applyUpd' in result)) result.applyUpd = [];
                        var topDeck = [];
                        for (var i = 0; i <= 2; i++) {
                            topDeck.push(o.S[args.pX].deck[0])
                            var topArrgs = {
                                pX: args.pX,
                                card: o.S[args.pX].deck[0],
                                cause: 'effectOfcard',
                                from: 'deck',
                                to: 'hand',
                                team: null
                            }
                            Actions.moveCardToZone(topArrgs, o);
                        }
                        result.applyUpd.push({
                            forPlayer: args.pX,
                            cards: topDeck
                        })

                        if (!('moveCardToZone' in result)) result.moveCardToZone = [];
                        var moveArgs = {
                            pX: args.pX,
                            card: args.discartedCard,
                            cause: 'effectOfcard',
                            from: 'hand',
                            to: 'discard',
                            team: null
                        }
                        Actions.moveCardToZone(moveArgs, o);
                        result.moveCardToZone.push(moveArgs);

                    }
                }]
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
        "effectText": {
            "effects": [{
                "effect": "Пстоянная 3"
            }, {
                "effect": "Ваши ниндзя с 'Тень' получают +1/+1 и +2 к ментальной силе."
            }, {
                "when": ["Обмен техниками"],
                "cost": "E1",
                "effect": "Ваша целевая команада с ниндзя с 'Тень' и сражающася против нее команда (если такая есть) вступают в ментальную битву на этапе полсчета.",
            }]
        },
        "effect": {
            "permanent": 3
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
        "effectText": {
            "effects": [{
                "effect": "Пстоянная"
            }, {
                "when": "Атакующий, Фаза миссии",
                "cost": "Выберите тип карты. Затем откройте верхнюю карту вашей колоды.",
                "effect": "Если открытая карта имеет загаданный вами тип, положите ее в свою руку.",
            }]
        },
        "effect": {
            "permanent": true,
            "activate": [{
                "can": function(args, o) {
                    var owner = o.Known[o.Accordance[args.card]].owner;
                    console.log(owner, args)
                    var dict = [
                        ['Вы не контролируете эту карту.',
                            function() {if (!module) {return you == owner} else return true;}
                        ],
                        ['Применяеться только в ваш ход.',
                            function() {
                                if (!module) return o.S.activePlayer == owner && o.S.activePlayer == you
                                return o.S.activePlayer == owner}
                        ],
                        ['Применяеться только в фазу миссии.',
                            function() {return o.S.phase == "mission" }
                        ],
                        ['Вы уже испоользовали эту способность.',
                            function() {
                                return !(o.S.statuses[args.card] 
                                && o.S.statuses[args.card].atEndOfTurn 
                                && o.S.statuses[args.card].atEndOfTurn.activateUsed0)}
                        ],
                        ['Миссия должна находиться в игре.',
                            function() {
                                return Actions.cardPath({
                                    card: args.card,
                                    path : {players: [owner],
                                    zones: ['mission']}
                                    }, o)
                            }
                        ]
                    ]
                    return Actions.canCheckDict(dict);

                },
                "prepareEffect": function(args, o) {
                    if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
                    if (!('atEndOfTurn' in o.S.statuses)) o.S.statuses[args.card].atEndOfTurn = {};
                    o.S.statuses[args.card].atEndOfTurn.activateUsed0 = true; 

                    result = {
                        'prepareEffect': [{
                            pX: o.Known[o.Accordance[args.card]].owner,
                            card: args.card,
                            effectType: 'activate',
                            effectKey: 0
                        }]
                    }
                    return result;
                },
                "question" : function(args, o) {
                    if (!(args.card in o.S.statuses)) o.S.statuses[args.card] = {};
                    if (!('atEndOfTurn' in o.S.statuses)) o.S.statuses[args.card].atEndOfTurn = {};
                    o.S.statuses[args.card].atEndOfTurn.activateUsed0 = true; 

                    if (args.pX == you) {
                        AN.stop = true;
                        if (!('primal' in Answers)) Answers.primal = {};
                        if (!('cardEffect' in Answers.primal)) Answers.primal.cardEffect = [];
                        var condidateCount = [];
                        $('#noir').css('width', I.W).css('height', I.H).html('<br>Выберите тип карты.');                       
                        var clickFunction = function(type){
                            var type = type;
                            return function() {
                                args.selectedType = type;
                                Answers.primal.cardEffect.push(args)
                                AN.hideNoir({
                                    condidateCount: []
                                });
                                AN.preStack.countDown();                                
                            }
                        }

                        AN.selectFromThree({
                            'text1': 'Ниндзя',
                            'func1': clickFunction('N'),
                            'text2': 'Техника',
                            'func2': clickFunction('J'),
                            'text3': 'Миссия',
                            'func3': clickFunction('M')
                        });
                    } else {
                        AN.preStack.countDown();
                    }
                },
                "cardEffect": function(result, args, o) {
                    // console.log('args'.red)
                    // console.log(args)
                    if (!('applyUpd' in result)) result.applyUpd = [];
                    result.applyUpd.push({
                        forPlayer: 'pA',
                        cards: [o.S[args.pX].deck[0]]
                    })
                    result.applyUpd.push({
                        forPlayer: 'pB',
                        cards: [o.S[args.pX].deck[0]]
                    })

                    if (!('prepareEffect' in result)) result.prepareEffect = [];
                    result.prepareEffect.push({
                        pX: o.Known[o.Accordance[args.card]].owner,
                        card: args.card,
                        effectType: 'activate',
                        effectKey: 0,
                        step: 1,
                        selectedType: args.selectedType,
                        isType : o.Known[o.Accordance[o.S[args.pX].deck[0]]].type
                    })
                    return result;
                },
                "question1" : function(args, o) {                        
                    createCard({
                        id: S[args.pX].deck[0],
                        zona: 'deck',
                        owner: args.pX,
                        team: null,
                        position: null,
                        condition: 'look',
                        X : G.you.deck.X,
                        Y : G.you.deck.Y,
                        W : G.you.deck.H,
                    } )

                    C[S[args.pX].deck[0]].animation({
                        W: I.card.W * 2,
                        X: G.you.deck.X + G.you.deck.H / 2 - I.card.W,
                        Y: I.H / 2 - I.card.W
                    })  

                    if (args.pX == you) {
                        if (!('primal' in Answers)) Answers.primal = {};
                        if (!('cardEffect' in Answers.primal)) Answers.primal.cardEffect = [];
                        Answers.primal.cardEffect.push(args)

                        setTimeout( AN.preStack.countDown, 1350);
                    } else {
                        AN.preStack.countDown();
                    }
                },
                "cardEffect1": function(result, args, o) {
                    if (!('applyUpd' in result)) result.applyUpd = [];
                    result.applyUpd.push({
                        forPlayer: (args.pX == 'pA' ? 'pB' : 'pA'),
                        cards: [o.S[args.pX].deck[0]],
                        unknown : true
                    })
                    if (args.selectedType == args.isType) {
                        if (!('adMoveCardToZone' in result)) result.adMoveCardToZone = [];
                        result.adMoveCardToZone.push({
                            pX: args.pX,
                            card: o.S[args.pX].deck[0],
                            cause: 'cardEffect',
                            from: 'deck',
                            to: 'hand',
                            team: null
                        })
                    } 
                    else {
                        result.applyUpd.push({
                            forPlayer: (args.pX == 'pA' ? 'pB' : 'pA'),
                            cards: [o.S[args.pX].deck[0]],
                            unknown : true
                        })

                        if (!('prepareEffect' in result)) result.prepareEffect = [];
                        result.prepareEffect.push({
                            pX: o.Known[o.Accordance[args.card]].owner,
                            card: args.card,
                            effectType: 'activate',
                            effectKey: 0,
                            step: 2
                        })
                    }
                    return result;
                },
                "question2" : function(args, o) {
                    C[S[args.pX].deck[0]].animation({
                        W: G[args.pX == you ? 'you' : 'opp'].deck.H,
                        X: G[args.pX == you ? 'you' : 'opp'].deck.X,
                        Y: G[args.pX == you ? 'you' : 'opp'].deck.Y,
                        opacity : 0,
                        duration: 600, 
                        additional: {
                            after: {
                                func : function() {
                                    C[S[args.pX].deck[0]].destroyCard()
                                }
                            }
                        }
                        
                    }) 

                    if (args.pX == you) {
                        setTimeout( AN.preStack.countDown, 600)
                    } else {
                        AN.preStack.countDown();
                    }
                }
            }]
        }
    },
    "m424": {
        "type": "M",
        "ec": 0,
        "hc": 0,
        "img": "m424",
        "number": "m424",
        "elements": "W",
        "name": "Puppet Show",
        "effectText": {
            "effects": [{
                "effect": "Пстоянная"
            }, {
                "when": "-",
                "cost": "-",
                "effect": "-",
            }]
        },
        "effect": {}
    },
    "m843": {
        "type": "M",
        "ec": 0,
        "hc": 0,
        "img": "m843",
        "number": "m843",
        "elements": "W",
        "name": "A master's death",
        "effectText": {
            "effects": [{
                "effect": "Пстоянная"
            }, {
                "when": "-",
                "cost": "-",
                "effect": "-",
            }]
        },
        "effect": {}
    },
    "m375": {
        "type": "M",
        "ec": 0,
        "hc": 0,
        "img": "m375",
        "number": "m375",
        "elements": "W",
        "name": "Sasori if the Red Sand",
        "effectText": {
            "effects": [{
                "effect": "Пстоянная"
            }, {
                "when": "-",
                "cost": "-",
                "effect": "-",
            }]
        },
        "effect": {}
    },
    "m815": {
        "type": "M",
        "ec": 0,
        "hc": 0,
        "img": "m815",
        "number": "m815",
        "elements": "W",
        "name": "A Gift",
        "effectText": {
            "effects": [{
                "effect": "Пстоянная"
            }, {
                "when": "-",
                "cost": "-",
                "effect": "-",
            }]
        },
        "effect": {}
    },
    "m633": {
        "type": "M",
        "ec": 0,
        "hc": 0,
        "img": "m633",
        "number": "m633",
        "elements": "W",
        "name": "Loss",
        "effectText": {
            "effects": [{
                "effect": "Пстоянная"
            }, {
                "when": "-",
                "cost": "-",
                "effect": "-",
            }]
        },
        "effect": {}
    }
};
if (module) {
    module.exports = CardBase;
}
