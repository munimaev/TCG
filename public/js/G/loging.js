LogP = 0;
LogL = '';
LogI = {
   'startTable' : 1,
   'clearS' : 1,
   'getSquareForTeam' : 0,
   'getSquareForVillage' : 0,
   'getSquareForPlayer' : 0,
   'getSquareForBattle' : 0,
   'startTablePlayer' : 0,
   'startTableBattle' : 0,
   'removeTeamPower' : 0,
   'getTeamPower' : 0,
   'getNinjaPower' : 0,
   'createteam' : 0,
   'addTeamPower' : 1,
}
LogC = null
LogT = null;
Log = function( a, name, name2 ) {

    var isLog = 0;
    if (name == 'createteam') {
      //  console.log('_' + LogC);
    }
    if (a == 0 && LogT in LogI && !LogI[LogT]) return false;
    if (!name2) LogT = name;
    if (LogT in LogI && !LogI[LogT]) return false


    var deep = '';
    var conc = '  ';
    if ( a < 0 ) {
        conc = '< ';
    }
    if ( a > 0 ) {
        conc = '> ';
    }
    if ( a > 0 ) LogP += a;
    for ( var i = 1; i <= LogP; i++ ) {
        deep += conc;
    }
    if ( a < 0 ) LogP += a;
    // if (LogL != name || a >= 0) {
    if ( name2 )
        console.log( deep, name, name2);
    else
        console.log( deep, name );
    //}
    LogL = name;

}
