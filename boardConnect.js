'use strict'
/*
* HC-SR04是一種近接感應器 ， johnny-five官網寫的
* 詳細api可參照 : : http://johnny-five.io/api/proximity/
* 近接感應器需要使用johnny-five的Proximity物件
*/

/*
 * parameter "io" : a socket.io instance
 * parameter "address" : a object contain "ip" and "port"
*/

module.exports.connect = function(io , address){

	//載入物聯網套件"johnny-five"
	var five = require("johnny-five");

	//check this board is running at which port to determine the specific trash can(not implemented yet)
	address = address || false;


	//sensor example code(Using HC-SR04)
	//johnny-five的Board物件，代表實體板
	var board = new five.Board();

	//載入arduino
	board.on("ready", function() {

	  //載入HCSR04
	  var proximity = new five.Proximity({
		  controller: "HCSR04",
		  pin: 7
	  });

	  //載入socket.io 準備與前端連線，建立與前端的socket
	  io.on('connection', function(socket){

			console.log("socket has connected");

			//compressing為真表示機器正在壓縮，偵測到距離有bang動時不要再呼叫壓縮器
			var compressing = false;

			//表示還有壓縮的空間
			var isCompressAble = true;

			//接受來自前端的"checkCon"事件(前端點擊"測試連線"按鈕時)
			socket.on("checkCon", function(data){
				socket.emit("conEnable", "Sensor連接完成");
			});

			//接收前端的"garbageQuery"事件(前端一開始載入網頁或點擊"更新垃圾量"按鈕時)
			socket.on("garbageQuery" , function(){
			  proximity.on("data", function() {

				  //紀錄該sensor測量與底部的距離
				  var distanceToTop = this.cm;
				  //計算可用容量
				  var freeCapacity = capacity(distanceToTop);

				  //送出"freeSpace"事件到前端(包含可用容量的資料)
				  socket.emit("freeSpace" , {quantity : freeCapacity});
			  });
			});

			//偵測到容量有變化時
			proximity.on("change", function() {

				//取得sensor資訊
			  proximity.on("data", async function() {
					var distanceToTop = this.cm;
					var freeCapacity = capacity(distanceToTop);

					//假設容量小於30%
					if(freeCapacity <= 0.3){
						//壓縮器未啟動時而且還有空間壓縮，才啟動壓縮器
						if(!compressing && isCompressAble){
							try{
								//呼叫壓縮機器
								var compress = require("./compress.js");
								var path = require("path");
								compressing = true;

								//開始壓縮，bang等待完成
								const state = await compress.startCompress(path.join("util" , "壓縮程式"));

								//完成壓縮
								compressing = false;

								//測量壓縮後的容量
								proximity.on("data", function() {
									var distanceToTop = this.cm;
									var freeCapacity = capacity(distanceToTop);

									//假設可用容量小於15%，即不能壓縮，email通知清潔隊收取垃圾
									if(freeCapacity <= 0.15){
										//不能再壓縮ㄌ
										isCompressAble = false;
										
										//寄信給清潔隊
										emailNotifier("清潔隊信箱" , freeCapacity);

										//並且送出警告訊息到前端(包含可用容量的資料)
										socket.emit("capacityAlert" , {quantity : freeCapacity});
									}
								});

							}
							catch(e){
								console.log("壓縮失敗");

								//完成壓縮
								compressing = false;
							}
						}
					}

					//假設容量大於90%
					if(freeCapacity >= 0.9){

						//容量大表示清完垃圾桶，可以內部壓縮
						isCompressAble = true;
					}
				});

			}); //sensor change end

		}); //socket.io end
	}); //board end

	//計算可用容量(默認50cm)
	function capacity(distance , totalCapacity){
	  totalCapacity = totalCapacity || 50;
	  return parseFloat((distance/totalCapacity).toFixed(2))
	};

	//寄信
	function emailNotifier(reciver , freeCapacity){
	  var mailSender = require("./sendMail.js");
	  mailSender.sendMail("發送者信箱" , "密碼" , freeCapacity , reciver);
	};
}
