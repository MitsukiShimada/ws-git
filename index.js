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
// var mysql = require(['node_modules/mysql']);	//require.jsを使用する場合
var mysql = require('mysql');	//browserifyを使用する場合, 通常の場合
// var DBClient = require('mysql').Client;

var db_connection;	//mysqlの接続
//接続設定の用意
var dbConfig = {
	// host		: 'http://viztaro.s17.xrea.com/log/phpmyadmin/import.php#PMAURL-6:index.php?db=&table=&server=1&target=&token=d2dff2008e79084d172b3623c221575d', //接続先ホスト名
	// user    	: 'viztaro', //ユーザー名
	// password	: 'vizmos', //パスワード
	// database	: 'viztaro' //DB名

	// host	: "localhost",
 //  	user  : "root",
 //  	password  :  "vNagCs6H",
 //  	database  :  "ddihon"

 host : 'us-cdbr-iron-east-04.cleardb.net',
 user : 'b823897b16dff2',
 password : '43ac4401',
 database : 'heroku_26dd74052841cb5'
};

dbConnect();
countActorOfScriptID(1);
//-------------------------------------------------------------------------------------------



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



//島田修正---------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------

//あとで修正する予定
//var mysql = require('mysql');

//DBへの接続をオープン
function dbConnect(){	//データベースに接続
	db_connection = mysql.createConnection(dbConfig);
	db_connection.connect();
	console.log('MySQLに接続');
	db_connection.ping(function (err) {
  if (err) throw err;
  console.log('Server responded to ping');
})
}

//接続の破棄
function dbClose(){
	connection.end();
}


/*****-------------------ここから卒論の範囲の機能-------------------*****/

//台本に登場する役者の数を取得
function countActorOfScriptID(script_id){
	var dbscript_id = script_id + 1;
	var sql = "select count(script_id) from actor where script_id=" + dbscript_id;
	// var sql = "select count(script_id) from actor where script_id=1";
	db_connection.query(sql, function(err, rows, fields) {
		if(err) throw err;
		console.log('The result is: ' + rows[0]); 
	});
}


/*****-------------------ここまで卒論の範囲の機能--------------------*****/



//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------

