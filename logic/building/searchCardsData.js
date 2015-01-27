var fs;

exports.initialize = function(_fs) {
	fs = _fs;
}

var path = 'data/cards';

function getDataForSearchFromFile(card) {
	// var obj = JSON.parse(fs.readFileSync());
	var file = require('../../'+path + '/' + card, 'utf8');
	var obj = file['card'];
	var res = {};
	res.type = obj.type;
	if (res.type !== 'J') {
		res.hc = obj.hc;
		res.ec = obj.ec;
	}
	else {
		res.cost = obj.cost;
	}
	if (res.type === 'N') {
		res.ai = obj.ai;
		res.ah = obj.ah;
		res.sh = obj.sh;
		res.si = obj.si;
	}

	res.img = obj.img;
    res.number = obj.number;
    res.elements = obj.elements;
    res.name = obj.name;


    res.effectText = {};
    res.effectText.effectName = obj.effectText.effectName;
    res.effectText.effects = [];
    for (var i in obj.effectText.effects) {
    	var effect = {};
    	for (var j in obj.effectText.effects[i]) {
    		effect[j] = obj.effectText.effects[i][j];
    	}
    	res.effectText.effects.push(effect);
    }

    res.statuses = [].concat(obj.statuses);
    res.atributes =  [].concat(obj.atributes);

	return res;
}


function rebuild() {
	cardsFiles = fs.readdirSync('./'+path);
	var data = {};
	for (var file in cardsFiles) {
		var card = cardsFiles[file];
		data[card] = getDataForSearchFromFile(card);
	}
	var outputFilename = './public/js/searchCardBase.js';
	fs.writeFile(outputFilename, 'var CardBase = ' + JSON.stringify(data, null, 0), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("searchCardData saved to " + outputFilename);
		}
	});

	//throw new Error('er')
}
exports.rebuild = rebuild;
