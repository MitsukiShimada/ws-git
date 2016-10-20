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
// dbConnect();
// countActors(1);
// dbClose();

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
	console.log('Database Connection Closed');
	db_connection.end();
}

exports.dbClose = function(){
	console.log('Database Connection Closed');
	db_connection.end();
};


/*****-------------------ここから卒論の範囲の機能-------------------*****/

//台本に登場する役者の数を取得
exports.countActorOfScriptID = function (script_id){
	var dbscript_id = script_id + 1;
	var sql = "select count(script_id) from actor where script_id=" + dbscript_id;
	// var sql = "select count(script_id) from actor where script_id=1";
	db_connection.query(sql, function(err, rows, fields) {
		if(err) throw err;
		console.log('The result is: ' + rows[0]); 
	});
};

function countActors(script_id){
	var sql = "select actor_name from actor where script_id=" + script_id;
	// var sql = "select count(script_id) from actor where script_id=1";
	db_connection.query(sql, function(err, rows, fields) {
		if(err) throw err;
		console.log('The result is: ' + rows[0].actor_name); 
		console.log('The result is: ' + rows[1].actor_name); 
		console.log('The result is: ' + rows[2].actor_name); 
	});
}


// define(function(){

	exports.countActors = function (script_id){
		var sql = 'select actor_name from actor where script_id = 1';
		db_connection.query(sql, function(err, rows, fields){
		if(err) throw err;
		return(rows[0].actor_name);
		});
	};


	// return {
	// 	countActors:countActors
	// };
// });



/*****-------------------ここまで卒論の範囲の機能--------------------*****/



//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------


