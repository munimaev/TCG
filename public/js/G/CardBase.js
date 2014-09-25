var CardBase = {
    "c001": {
        "owner": "pB",
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
    "c002": {
        "owner": "pB",
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
    "c003": {
        "owner": "pB",
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
        effectText : {
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
    "c004": {
        "owner": "pB",
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
        "effectText" : "",
        "effect" : {}
    },
    "c005": {
        "owner": "pB",
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
    "c006": {
        "owner": "pB",
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
    "c007": {
        "owner": "pB",
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
    "c008": {
        "owner": "pB",
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
    "c009": {
        "owner": "pB",
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
    "c015": {
        "owner": "pB",
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
    "c010": {
        "owner": "pB",
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
    "c011": {
        "owner": "pB",
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
    "c012": {
        "owner": "pB",
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
    "c013": {
        "owner": "pB",
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
    "c014": {
        "owner": "pB",
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
    "c016": {
        "owner": "pB",
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
    "c017": {
        "owner": "pB",
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
    "c018": {
        "owner": "pB",
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
    "c019": {
        "owner": "pB",
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
    "c020": {
        "owner": "pB",
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
    "c021": {
        "owner": "pB",
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
    "c022": {
        "owner": "pB",
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
    "c023": {
        "owner": "pB",
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
    "c024": {
        "owner": "pB",
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
    "c025": {
        "owner": "pB",
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
    "c026": {
        "owner": "pB",
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
    "c051": {
        "owner": "pB",
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
    "c052": {
        "owner": "pB",
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
    "c121": {
        "owner": "pA",
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
    "c122": {
        "owner": "pA",
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
    "c123": {
        "owner": "pA",
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
    "c104": {
        "owner": "pA",
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
    "c105": {
        "owner": "pA",
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
    "c106": {
        "owner": "pA",
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
    "c107": {
        "owner": "pA",
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
    "c108": {
        "owner": "pA",
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
    "c109": {
        "owner": "pA",
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
    "c110": {
        "owner": "pA",
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
    "c111": {
        "owner": "pA",
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
    "c112": {
        "owner": "pA",
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
    "c113": {
        "owner": "pA",
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
    "c114": {
        "owner": "pA",
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
    "c115": {
        "owner": "pA",
        "type": "N",
        "ec": 3,
        "hc": 0,
        "ah": 4,
        "sh": 3,
        "ai": 1,
        "si": 1,
        "img": "n1366",
        "number": "n1366",
        "elements": "E",
        "name": "Foo",
        "effectText" : "",
        "effect" : {}
    },
    "c116": {
        "owner": "pA",
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
    "c117": {
        "owner": "pA",
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
    "c118": {
        "owner": "pA",
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
    "c119": {
        "owner": "pA",
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
    "c120": {
        "owner": "pA",
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
    "c101": {
        "owner": "pA",
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
    "c102": {
        "owner": "pA",
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
    "c103": {
        "owner": "pA",
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
    }
};
if (module) {
    module.exports = CardBase;
}




