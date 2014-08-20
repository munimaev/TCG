<h1>Лобби</h1>
<div class="row">
	<table class="table" id="tables">
	  <!-- <tr>
	    <th width="30%">#</th>
	    <th width="40%">pA</th>
	    <th width="40%">pB</th>
	  </tr> -->
	</table>
</div>
  <script src="/socket.io/socket.io.js"></script>
    <script>
      var ses = '<%=session.id%>';
      var login = '<%=session.login%>';
      var socket = io();
      var Tables = {

      }
      var user = {name:"P_5555", table:null};
      user.name = "P_" + Math.floor(Math.random() * 1000000)
      function startSession() {
        //socket.emit('hostCreateNewGame', "123");
      }

      socket.on('connected', function(d){
        console.log('c')
        socket.emit('lobby:tables',{d:'d'});
      });

      socket.on('setTables', function(d){
        var uTable = null;
        Tables = {};
        for (var i in d ) {
          if (d[i].pA == user.name || d[i].pB == user.name  ) {
            uTable = i;
          }
          if (Tables[i]) {
            for (var i2 in Tables[i]) {
              Tables[i][i2] = d[i][i2]
            }
          } else {
            Tables[i] = d[i]
          }
        }
        user.table = uTable;
        updTables();
      });

      socket.on('setGames', function(d){
        console.log(d)
      });

      function updTables() {
      	var youOnTable = false;

        for (var i in Tables) {
          if (Tables[i].pA == login || Tables[i].pA == login) {
            youOnTable = true; break;
          }
        }
        console.log(Tables)
         $('#tables').empty();
        for (var i in Tables) {
        	if (Tables[i].pA == login || Tables[i].pA == login) {
        		youOnTable = true;
        	}

          $('#tables')
          .append(
            $('<tr />', {
              "id": "table" + i
            })
          )
          

          $('#table'+i)
            .append(
              $('<td />', {
                "text": i
              })
            )
            .append(
              $('<td />')
              .append(
                $('<button />', getBtnProp(i,'pA'))
              )
            )
            .append(
              $('<td />')
              .append(
                $('<button />', getBtnProp(i,'pB'))
              )
            )
        }

        if (!youOnTable) {
          $('#tables')
          .append(
            $('<tr />', {
              "id": "tableCreateNew" 
            })
          )
          $('#tableCreateNew')
            .append(
              $('<td />', {
                "text": ''
              })
            )
            .append(
              $('<td />')
              .append(
                $('<button />', {
                	'text':'Создать',
				          "type" : "button",
				          "class": "btn btn-primary btn-sm",
				          "click":  function() {
                     socket.emit('lobby:create', {'ses':ses});
                   }
				        })
              )
            )
            .append(
              $('<td />', {
                "text": ''
              })
            )

        }
      }

      function getBtnProp(id,pX) {
        var result = {
          "text" : sitBtnText(id,pX),
          "type" : "button",
          "class": sitBtnClass(id,pX),
          "click": sitBtnClick(id,pX)
        };
        if (sitBtnDis(id,pX)) {
          result.disabled = "disabled"
        }
        return result;
      }

      function sitBtnClick(id,pX) {
        result = function() {
                    socket.emit('lobby:join', {'ses':ses, 'toTable':id});
                 }
        if (Tables[id][pX] == login) result = function() {};
        if (pX=='pB' && Tables[id]['pA'] == login) result = function() {
                    socket.emit('lobby:delete', {'ses':ses, 'table':id});
                 };
        return result;
      }

      function sitBtnText(id,pX) {
        result = "Присоединиться";
        if (Tables[id][pX]) result = Tables[id][pX];
        if (pX=='pB' && Tables[id]['pA'] == login) result = 'Отменить';
        return result;
      }

      function sitBtnDis(id,pX) {
        if (pX == 'pA'  ) {
          return true;
        }
        return false;
      }

      function sitBtnClass(id,pX) {
        if (pX == 'pA'  ) {
          return "btn btn-default btn-sm";
        }
        return "btn btn-primary btn-sm";
      }


      socket.on('sitInLobby', function(d){
        user.lobbi = d.key;
        console.log(user)
      });
      socket.on('unsitInLobby', function(d){
        user.lobbi = null;
        console.log(user);
      });
      socket.on('startGame', function(d){
        //alert(d.key)
        window.location.assign('/game')
      });

    </script>
