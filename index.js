//それぞれ変数の定義(websocket必須)
var WebSocketServer = require("ws").Server;		//websocket
var http = require("http");						//http
var express = require("express");				//express
var app = express();							//appという名のexpress
var port = process.env.PORT || 5000;			//ポート


//付け加え変数定義
var connections = [];							//Websocket接続の保存用配列

//付け加え
var pc1, pc2, pc3, tablet1, tablet2, tablet3;	//接続状態の記録

//expressモジュールからhttpサーバを作成し、wsモジュールのseverの引数にし、websocket用サーバオブジェクトを作成
app.use(express.static(__dirname + "/"));
var server = http.createServer(app);

//ポートにwebsocketサーバを立てる
server.listen(port);
var wss = new WebSocketServer({server: server});

//console表示　※ポート番号は毎回変わる
//console.log("コンソール：http server listening on %d", port);
//console.log("コンソール：websocket server created");

//島田追加------------------------------------------------------------------------------
// var db = require("./db");
// var async = require("async");
var mysql = require('mysql');
var db_connection;	//mysqlの接続
//接続設定の用意
var dbConfig = {
 host : 'us-cdbr-iron-east-04.cleardb.net',
 user : 'b823897b16dff2',
 password : '43ac4401',
 database : 'heroku_26dd74052841cb5'
};

dbConnect();


//クライアントと接続すると動作するイベント
wss.on("connection", function(ws) {
	console.log("コンソール：websocket connection open");
	//接続時のメッセージ
	var id = setInterval(function() {
		//時間データのsend JSON.stringify(xxx)が、クライアントのJSON.parse(event.data)に相当
		ws.send(JSON.stringify({
			type: 'ping',
			text: new Date()
		}), function() {}) 
	}, 1000);	//1000ms(1秒)ごとに送信
	
	//websocketクローズ処理
	ws.on("close", function() {
		console.log("コンソール：websocket connection close");
		clearInterval(id);
	});
	
	//配列にWebSocket接続を保存
	connections.push(ws);

	//メッセージ送信時
	ws.on('message', function (message) {
//		悪の根源：broadcast(JSON.stringify(message));

		//メッセージはそのままクライアントに送り返す
		broadcast(message);
		
		//#####typeがpingなら#####
		if(JSON.parse(message).type == "ping"){
		
		//#####typeがconnectなら#####
		} else if(JSON.parse(message).type == "connect"){
			connect(JSON.parse(message).user, JSON.parse(message).text);
			
		//#####typeがchatなら#####
		} else if(JSON.parse(message).type == "chat"){

		//#####typeがtrainingなら#####
		}else if(JSON.parse(message).type == "training"){
		
		}

// 島田追加-------------------------------------------------------------------
		else if(JSON.parse(message).type == "db_access"){
			// var rows = db.countActors(1);
			var funcName = JSON.parse(message).func_name;
			// if(methodName == "actorListBySceneID"){
			// actorListBySceneID(JSON.parse(message).script_id);
			// };

			//ここらへんにクエリの実行のデバッグ用の記述
			var i = 1;
			var script_id = JSON.parse(message).script_id;
			// var actor_id = JSON.parse(message).actor_id;


			//JSONのfunc_nameで呼び出すメソッドを分岐
			if(funcName == "countActorOfScriptID"){
				//[object Object]
				countActorOfScriptID(script_id);
			}else if(funcName == "actorListBySceneID"){
				//正常に名前まで出力されることを確認
				actorListBySceneID(script_id);
			}else if(funcName == "readScriptTitleByID"){
				//[object Object]
				readScriptTitleByID(script_id);
			}else if(funcName == "readScriptSceneTitleByID"){
				readScriptSceneTitleByID(script_id);				
			}else if(funcName == "readActorNameBySceneAndID"){
				var actor_id = JSON.parse(message).actor_id;
				readActorNameBySceneAndID(script_id, actor_id);				
			}else if(funcName == "readActionTimingDataByScriptID"){
				readActionTimingDataByScriptID(script_id);				
			}else if(funcName == "readWhoIsActionDataByScriptID"){
				readWhoIsActionDataByScriptID(script_id);			
			}else if(funcName == "readActionImageDataByScriptID"){
				readActionImageDataByScriptID(script_id);			
			}else if(funcName == "readWhoIsScriptDataByScene"){
				readWhoIsScriptDataByScene(script_id);			
			}else if(funcName == "readLinesScriptDataByScene"){
				readLinesScriptDataByScene(script_id);
			}else if(funcName == "readTimingScriptDataByScene"){
				readTimingScriptDataByScene(script_id);
			}else {
				broadcast(JSON.stringify({user: '', type: 'other', text: 'No Such Method' }));
			}

			// getScriptIDBySceneTitle("scene_title");
			// getActorIDByActorName("name");


		}
	
//---------------------------------------------------------------------------


    });
	
})

//ブロードキャスト(メッセージの送信処理)を行う
function broadcast(b_message) {
	connections.forEach(function (con, i) {
		con.send(b_message);
	});
};

//接続系
function connect(s_user, s_text){
	var connect_message;
	
	//オープン処理
	if(s_text == "open"){
		//デバイスが登録されているかチェック
		if(pc1 == 1){
			connect_message = JSON.stringify({user: 'PC.1', type: 'connect', text: 'open_device' });
			broadcast(connect_message);
		}
		if(pc2 == 1){
			connect_message = JSON.stringify({user: 'PC.2', type: 'connect', text: 'open_device' });
			broadcast(connect_message);
		}
		if(pc3 == 1){
			connect_message = JSON.stringify({user: 'PC.3', type: 'connect', text: 'open_device' });
			broadcast(connect_message);
		}
		if(tablet1 == 1){
			connect_message = JSON.stringify({user: 'TABLET.1', type: 'connect', text: 'open_device' });
			broadcast(connect_message);
		}
		if(tablet2 == 1){
			connect_message = JSON.stringify({user: 'TABLET.2', type: 'connect', text: 'open_device' });
			broadcast(connect_message);
		}
		if(tablet3 == 1){
			connect_message = JSON.stringify({user: 'TABLET.3', type: 'connect', text: 'open_device' });
			broadcast(connect_message);
		}


	//クローズ処理
	} else if(s_text == "close"){
		console.log(s_user + "がクローズした");
	
	//デバイス登録
	} else if(s_text == "PC.1"){
		pc1 = 1;
		console.log('サーバがPC1をにんしき');
	} else if(s_text == "PC.2"){
		pc2 = 1;
	} else if(s_text == "PC.3"){
		pc3 = 1;
	} else if(s_text == "TABLET.1"){
		tablet1 = 1;
	} else if(s_text == "TABLET.2"){
		tablet2 = 1;
	} else if(s_text == "TABLET.3"){
		tablet3 = 1;
	}
	

};


//以下DBから情報を取ってくるメソッド定義*************************************

function dbConnect(){	//データベースに接続
	db_connection = mysql.createConnection(dbConfig);
	db_connection.connect();
	console.log('MySQLに接続');
	db_connection.ping(function (err) {
  if (err) throw err;
  console.log('Server responded to ping');
});
}

function dbClose(){
	console.log('Database Connection Closed');
	db_connection.end();
}

function countActorOfScriptID(script_id){
	var dbscript_id = script_id + 1;
	var sql = "select count(script_id) from actor where script_id=" + dbscript_id;
	// var sql = "select count(script_id) from actor where script_id=1";
	db_connection.query(sql, function(err, result, fields) {
		if(err) throw err;
			console.log("countActorOfScriptID: "); 
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'countActorOfScriptID', type: 'db_result', text: result});
		broadcast(database_data);
	});
}

function actorListBySceneID(script_id){
	script_id++;
	var sql = "select actor_name from actor where script_id = " + script_id;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
			console.log("actorListBySceneID: ");
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'actorListBySceneID', type: 'db_result', text: result});
		broadcast(database_data);
	});
}

function getScriptIDBySceneTitle(scene){
	var sql = "select id from info where scene = " + scene;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
			console.log("getScriptIDBySceneTitle: ");
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'getScriptIDBySceneTitle', type: 'db_result', text: result});
		broadcast(database_data);
	});
}

function getActorIDByActorName(name){
	var sql = "select actor_id from actor where actor_name = " + name;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
			console.log("getActorIDByActorName: ");
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'getActorIDByActorName', type: 'db_result', text: result});
		broadcast(database_data);
	});
}

function readScriptTitleByID(script_id){
	script_id++;
	var sql = "select title from info where id = " + script_id;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
			console.log("readScriptTitleByID: ");
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'readScriptTitleByID', type: 'db_result', text: result});
		broadcast(database_data);
	});
}

function readScriptSceneTitleByID(script_id){
	script_id++;
	var sql = "select scene from info where id = " + script_id;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
			console.log("readScriptSceneTitleByID: ");
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'readScriptSceneTitleByID', type: 'db_result', text: result});
		broadcast(database_data);
	});
}

function readActorNameBySceneAndID(script_id, actor_id){
	script_id++;
	actor_id++;
	var sql = "select actor_name from actor where script_id = " + script_id + " and actor_id = " + actor_id;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
			console.log("readActorNameBySceneAndID: ");
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'readActorNameBySceneAndID', type: 'db_result', text: result});
		broadcast(database_data);
	});
}

function readActionTimingDataByScriptID(script_id){
	script_id++;
	var sql = "select timing from action where script_id = " + script_id;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
			console.log("readActionTimingDataByScriptID: ");
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'readActionTimingDataByScriptID', type: 'db_result', text: result});
		broadcast(database_data);
	});
}

function readWhoIsActionDataByScriptID(script_id){
	script_id++;
	var sql = "select actor from action where script_id = " + script_id;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
			console.log("readWhoisActionDataByScriptID: ");
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'readWhoIsActionDataByScriptID', type: 'db_result', text: result});
		broadcast(database_data);
	});
}


//これを動きの記録用に転用？
function readActionImageDataByScriptID(script_id){
	script_id++;
	var sql = "select image from action where script_id = " + script_id;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
			console.log("readActionImageDataByScriptID: ");
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'readActionImageDataByScriptID', type: 'db_result', text: result});
		broadcast(database_data);
	});
}


function readWhoIsScriptDataByScene(script_id){
	script_id++;
	var sql = "select actor from script where script_id = " + script_id;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
		console.log("readWhoIsScriptDataByScene: ");
		for(var key in result){
		console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'readWhoIsScriptDataByScene', type: 'db_result', text: result});
		broadcast(database_data);
	});
}

function readLinesScriptDataByScene(script_id){
	script_id++;
	var sql = "select line from script where script_id = " + script_id;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
		console.log("readLinesScriptDataByScene: " + result);
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'readLinesScriptDataByScene', type: 'db_result', text: result});
		broadcast(database_data);
	});
}


function readTimingScriptDataByScene(script_id){
	script_id++;
	var sql = "select timing from script where script_id = " + script_id;
	db_connection.query(sql, function(err, result, fields){
		if(err) throw err;
		for(var key in result){
			console.log(result[key]);
		}
		var database_data = JSON.stringify({function: 'readTimingScriptDataByScene', type: 'db_result', text: result});
		broadcast(database_data);
	});
}
//DBから情報を取ってくるメソッド終わり************************************


//取得したデータを配列に変換------------------------------------------------


function convertStringDataInto2DArray(input){
	var splitArray = new Array();
	splitArray = input.split("@");
}

function convertStringDataInto1DFLoatArray(input){
	var splitArray = new Array();
	splitArray = input.split(",");
}

function convertStringDataInto1DIntArray(input){
	var splitArray = new Array();
	splitArray = input.split(",");
}

function convertStringDataInto1DStringArray(input){
	var splitArray = new Array();
	splitArray = input.split("@@");
}

//配列に変換するメソッド終わり---------------------------------------------------------------------


//********以下卒論で使ったけど修論で使わないメソッド************

// function readMoveDataBySceneAndID(script_id, actor_id){
// 	script_id++;
// 	actor_id++;
// 	var sql = "select script from move where script_id = " + script_id + " and actor_id = " + actor_id;
// 	db_connection.query(sql, function(err, result, fields){
// 		if(err) throw err;
// 		console.log(result);
// 		var database_data = JSON.stringify({function: 'readMoveDataBySceneAndID', type: 'db_result', text: result})
// 		broadcast(database_data);
// 	});
// };


// function readSee2DataBySceneAndID(script_id, actor_id){
// 	script_id++;
// 	actor_id++;
// 	var sql = "select script from see2 where script_id = " + script_id + " and actor_id = " + actor_id;
// 	db_connection.query(sql, function(err, result, fields){
// 		if(err) throw err;
// 		console.log(result);
// 		var database_data = JSON.stringify({function: 'readSee2DataBySceneAndID', type: 'db_result', text: result})
// 		broadcast(database_data);
// 	});
// };


// function readSeeTimingDataBySceneAndID(script_id, actor_id){
// 	script_id++;
// 	actor_id++;
// 	var sql = "select timing from see where script_id = " + script_id + " and actor_id = " + actor_id;
// 	db_connection.query(sql, function(err, result, fields){
// 		if(err) throw err;
// 		console.log(result);
// 		var database_data = JSON.stringify({function: 'readSeeTimingDataBySceneAndID', type: 'db_result', text: result})
// 		broadcast(database_data);
// 	});
// };


// function readSeeFlagDataBySceneAndID(script_id, actor_id){
// 	script_id++;
// 	actor_id++;
// 	var sql = "select flag from see where script_id = " + script_id + " and actor_id = " + actor_id;
// 	db_connection.query(sql, function(err, result, fields){
// 		if(err) throw err;
// 		console.log(result);
// 		var database_data = JSON.stringify({function: 'readSeeFlagDataBySceneAndID', type: 'db_result', text: result})
// 		broadcast(database_data);
// 	});
// };




//いらんかったやつ

// db.dbConnect();

// async.series([	//第一引数はじめ
// 	function(callback){
// 		 var db_status = db.dbConnect();

// 		console.log('first');
// 		callback(null, actors = db.countActors(1));
// 	},
// 	function(callback){
// 		while(actors == null){
// 		actors = db.countActors(1);
// 		};
// 		console.log('second');
// 		callback(null, actors);
// 	},
// 	function(callback){
// 		console.log(actors);
// 		console.log('third');
// 		callback(null, actors);
// 	}
// 	], //第一引数おわり 
// 	function(err, result){
// 		if(err) throw err;
// 		// console.log('Actors: ' + result);
// 	}
// );

// 	db.countActors(1, db.dbConnect(err, result){
// 	if(err) throw err;
// 	actors = result;
// });
// 	console.log(actors);

//コールバック関数を実行する関数
// 	function dbCoonect_callback(callback){
// 		db.dbConnect();
// 		callback();
// 	}

// //コールバック関数
// 	var showActors = function(){
// 		actors = db.countActors(1);
// 		console.log('In show Actors');
// 		console.log(actors);
// 	}

// 	dbCoonect_callback(showActors);

// db.dbConnect();
// var actors = db.countActors(1);
// console.log(actors);

// readLinesScriptDataByScene(1);
//-------------------------------------------------------------------------------------------

