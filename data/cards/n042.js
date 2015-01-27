var n042 = {
  "type": "N",
  "ec": 2,
  "hc": 0,
  "ah": 3,
  "sh": 0,
  "ai": 3,
  "si": 0,
  "img": "n042",
  "number": "n042",
  "elements": "E",
  "name": "Нейджи Хъюга",
  "effectText": {
    "effectName": "Ужасающий дар",
    "effects": [{
      "effect": "Вы можете положить 1 жетон тенкетсу на каждого ниндзя получившего повреждения от этой команды."
    },{
      "valid" :true,
      "effect": "Ниндзя с жетон тенкетсу не могут быть исцелены."
    }]
  },
  "statuses": [],
  "atributes": ["Ninjutsu"],
  "effect": {
    "static": {
      "selfPower": [{}]
    }
  }
}
if (module) {
  exports.card = n042;
}
