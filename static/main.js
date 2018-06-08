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
    if((data.quantity) <= 0.3)
      console.log(data.quantity);
      //alert("目前可用容量少於30%，丟你媽B");

    //改變html中id為"capacity"的值
    $("#capacity").html(message);
  });

  //接受後端送出"capacityAlert"事件，表示垃圾桶快要滿了
  socket.on("capacityAlert" , function(data){
    alert("請注意，目前容量少於30%");
  });
});