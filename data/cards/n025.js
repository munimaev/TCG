var n025 = {
  "type": "N",
  "ec": 0,
  "hc": 0,
  "ah": 1,
  "sh": 0,
  "ai": 0,
  "si": 0,
  "img": "n025",
  "number": "n025",
  "elements": "L",
  "name": "Наруто Узумаки",
  "effectText": {
    "effectName": "Чакра Девятихвостого",
    "effects": [{
      "valid": true,
      "effect": "Когда этот ниндзя ранен и отослан в сражение он получает +Х/+0 до конца хода, где Х - количесвто карт в вашей руке."
    }]
  },
  "statuses": [],
  "atributes": ["Ninjutsu"],
  "effect": {
    "static": {
      "selfPower": [{
        "condition": function(args, o) {
          return Actions.cardPath({
            card: args.self,
            path: {
              players: [o.Known[o.Accordance[args.self]].owner],
              zones: ['village', 'attack', 'block']
            }
          }, o) && Actions.getCardForCondition({
            path: {
              players: [o.Known[o.Accordance[args.self]].owner],
              zones: ['village', 'attack', 'block']
            },
            atributes: ['Manipulation'],
          }, o).length;
        },
        "getPowerMod": function(args, o) {
          var result = {
            attack: 0,
            support: 1,
          }
          if (Actions.isHealt(args.self, o)) {
            result.support = 3;
          }
          return result;
        }
      }]
    }
  }
}
if (module) {
  exports.card = n025;
}
