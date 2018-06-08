'use strict';

/*
 * 有需要多個arduino的板子的連接時
 * 不需要使用express框架，直接create http server然後把socket丟進去即可
 * 這邊可能會用到ESP8266
 * 還沒實作的功能
*/

module.exports.multiSocket = function(ip , port){
	var http = require('http');

	//創建http server
	var app = http.createServer();
	var io = require('socket.io')(app);

	var boardConnect = require("./boardConnect.js");

	//給定特定port和ip來bang認不同arduino板子
	var address = {
		ip : ip,
		port : port
	};

	boardConnect.connect(io , {totalCapacity: "垃圾桶容量(公分)" , freq : "感應器更新頻率(毫秒)"} , address);

	app.listen(port , ip , function(){
		console.log('ip : ' + ip + '正在監聽 port : ' + port);
	});
}
