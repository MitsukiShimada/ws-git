//変数定義(websocket必須)
var host = location.origin.replace(/^http/, 'ws');				//host
var ws = new WebSocket(host);									//websocket
//付け加え変数定義
var userid = Math.floor(Math.random() * 500);					//自デバイスのユーザIDをランダムで生成
var open_switch = 0;											//オープンしてるかどうかのフラグ
var num_dvc;													//自デバイスの値
//フラグ
var doing = 0;													//稽古中かを示すフラグ
var watching = 0;												//watchからの音声通知の有無を示すフラグ
var kinecting = 0;												//kinectから骨格認識通知の有無を示すフラグ
//training用変数定義
var count = 0;													//現在の順番
var scriptArray;												//台本の配列

//認識中のユーザ
var motion_user = 0;
//タイマーの名前
var timer = 0;


//島田追加------------------------------------------------------------------------------
// var mysql = require(['node_modules/mysql']);	//require.jsを使用する場合
// var mysql = require('mysql');	//browserifyを使用する場合, 通常の場合
// // var DBClient = require('mysql').Client;

// require(['db'], function(db_connect){
// 	console.log(db_connect.countActors(1));
// });
	// var db = require('db');
	// var mysql = require('mysql');
	// db.countActors(1);

// var db_connection;	//mysqlの接続
// //接続設定の用意
// var dbConfig = {
// 	// host		: 'http://viztaro.s17.xrea.com/log/phpmyadmin/import.php#PMAURL-6:index.php?db=&table=&server=1&target=&token=d2dff2008e79084d172b3623c221575d', //接続先ホスト名
// 	// user    	: 'viztaro', //ユーザー名
// 	// password	: 'vizmos', //パスワード
// 	// database	: 'viztaro' //DB名

// 	// host	: "localhost",
//  //  	user  : "root",
//  //  	password  :  "vNagCs6H",
//  //  	database  :  "ddihon"

//  host : 'us-cdbr-iron-east-04.cleardb.net',
//  user : 'b823897b16dff2',
//  password : '43ac4401',
//  database : 'heroku_26dd74052841cb5'
// };

// dbConnect();
// countActors(1);
// dbClose();
//-------------------------------------------------------------------------------------------


//********************オープン処理********************
ws.onopen = function(){
	ws.send(JSON.stringify({
		user: userid,
		type: 'connect',
		text: 'open'
	}));

}

//********************クローズイベント********************
ws.onclose = function(event){
	console.log("クローズ");
	ws.send(JSON.stringify({
		user: userid,
		type: 'connect',
		text: 'close'
	}));
}

window.onunload = function(event){
    // 切断
    ws.onclose("切断理由");
//	ws.send(JSON.stringify({
//		user: userid,
//		type: 'connect',
//		text: 'close'
//	}));
	
}


//********************メッセージ受信イベント********************
ws.onmessage = function (event) {
	//-----メッセージの代入-----
	var messages = JSON.parse(event.data);
//	console.log(messages);


	//-----typeがping-----
	if(messages.type == "ping"){
		write_ping(userid, messages.text);
	
	//-----typeがconnect-----
	} else if(messages.type == "connect"){

		//==websocket処理部分==
		//オープン
		if(messages.text == "open"){
			//自分が最初にオープンした時の動作
			if(open_switch == 0){
				userid = messages.user;
				open_switch = 1;
				update_connect_status();
				update_pc_status(userid);
			}
			//共通
			write_log(messages.user, " device opened<br>");
			
		//クローズ
		} else if(messages.text == "close"){
			write_log(messages.user, " device closed<br>");
			
		//==open時、デバイス登録状況を更新==
		} else if(messages.text == "open_device"){
			
			if(userid!="PC1"&&userid!="PC2"&&userid!="PC3"&&userid!="Tablet1"&&userid!="Tablet2"&&userid!="Tablet3"){
			
				if(messages.user == "PC.1"){
					write_log(messages.user, ":登録済み<br>");
					update_pc1();
				} else if(messages.user == "PC.2"){
					write_log(messages.user, ":登録済み<br>");
					update_pc2();
				} else if(messages.user == "PC.3"){
					write_log(messages.user, ":登録済み<br>");
					update_pc3();
				} else if(messages.user == "TABLET.1"){
					write_log(messages.user, ":登録済み<br>");
					update_tablet1();
				} else if(messages.user == "TABLET.2"){
					write_log(messages.user, ":登録済み<br>");
					update_tablet2();
				} else if(messages.user == "TABLET.3"){
					write_log(messages.user, ":登録済み<br>");
					update_tablet3();
				}
			}
			
		//===デバイス登録部分===
		} else if(messages.text == "PC.1"){
			write_log(messages.user, ":PC.1に登録完了<br>");
			update_pc1();
			if(messages.user == userid) userid = "PC1";
		} else if(messages.text == "PC.2"){
			write_log(messages.user, ":PC.2に登録完了<br>");
			update_pc2();
			if(messages.user == userid) userid = "PC2";
		} else if(messages.text == "PC.3"){
			write_log(messages.user, ":PC.3に登録完了<br>");
			update_pc3();
			if(messages.user == userid) userid = "PC3";
		} else if(messages.text == "TABLET.1"){
			write_log(messages.user, ":TABLET.1に登録完了<br>");
			update_tablet1();
			if(messages.user == userid) userid = "Tablet1";
		} else if(messages.text == "TABLET.2"){
			write_log(messages.user, ":TABLET.2に登録完了<br>");
			update_tablet2();
			if(messages.user == userid) userid = "Tablet2";
		} else if(messages.text == "TABLET.3"){
			write_log(messages.user, ":TABLET.3に登録完了<br>");
			update_tablet3();
			if(messages.user == userid) userid = "Tablet3";
			
		//kinect接続部分
		} else if(messages.user == "KINECT"){
			write_log(messages.user, " 接続完了");
		}
		
	//-----typeがchat-----
	} else if(messages.type == "chat"){
		write_chat(messages.user, messages.text);


	//-----typeがdatabase-----
	}else if(messages.type == "raise"){
	//サーバ→Watch 一方通行 Watchのアプリ起動させる
	
	
	//-----typeがtraining_prepare-----
	} else if(messages.type == "training_prepare"){
	//サーバ→Watch 一方通行 稽古前準備 台本情報を送る
	
	//-----typeがtraining_send-----
	} else if(messages.type == "training_send"){
	//サーバ→Watch 一方通行 稽古モード
	
	
	//-----typeがtraining-----
	} else if(messages.type == "training"){
	//稽古モード Watchからの受信処理
	
		//稽古中フラグ・Watchへ通知中フラグ が立っていることを確認
		if(doing == 1 && watching != 0){
			console.log("受信音声: " + "端末 " + messages.user + " - メッセージ " + messages.text);
			if(messages.user == "Tablet1"){
				//判定処理
				judgeTraining(1);
				DisplayMessages(1, messages.text);
			} else if(messages.user == "Tablet2"){
				//判定処理
				judgeTraining(2);
				DisplayMessages(2, messages.text);
			} else if(messages.user == "Tablet3"){
				//判定処理
				judgeTraining(3);
				DisplayMessages(3, messages.text);
//				nankai += 1;
//				console.log("何回目の判定メソッド：" + nankai);
			
			}
			
			if(messages.text == "please_stop" && doing == 1){
				onStopButton();
			} else if(messages.text == "please_back_1" && doing == 0){
				onRestartBack1Button();
			} else if(messages.text == "please_back_first" && doing == 0){
				onStartButton();
			}
		}
	
	//-----typeがkinect_send-----
	} else if(messages.type == "kinect_send"){
	//サーバ→Kinect 一方通行 稽古モード
	
	
	//-----typeがkinect-----
	} else if(messages.type == "kinect"){
	//kinectからの受信処理
		
		//稽古中フラグ・Kinectへ通知中フラグ が立っていることを確認
		if(doing == 1 && kinecting != 0){
//			if(motion_user == messages.user){
				//true or false を判断するため、judgeTrainingにtextを飛ばす
				judgeTraining(messages.text);
//				console.log("いいタイミングでkinect認識！");
//			} else if(messages.user == "debug"){
//				judgeTraining(messages.text);
//			}
			
		//システムなしモード
		} else if(doing == 0 && kinecting != 0){
//			if(motion_user == messages.user){
				judgeMotionTraining(messages.text);
//			}
		}

		
		console.log("kinectからの受信: " + messages.text);
	
	
//DBとのやりとりのための分岐,島田追加*********************************************	
	}else if(messages.type == "db_access"){
	console.log(event.data);
	for(key in messages.text){
		console.log(messages.text[key].actor_name);
	}
		// var data = JSON.parse(event); 
		// console.log(JSON.getString("text"));
		DBdebug_chat(messages.function, messages.text);

//********************************************************************
		
	//-----一応その他のtypeだった場合-----
	} else {
		console.log(event.data);
		console.log(messages.data);
		console.log("その他のtypeを受信: " + messages);
	}


};

	
//********************共通機能イベント********************

//サーバに送信メソッド
function send(Userid, Type, Text){
	ws.send(JSON.stringify({
		user: Userid,
		type: Type,
		text: Text
	}));
}

function db_send(function_name){
	ws.send(JSON.stringify({
		func_name: function_name,
		type: 'db_access',
		script_id: 1
	}));
}

//Androidに稽古情報を送信メソッド
function trainingsend(Count, Userid, Type, Actor, Script, Motion){
	ws.send(JSON.stringify({
		count: Count,
		user: Userid,
		type: Type,
		actor: Actor,
		script: Script,
		motion: Motion
	}));
}

//Kinectに動き情報を送信メソッド
function motionsend(Userid, Type, Motion){
	ws.send(JSON.stringify({
		user: Userid,
		type: Type,
		motion: Motion
	}));
}

//********************接続ボックス内のイベント********************

//接続状態の更新
function update_connect_status(){
	var my_con_sts = document.getElementById("my_connect_status");
	my_con_sts.innerHTML = "OPEN";
}

//PCステータスの更新
function update_pc_status(Userid){
	var my_dvc_sts = document.getElementById("my_device_status");
	my_dvc_sts.innerHTML = Userid;
}

//デバイス通信状況の更新-pc1-
function update_pc1(){
	document.getElementById("con_pc1").innerHTML = "PC.1";
}

//デバイス通信状況の更新-pc2-
function update_pc2(){
	document.getElementById("con_pc2").innerHTML = "PC.2";
}

//デバイス通信状況の更新-pc3-
function update_pc3(){
	document.getElementById("con_pc3").innerHTML = "PC.3";
}

//デバイス通信状況の更新-tablet1-
function update_tablet1(){
	document.getElementById("con_tablet1").innerHTML = "TABLET.1";
}

//デバイス通信状況の更新-tablet2-
function update_tablet2(){
	document.getElementById("con_tablet2").innerHTML = "TABLET.2";
}

//デバイス通信状況の更新-tablet3-
function update_tablet3(){
	document.getElementById("con_tablet3").innerHTML = "TABLET.3";
}


//********************チャット、ログ、pingイベント********************

//チャットボックスに書き込み
function write_chat(Userid, Text){
	var chat_fld = document.getElementById("chat_field");
	chat_fld.innerHTML += "ユーザ " + Userid + ": " + Text + "<br>";
}


//データベース接続デバッグ用 島田追加--------------------------------------------
function DBdebug_chat(func_name, db_data){
	var chat_fld = document.getElementById("chat_field");
	// chat_fld.innerHTML += "Function: " + func_name + ", Result: " + db_data + "<br>";
	for(key in db_data){
	chat_fld.innerHTML += "ActorName: " + db_data[key].actor_name + "<br>";
	}; 
}







//--------------------------------------------------------------------------


//ログボックスに書き込み
function write_log(Userid, Text){
	var log_fld = document.getElementById("log_field");
	log_fld.innerHTML += "ユーザ " + Userid + Text;
}

//pingボックスに書き込み
function write_ping(Userid, Text){
	var ping_fld = document.getElementById("ping_field");
	ping_fld.innerHTML += "ユーザ" + Userid + ": " + Text + "<br>";
}

//********************ボタンイベント********************

//-----デバイス登録部分-----

//デバイス登録ボタン
function onDeviceRadioButton(){
	//定義
	var pc1 = document.getElementById("pc1").checked;
	var pc2 = document.getElementById("pc2").checked;
	var pc3 = document.getElementById("pc3").checked;
	var tablet1 = document.getElementById("tablet1").checked;
	var tablet2 = document.getElementById("tablet2").checked;
	var tablet3 = document.getElementById("tablet3").checked;	
	
	//値の代入
	if(pc1==true){
		num_dvc = "PC.1";
	} else if(pc2==true){
		num_dvc = "PC.2";
	} else if(pc3==true){
		num_dvc = "PC.3";
	} else if(tablet1==true){
		num_dvc = "TABLET.1";
	} else if(tablet2==true){
		num_dvc = "TABLET.2";
	} else if(tablet3==true){
		num_dvc = "TABLET.3";
	}
	
	//デバイスステータスの更新
	update_pc_status(num_dvc);
	//他のデバイスに更新情報を送信
	send(userid, 'connect', num_dvc);
}

//デバイス変更ボタン
function onDeviceChangeRadioButton(){
	//未実装
}

//-----kinect部分-----
function onKinectCheckButton(){
	//前の順番の色付き背景を白に戻す
	RepairColor();
	MessageChangeWhite();
	//入力された値のcountを入力
	kinect_count_ipt = document.getElementById("kinect_count_input");
	//kinectチェックメソッドへ
	KinectCheck(kinect_count_ipt.value);
}

//daihonデバッグボタン部分
function Scenario1Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("1"); }
function Scenario3Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("3"); }
function Scenario4Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("4"); }
function Scenario5Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("5"); }
function Scenario6Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("6"); }
function Scenario7Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("7"); }
function Scenario8Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("8"); }
function Scenario9Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("9"); }
function Scenario13Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("13"); }
function Scenario15Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("15"); }
function Scenario18Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("18"); }
function Scenario19Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("19"); }
function Scenario22Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("22"); }
function Scenario23Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("23"); }
function Scenario24Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("24"); }
function Scenario25Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("25"); }
function Scenario26Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("26"); }
function Scenario27Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("27"); }
function Scenario28Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("28"); }
function Scenario29Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("29"); }
function Scenario30Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("30"); }
function Scenario31Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("31"); }
function Scenario32Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("32"); }
function Scenario33Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("33"); }
function Scenario34Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("34"); }
function Scenario37Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("37"); }
function Scenario38Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("38"); }
function Scenario39Button(){ RepairColor(); MessageChangeWhite(); KinectCheck("39"); }

//watchデバッグボタン部分
function onDebugWatch1Button(){
	send("Tablet1", "training", "PCからデバッグ通知");
}
function onDebugWatch2Button(){
	send("Tablet2", "training", "PCからデバッグ通知");
}
function onDebugWatch3Button(){
	send("Tablet3", "training", "PCからデバッグ通知");
}


//-----台本、稽古部分-----

//+++++台本選択部分+++++

//台本1ボタン
function onScriptButton1(){
	getCSVFile("daihon1.csv");
	document.getElementById("number_script").innerHTML = "1";
	document.getElementById("scripttitle").innerHTML = "無差別";
}

//台本2ボタン
function onScriptButton2(){
	getCSVFile("daihon2.csv");
	document.getElementById("number_script").innerHTML = "2";
	document.getElementById("scripttitle").innerHTML = "喫茶店";
}

//台本3ボタン
function onScriptButton3(){
	getCSVFile("daihon3.csv");
	document.getElementById("number_script").innerHTML = "3";
	document.getElementById("scripttitle").innerHTML = "家族会議";
}

//台本4ボタン
function onScriptButton4(){
	getCSVFile("daihon4.csv");
	document.getElementById("number_script").innerHTML = "4";
	document.getElementById("scripttitle").innerHTML = "ある目線";
}

//台本5ボタン
function onScriptButton5(){
	getCSVFile("daihon5.csv");
}

//台本6ボタン
function onScriptButton6(){
	getCSVFile("daihon6.csv");
}

//台本7ボタン
function onScriptButton7(){
	getCSVFile("daihon7.csv");
}

//台本8ボタン
function onScriptButton8(){
	getCSVFile("daihon8.csv");
}

//台本決定ボタン
function onScriptDecideButton(){
//	console.log("台本決定したで");
	//Tablet1、2、3それぞれに初期状態のデータを送る
	trainingsend('0', 'Tablet1','training_prepare',scriptArray[0][1],scriptArray[0][2],scriptArray[0][3]);
	trainingsend('0', 'Tablet2','training_prepare',scriptArray[1][1],scriptArray[1][2],scriptArray[1][3]);
	trainingsend('0', 'Tablet3','training_prepare',scriptArray[2][1],scriptArray[2][2],scriptArray[2][3]);
	
}

//+++++稽古操作部分+++++

//Watch1起動ボタン1
function onWatchRaiseButton1(){
	send('Tablet1', 'raise', 'watch1_raise');
}

//Watch1起動ボタン2
function onWatchRaiseButton2(){
	send('Tablet2', 'raise', 'watch2_raise');
}

//Watch1起動ボタン1
function onWatchRaiseButton3(){
	send('Tablet3', 'raise', 'watch3_raise');
}


//稽古スタートボタン
function onStartButton(){
	//稽古中フラグを立てる
	doing = 1;
	document.getElementById("training_now").innerHTML = "稽古中";
	//前の順番の色付き背景を白に戻す
	RepairColor();
	//一番目の色を付加
	count = 1;
	//対象の順番の背景に色をつける
	AddColor();
	//対象ユーザ部分の背景に色をつける
	MessageChangeRed();
	//WatchとKinectに情報を送る
	SendInfo();
	//7秒後に動きが出来てるかどうかチェックし、だめなら音を出す
	timer = setTimeout("SoundPlay()", 7000);
	//順番表示
	DisplayCount();
	document.getElementById("display_watching").innerHTML = watching;
	document.getElementById("display_kinecting").innerHTML = kinecting;
}

//一時停止ボタン
function onStopButton(){
	//timerを一度停止する
	clearTimeout(timer);
	//稽古中フラグを閉じる
	doing = 0;
	document.getElementById("training_now").innerHTML = "停止中";
	//通知フラグも閉じる
	watching = 0;
	kinecting = 0;


	//kinectチェック前という文字を表示する、文字黒くする
	document.getElementById("check_kinect_text").innerHTML = "Kinectチェック前";
	document.getElementById("check_kinect_text").style.backgroundColor="white";

	document.getElementById("display_watching").innerHTML = watching;
	document.getElementById("display_kinecting").innerHTML = kinecting;
}

//再スタートボタン
function onRestartButton(){
	//稽古中フラグを立てる
	doing = 1;
	document.getElementById("training_now").innerHTML = "稽古中";
	//countは一つ下げる(NextNotification()でcount+1するので)
	count -= 1;
	//通知フラグも閉じる
	watching = 0;
	kinecting = 0;
	//稽古を再開する
	NextNotification();
}

//-1から再スタートボタン
function onRestartBack1Button(){
	//timerを一度停止する
	clearTimeout(timer);
	
	//前の順番の色付き背景を白に戻す
	RepairColor();

	//稽古中フラグを立てる
	doing = 1;
	document.getElementById("training_now").innerHTML = "稽古中";
	//countは二つ下げる(NextNotification()でcount+1するので)
	count -= 2;
	//通知フラグも閉じる
	watching = 0;
	kinecting = 0;
	//稽古を再開する
	NextNotification();
}

//-2から再スタートボタン
function onRestartBack2Button(){
	//timerを一度停止する
	clearTimeout(timer);
	
	//前の順番の色付き背景を白に戻す
	RepairColor();

	//稽古中フラグを立てる
	doing = 1;
	document.getElementById("training_now").innerHTML = "稽古中";
	//countは3つ下げる(NextNotification()でcount+1するので)
	count -= 3;
	//稽古を再開する
	NextNotification();
}

//-----ボックス部分-----

//チャット入力送信ボタン
function onChatSendButton() {
	chat_ipt = document.getElementById("chat_input");
	send(userid, 'chat', chat_ipt.value);
	motionsend(1,'kinect_send', 'text');	//役者名とモーションを通知

}



//島田追加  DBとの接続テスト用--------------------------------------------------------
function onDBChatSendButton(){
	chat_ipt = document.getElementById("chat_input");

	console.log(chat_ipt.value);
	db_send(chat_ipt.value);//chatにindex.jsのメソッド名を入力する
}

function dbFunctionSendButtonWithScriptID(function_name, script_id){
	ws.send(JSON.stringify({
		func_name: function_name,
		type: 'db_access',
		script_id: script_id
	}));
}

function dbFunctionSendButtonWithScriptIDAndActorID(functione_name, script_id, actor_id){
	ws.send(JSON.stringify({
		func_name: function_name,
		type: 'db_access',
		script_id: script_id,
		acrtor_id: actor_id
	}));
}

function dbDataConvert(){
	
}

//---------------------------------------------------------------


//********************台本、稽古 機能イベント********************

//+++++-----台本の読み込み-----+++++

//CSVファイルの読み込み
function getCSVFile(daihon) {
    var xhr = new createXMLHttpRequest();
    xhr.onload = function() {
		//CSVファイルが存在すれば、配列に格納
		createScriptTable(xhr.responseText);
    };
	 //読み込む台本CSVファイルの定義
    xhr.open("get", daihon, true);
    xhr.send(null);
}



//島田修正---------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------

//あとで修正する予定
//var mysql = require('mysql');

//DBへの接続をオープン
// function dbConnect(){	//データベースに接続
// 	db_connection = mysql.createConnection(dbConfig);
// 	db_connection.connect();
// 	console.log('MySQLに接続');
// 	db_connection.ping(function (err) {
//   if (err) throw err;
//   console.log('Server responded to ping');
// })
// }

// //接続の破棄
// function dbClose(){
// 	console.log('Database Connection Closed');
// 	db_connection.end();
// }


// /*****-------------------ここから卒論の範囲の機能-------------------*****/

// //台本に登場する役者の数を取得
// function countActorOfScriptID(script_id){
// 	var dbscript_id = script_id + 1;
// 	var sql = "select count(script_id) from actor where script_id=" + dbscript_id;
// 	// var sql = "select count(script_id) from actor where script_id=1";
// 	db_connection.query(sql, function(err, rows, fields) {
// 		if(err) throw err;
// 		console.log('The result is: ' + rows[0]); 
// 	});
// }

// function countActors(script_id){
// 	var sql = "select actor_name from actor where script_id=" + script_id;
// 	// var sql = "select count(script_id) from actor where script_id=1";
// 	db_connection.query(sql, function(err, rows, fields) {
// 		if(err) throw err;
// 		console.log('The result is: ' + rows[0].actor_name); 
// 		console.log('The result is: ' + rows[1].actor_name); 
// 		console.log('The result is: ' + rows[2].actor_name); 
// 	});
// }


/*****-------------------ここまで卒論の範囲の機能--------------------*****/



//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------






//CSVの読み込みに必要なxhrの作成
function createXMLHttpRequest() {
    var XMLhttpObject = null;
    XMLhttpObject = new XMLHttpRequest();
    return XMLhttpObject;
}

//scriptArrayに台本を読み込ませる
function createScriptTable(csvData){
	var CR = String.fromCharCode(13);	//改行コード
    var c_tempArray = csvData.split(CR);	//縦配列、改行コードで分割
    var c_csvArray = new Array();			//横配列
	scriptArray = new Array();
	
	//scriptArrayの初期化
    for(var i = 0; i < c_tempArray.length;i++){ 
		for(var j = 0; j<c_csvArray.length; j++){
			scriptArray[i][j] = "";
		}
	}
	//scriptArrayに台本csvファイルを格納
    for(var i = 0; i < c_tempArray.length;i++){ 
		c_csvArray = c_tempArray[i].split(",");		//セミコロンで分割
		scriptArray[i] = new Array();
		for(var j = 0; j<c_csvArray.length; j++){
			scriptArray[i][j] = c_csvArray[j];
		}
	}
//	console.log(scriptArray);

	//台本選択部分に反映
	makeScripttable(c_tempArray.length, scriptArray);
	//台本進行状況に反映
	makeArray(c_tempArray.length, scriptArray);
}


//台本選択-台本概要テーブルの表示
function makeScripttable(length, scriptarray){
	//初期化
	document.getElementById("actor1_name").innerHTML = "none";
	document.getElementById("actor1_first").innerHTML = "none";
	document.getElementById("actor2_name").innerHTML = "none";
	document.getElementById("actor2_first").innerHTML = "none";
	document.getElementById("actor3_name").innerHTML = "none";
	document.getElementById("actor3_first").innerHTML = "none";
	//値の代入
	for(var i = 0; i < length; i++){
		if(scriptarray[i][0] == 0){
			if(scriptarray[i][4] == 1){
				document.getElementById("actor1_name").innerHTML = scriptarray[i][1];
				document.getElementById("actor1_first").innerHTML = scriptarray[i][3];
			} else if(scriptarray[i][4] == 2){
				document.getElementById("actor2_name").innerHTML = scriptarray[i][1];
				document.getElementById("actor2_first").innerHTML = scriptarray[i][3];
			} else if(scriptarray[i][4] == 3){
				document.getElementById("actor3_name").innerHTML = scriptarray[i][1];
				document.getElementById("actor3_first").innerHTML = scriptarray[i][3];
			}
		}
	}
}

//台本進捗状況に台本テーブル表示
function makeArray(length, scriptarray){
	//配列を一旦格納する変数
	var resultTable = "";
	
	//格納する前に初期化
	resultTable = "";
	resultTable = "<table border=1 class=\"script\"><tr class=\"ttitle\"><th class=\"one\">順番</th><th class=\"two\">役者</th><th class=\"three\">セリフ</th><th class=\"four\">動き</th></tr>";
	
	for(var i = 0; i < length; i++){
		for(var j = 0; j < 4; j++){
			if(scriptarray[i][0] != 0){
				if(j == 0){
					resultTable += "<tr class=\""+ scriptarray[i][j] +"\">";	//trにはクラス(0,1,2,3・・・)をつける
					resultTable +="<td>" + scriptarray[i][j] + "</td>";
				} else if(j == 3){
					resultTable +="<td>" + scriptarray[i][j] + "</td></tr>";
				} else {
					resultTable +="<td>" + scriptarray[i][j] + "</td>";
				}
			}
		}
	}
	resultTable += "</table>";

	//作成した配列を台本進行状況に表示する
	displayArray(resultTable);
}

//台本進行状況に台本の配列を表示
function displayArray(resulttable){
	var training_log = document.getElementById("training_field");
	training_log.innerHTML = resulttable;
}







//+++++-----台本の判定-----+++++

//台本の判定をする
function judgeTraining(result){
	//メモ：通知時にwatchフラグとkinectフラグを0に。片方の判定が来ればフラグを立てる。両方立っていれば処理を行う
	
	for(var i = 0; i < scriptArray.length; i++){
		if(scriptArray[i][0] == count){
		
			//watchからきた判定の処理、発言した役者(ユーザ)が合って入れば
			if(result == scriptArray[i][4]){	//ユーザ1or2or3
				watching -= 1;
				MessageChangeWhite();
//				console.log("watching" + watching);
			}
			//kinectからきた判定の処理
			if(result == "motion_ok"){
				kinecting -= 1;
			}
			console.log("判定する前！watching" + watching);
			//両方の判定結果が正しければ、次へ進む
			if(watching == 0 && kinecting == 0){
				console.log("ピンポンなんだ！" + count);
				//次の通知をする
				NextNotification();
				//正解音鳴らす
//				SoundPlay();
				//ここのbreakはまじで大事
				break;
			}
		}
	}
	//間違っていれば、ブーと音を鳴らす。そして一時停止。（間違いという判断は秒数が良い。秒は予備実験を元に決める必要がある）
	
	//順番表示
	DisplayCount();
	document.getElementById("display_watching").innerHTML = watching;
	document.getElementById("display_kinecting").innerHTML = kinecting;
}

//システムなしモード kinectだけの判定をする
function judgeMotionTraining(result){
	if(result == "motion_ok"){
		kinecting--;
		clearTimeout(timer);
		
		//kinectチェック前という文字を表示する、文字黒くする
		document.getElementById("check_kinect_text").innerHTML = "Kinectチェック前";
		document.getElementById("check_kinect_text").style.backgroundColor="white";
	}
	
	document.getElementById("display_watching").innerHTML = watching;
	document.getElementById("display_kinecting").innerHTML = kinecting;
}

//+++++----- 通知処理 -----+++++
//次の通知処理を行うメソッド(色付け含む)
function NextNotification(){
	//timerを一度停止する
	clearTimeout(timer);
	
	//前の順番の色付き背景を白に戻す
	RepairColor();
	
	//順番を+1する
	count += 1;
	
	//対象の順番の背景に色をつける
	AddColor();
	
	//対象ユーザ部分の背景に色をつける
	MessageChangeRed();
	
	//WatchとKinectに情報を送る
	SendInfo();
	document.getElementById("display_watching").innerHTML = watching;
	document.getElementById("display_kinecting").innerHTML = kinecting;
	
	//7秒後に動きが出来てるかどうかチェックし、だめなら音を出す
	timer = setTimeout("SoundPlay()", 7000);
	
	//順番表示
	DisplayCount();
}

//WatchとKinectに情報を送るメソッド
function SendInfo(){
//	console.log("順番:" + count);
	for(var i = 0; i < scriptArray.length; i++){
		if(scriptArray[i][0] == count){
			
			//Watchにタイミングを通知 count | userid | type | actor | script | motion
			if(scriptArray[i][4] == 1){
				//台詞があった場合
				if(scriptArray[i][2] != 0){
					trainingsend(count, 'Tablet1', 'training_send', scriptArray[i][1], scriptArray[i][2], scriptArray[i][3]);
					watching += 1;
				//台詞がなかった場合
				} else if(scriptArray[i][2] == 0){
					trainingsend(count, 'Tablet1', 'training_send', scriptArray[i][1], '動きのみ', scriptArray[i][3]);
					//watchingフラグは立てない
				}
			}
			if(scriptArray[i][4] == 2){
				if(scriptArray[i][2] != 0){
					trainingsend(count, 'Tablet2', 'training_send', scriptArray[i][1], scriptArray[i][2], scriptArray[i][3]);
					watching += 1;
				//台詞がなかった場合
				} else if(scriptArray[i][2] == 0){
					trainingsend(count, 'Tablet2', 'training_send', scriptArray[i][1], '動きのみ', scriptArray[i][3]);
					//watchingフラグは立てない
				}
			}
			if(scriptArray[i][4] == 3){
				if(scriptArray[i][2] != 0){
					trainingsend(count, 'Tablet3', 'training_send', scriptArray[i][1], scriptArray[i][2], scriptArray[i][3]);
					watching += 1;
				//台詞がなかった場合
				} else if(scriptArray[i][2] == 0){
					trainingsend(count, 'Tablet3', 'training_send', scriptArray[i][1], '動きのみ', scriptArray[i][3]);
					//watchingフラグは立てない
				}
			}
			
			//kinectに通知
			//Motionがなし(=0)でなければ通知
			if(scriptArray[i][3] != 0){
				//やっぱりkinectに通知はしない
//				motionsend(scriptArray[i][4],'kinect_send', scriptArray[i][3]);	//役者名とモーションを通知
				motion_user = scriptArray[i][4];
				kinecting++;
			}
			console.log("通知した！watching:" + watching + "  kinecting:" + kinecting);
		}
	}
}

//システムなしモード、Kinectによる動作チェック
function KinectCheck(Count){
	//timerを一度停止する
	clearTimeout(timer);
	
	//countに値を入れる
	count = Count;
	
	//kinectチェック中という文字を表示する、文字赤くする
	document.getElementById("check_kinect_text").innerHTML = "Kinectチェック中";
	document.getElementById("check_kinect_text").style.backgroundColor="red";
	
	//対象の順番の背景に色をつける
	AddColor();
	
	//対象ユーザ部分の背景に色をつける
	MessageChangeRed();

	//kinectingフラグを立てる
	SendToKinectInfo();

	//7秒後にまだフラグが立っていたらブーと音を鳴らす
	timer = setTimeout("SoundPlay()", 7000);
}

//システムなしモード kinectの通知だけする
function SendToKinectInfo(){
	for(var i = 0; i < scriptArray.length; i++){
		if(scriptArray[i][0] == count){
			//kinectに通知
			//Motionがなし(=0)でなければ通知
//			if(scriptArray[i][3] != 0){
				motion_user = scriptArray[i][4];
				kinecting++;
//			}
		}
	}

}




//+++++----- 音声メッセージ表示処理 -----+++++

//受信したメッセージを表示する
function DisplayMessages(user, text){
	if(user == 1) document.getElementById("watch_voice_reply1").innerHTML = text;
	if(user == 2) document.getElementById("watch_voice_reply2").innerHTML = text;
	if(user == 3) document.getElementById("watch_voice_reply3").innerHTML = text;
}


//+++++----- 色付け処理 -----+++++

//通知中ではないデバイスのメッセージの色を黒くする
function MessageChangeWhite(){
	for(var i = 0; i < scriptArray.length; i++){
		//順番が正しければ色を赤くする
		if(scriptArray[i][0] == count){
			
			if(scriptArray[i][4] == 1) document.getElementById("watchvoicereply1").style.backgroundColor="white";
			if(scriptArray[i][4] == 2) document.getElementById("watchvoicereply2").style.backgroundColor="white";
			if(scriptArray[i][4] == 3) document.getElementById("watchvoicereply3").style.backgroundColor="white";
			
		}
	}
}

//通知中のデバイスのメッセージの色を黒くする
function MessageChangeRed(){
	for(var i = 0; i < scriptArray.length; i++){
		//順番が正しければ色を赤くする
		if(scriptArray[i][0] == count){
			
			if(scriptArray[i][4] == 1) document.getElementById("watchvoicereply1").style.backgroundColor="red";
			if(scriptArray[i][4] == 2) document.getElementById("watchvoicereply2").style.backgroundColor="red";
			if(scriptArray[i][4] == 3) document.getElementById("watchvoicereply3").style.backgroundColor="red";
			
		}
	}
}

//前の順番の色付き背景を白に戻すメソッド
function RepairColor(){
	var ClassElement_1 = document.getElementsByClassName(count);
	for(var i = 0; i < ClassElement_1.length; i++){
		ClassElement_1[i].style.backgroundColor = "#ffffff";
	}
}

//対象の順番の背景に色をつけるメソッド
function AddColor(){
	var ClassElement = document.getElementsByClassName(count);
	for(var i = 0; i < ClassElement.length; i++){
		ClassElement[i].style.backgroundColor = "#fffacd";
	}
}


//+++++----- 音鳴らす処理 -----+++++

//音を鳴らすメソッド
function SoundPlay(){
	//音ファイルを鳴らす
	var audio_correct = new Audio("music/correct_sound.mp3");		//正解音
	var audio_wrong = new Audio("music/wrong_sound.mp3");			//ドラムロール音
	var audio_drumroll = new Audio("music/drumroll_sound.mp3");		//間違い音
	
//	audio_drumroll.play();
//	setTimeout(function musicplay(){ audio_correct.play(); }, 2700);	//遅延して再生
//	audio_correct.play();
	
	if(kinecting != 0){
		//間違いの音を出す
		audio_wrong.play();
		
		//kinectチェック前という文字を表示する、文字黒くする
		document.getElementById("check_kinect_text").innerHTML = "Kinectチェック前";
		document.getElementById("check_kinect_text").style.backgroundColor="white";
	}
	//順番表示
	DisplayCount();
}

//+++++----- 順番を表示する処理 -----+++++
function DisplayCount(){
	document.getElementById("training_count").innerHTML = count;
}
