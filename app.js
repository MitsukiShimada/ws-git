//app.js

// requireの設定
const mysql = require('mysql');
 
// MySQLとのコネクションの作成
const connection = mysql.createConnection({
  // host	: "localhost",
  host : "192.168.20.129",
  user : "root",
  password : "vNagCs6H",
  database : "ddihon"
});
 
// 接続
connection.connect();

connection.ping(function (err) {
  if (err) throw err;
  console.log('Server responded to ping');
})
 
// userdataの取得
connection.query('SELECT * from actor;', function (err, rows, fields) {
  if (err) { console.log('err: ' + err); } 
 
  console.log('id: ' + rows[0].actor_id);
  console.log('name: ' + rows[0].actor_name);
 
});
 
// userdataのカラムを取得
connection.query('SHOW COLUMNS FROM actor;', function (err, rows, fields) {
  if (err) { console.log('err: ' + err); }
 
  console.log(rows[0].Field);
  console.log(rows[1].Field);
});
 
// 接続終了
connection.end();

// /*expressモジュールからHttpサーバを作成し、wsモジュールのServer引数にしてWebSocket用サーバオブジェクトを作成*/
// var WebSocketServer = require('ws').Server
//     , http = require('http')
//     , express = require('express')
//     , app = express();

// app.use(express.static(__dirname + '/'));
// var server = http.createServer(app);
// var wss = new WebSocketServer({server:server});

// //WebSocket接続を保存しておく
// var connections = [];

// //接続時
// wss.on('connection', function(ws){
// 	//配列にwebsocket接続を保存
// 	connections.push(ws);
// 	//切断時
// 	ws.on('close', function(){
// 		connections = connections.filter(function (conn, i){
// 			return (conn === ws) ? false: true;
// 		    });
// 	    });
// 	//メッセージ送信時
// 	ws.on('message', function(message){
// 		console.log('message:', message);
// 		broadcast(JSON.stringify(message));
// 	    });
//     });

// //ブロードキャストを行う
// function broadcast(message){
//     connections.forEach(function (con, i){
// 	    con.send(message);
// 	});
// };

// server.listen(3000);
