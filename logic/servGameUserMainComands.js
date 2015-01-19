var exp = {};

/**
 * Функция обрабатывающая запрос от клиента. Сохраняет текщций снимок игры в файл tmp/my.json
 * @param  {[type]} d [description]
 * @return {[type]}   [description]
 */
exp.saveGame = function(d) {
	var table = StartedGames[d.u.table];
	var outputFilename = __dirname + '/tmp/my.json';
	var toSave = {
		S: table.Snapshot,
		Accordance: table.Accordance
		//K :  table.Known
	}
	fs.writeFile(outputFilename, JSON.stringify(toSave, null, 4), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("JSON saved to " + outputFilename);
		}
	});
}

module.exports = exp;
