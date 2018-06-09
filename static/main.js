'use strict';

$(document).ready(function(){

  //建立與後端的socket
  var socket = io();

  /*
  * 由感應器自動更新垃圾桶容量
  * 故註解掉這些代碼
  *
  *
  * 載入網頁後，送出查詢事件"garbageQuery"，查詢垃圾統容量
  * socket.emit("garbageQuery");
  */



  $("#checkConnect").click(function(){
    //當點擊"測試連線"，送出"checkCon"事件，測試與後端的連線
    socket.emit("checkCon");
  });


  /* 由感應器自動更新垃圾桶容量
   * 故註解掉這些代碼
   *
   *
  $("#checkGarbage").click(function(){
    //當點擊"更新垃圾量"，送出查詢事件"garbageQuery"，查詢垃圾統容量
    socket.emit("garbageQuery");
  });
  */

  //接受來自後端的"conEnable"，表示已成功連接
  socket.on("conEnable" , function(data){
    alert(data);
  });

  //接受來自後端的"freeSpace"，從data中freeCapacity讀取可用容量
  socket.on("freeSpace" , function(data){

    var message = "垃圾桶可用容量 : " + (data.quantity)*100 + "%";

    if(data.quantity === 2)
      message = "正在與Sensor連線，請稍後......";



    //開始畫圖
    canvasDraw("trashCan" , data.quantity);



    //改變html中id為"capacity"的值
    $("#capacity").html(message);


    if((data.quantity) <= 0.15)
      showdialog("垃圾桶容量小於15%，可能無法丟垃圾");
  });

  //接受後端送出"capacityAlert"事件，表示垃圾桶快要滿了
  socket.on("capacityAlert" , function(data){
    showdialog("請注意，目前容量 : " + (data.quantity)*100 + "%" + "，小於30%");
  });

});


//用canvas畫一個垃圾桶出來
function canvasDraw(canvasId , freeCapacity){
  var getCanvas = document.getElementById(canvasId);

  //橢圓參數
  var ovalArgs = {
      //上橢圓圓心
  		centerX : getCanvas.width / 2,
  		centerY : getCanvas.height / 5,

      //下橢圓半徑
  		shortRadius : 8 ,
  		longRadius : 50,

      //高度
  		picHeightY : getCanvas.height * 3 / 4,

      /*
       * 下橢圓圓心
  		 * buttonCenterX = centerX , buttonCenterY = centerY + height
      */
  		buttonCenterX : getCanvas.width / 2 ,
  		buttonCenterY : getCanvas.height / 5 + (getCanvas.height * 3 / 4),

      //下橢圓半徑
  		bShortRadius : 3 ,
  		bLongRadius : 20
  	};

  //畫垃圾桶
  function draw(ovalArgs) {

    var ctx = document.getElementById(canvasId).getContext('2d');
  	ctx.beginPath();

  	ctx.ellipse(ovalArgs.centerX, ovalArgs.centerY, ovalArgs.longRadius, ovalArgs.shortRadius , Math.PI/180, 0, 2 * Math.PI);
  	ctx.stroke();

  	ctx.ellipse(ovalArgs.buttonCenterX, ovalArgs.buttonCenterY, ovalArgs.bLongRadius, ovalArgs.bShortRadius, Math.PI/180, 0, 2 * Math.PI);
  	ctx.stroke();


  	ctx.moveTo(ovalArgs.centerX - ovalArgs.longRadius , ovalArgs.centerY);
  	ctx.lineTo(ovalArgs.buttonCenterX - ovalArgs.bLongRadius , ovalArgs.buttonCenterY);
  	ctx.stroke();

  }

  //畫垃圾高度
  function draw2(currentHeightRate , ovalArgs){
    var canvas = document.getElementById(canvasId);
  	var ctx = canvas.getContext('2d');
  	ctx.clearRect(0, 0, canvas.width, canvas.height);
  	draw(ovalArgs);


  	if(currentHeightRate >= 1) currentHeightRate = 1;
  	else if(currentHeightRate <=0) currentHeightRate = 0;

  	var currentHeight = parseFloat(currentHeightRate * ovalArgs.picHeightY).toFixed(2);
  	var calculRatio = (function(){
  		return {
  			moveX :  ovalArgs.longRadius - ((ovalArgs.longRadius - ovalArgs.bLongRadius) * (ovalArgs.picHeightY - currentHeight) / ovalArgs.picHeightY),
  			toTopY : ovalArgs.centerY + (ovalArgs.picHeightY - currentHeight)
  		};
  	})();
  	ctx.beginPath();
  	ctx.moveTo(ovalArgs.centerX - calculRatio.moveX , calculRatio.toTopY);
  	ctx.lineTo(ovalArgs.centerX + calculRatio.moveX , calculRatio.toTopY);
  	ctx.lineTo(ovalArgs.centerX + ovalArgs.bLongRadius , ovalArgs.buttonCenterY);
  	ctx.lineTo(ovalArgs.centerX - ovalArgs.bLongRadius , ovalArgs.buttonCenterY);
  	ctx.lineTo(ovalArgs.centerX - calculRatio.moveX , calculRatio.toTopY);

    //依照不同的垃圾高度有不同的顏色警示
  	ctx.fillStyle = (function(){

  		if(currentHeightRate >= 0.8)
  			return "#ff1a1a";
  		else if(currentHeightRate < 0.8 && currentHeightRate >= 0.5)
  			return "#ff80bf";
  		else if(currentHeightRate < 0.5 && currentHeightRate > 0.3)
  			return "#66ccff";
  		else{
  			return "#99ff99";
  		}
      })();

  	ctx.globalAlpha = 0.5;
  	ctx.fill();

  	ctx.font = "15px Arial";
    ctx.fillStyle = 'black';
  	ctx.fillText(currentHeightRate*100 + "%", ovalArgs.centerX -15 , ovalArgs.centerY + ovalArgs.picHeightY/2);
  }
  draw2(parseFloat(1 - freeCapacity).toFixed(2) , ovalArgs);
}


//顯示警告視窗
function showdialog(alertStr){
		$("#alertMessage").html(alertStr);

		$(function(){
			$( "#dialog" ).dialog({
				show:{
					effect: "puff",
					duration: 100
					},
				hide:{
					effect: "explode",
					duration: 100
				}
			});
		});

	}
