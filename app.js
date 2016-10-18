//app.js

// requireの設定
const mysql = require('mysql');
 
// MySQLとのコネクションの作成
const connection = mysql.createConnection({
  // host : 'http://viztaro.s17.xrea.com/log/phpmyadmin/import.php#PMAURL-6:index.php?db=&table=&server=1&target=&token=d2dff2008e79084d172b3623c221575d',
  // host : 'http://viztaro.s17.xrea.com/log/phpmyadmin/index.php?token=d2dff2008e79084d172b3623c221575d#PMAURL-1:db_structure.php?db=viztaro&table=&server=1&target=&token=d2dff2008e79084d172b3623c221575d',
  // host : '131.11.51.2',
  // host : 'localhost',
  // user : 'viztaro',
  // password : 'vizmos',
  // database: 'viztaro'
  
  host	: "localhost",
  user  : "root",
  password  :  "vNagCs6H",
  database  :  "ddihon"
});
 
// 接続
connection.connect();
 
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
