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

    //開始畫圖
    canvasDraw("trashCan" , data.quantity);
    
    if((data.quantity) <= 0.3)
      alert("目前可用容量少於30%，丟你媽B");

    //改變html中id為"capacity"的值
    $("#capacity").html(message);
  });

  //接受後端送出"capacityAlert"事件，表示垃圾桶快要滿了
  socket.on("capacityAlert" , function(data){
    alert("請注意，目前容量少於30%");
  });
});


//用canvas畫一個垃圾桶出來
function canvasDraw(canvasId , freeCapacity){
  var startPointX = 54 , startPointY = 30;
  var offsetX = 66 , offsetY = 75;
  var handleOffsetX = 6 , handleOffsetY = 6;
  var handleStartX = startPointX + (offsetX-handleOffsetX)/2;

  function draw() {
    var canvas = document.getElementById(canvasId);

    if (canvas.getContext){
      var ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(startPointX,startPointY);
    	ctx.lineTo(handleStartX , startPointY);
    	ctx.lineTo(handleStartX , startPointY - handleOffsetY);
    	ctx.lineTo(handleStartX + handleOffsetX , startPointY - handleOffsetY);
    	ctx.lineTo(handleStartX + handleOffsetX , startPointY);
    	ctx.lineTo(startPointX + offsetX, startPointY);

    	ctx.moveTo(startPointX,startPointY);
    	ctx.lineTo(startPointX , startPointY + offsetY);
    	ctx.lineTo(startPointX + offsetX , startPointY + offsetY);

    	ctx.moveTo(startPointX + offsetX , startPointY);
    	ctx.lineTo(startPointX + offsetX , startPointY + offsetY);
      ctx.closePath();
      ctx.stroke();
    }
  }


  function draw2(percent) {
    var canvas = document.getElementById(canvasId);

    if (canvas.getContext){
      var ctx = canvas.getContext('2d');
    	ctx.clearRect(0, 0, canvas.width, canvas.height);
    	draw();

    	ctx.beginPath();
    	ctx.moveTo(startPointX, startPointY + offsetY*(1-percent));
    	ctx.lineTo(startPointX + offsetX ,startPointY + offsetY*(1-percent));
    	ctx.moveTo(startPointX,startPointY + offsetY*(1-percent));

    	ctx.lineTo(startPointX ,startPointY + offsetY);
    	ctx.lineTo(startPointX + offsetX,startPointY + offsetY);
    	ctx.lineTo(startPointX + offsetX,startPointY + offsetY*(1-percent));


    	ctx.fillStyle = (function(){
    		if(percent >= 0.8)
    			return "#ff1a1a";
    		else if(percent < 0.8 && percent >= 0.5)
    			return "#ff80bf";
    		else if(percent < 0.5 && percent > 0.3)
    			return "#66ccff";
    		else{
    			return "#99ff99";
    		}
    	})();

      ctx.fill();

    	ctx.font = "15px Arial";
    	ctx.fillStyle = 'black';
      ctx.fillText(percent*100 + "%",startPointX + (offsetX/2) - 15 ,startPointY + (offsetY/2));
    }
  }

  var toTopPercent = parseFloat(1-freeCapacity).toFixed(2);
  if(toTopPercent > 1) toTopPercent=1;
  else if(toTopPercent < 0) toTopPercent=0;

  draw2(toTopPercent);
}
