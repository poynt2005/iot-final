/*
 * 目前用到額外的套件有 :
 * express、socket.io、nodemailer
 * 這邊是後台，用express.js
*/
'use strict';
//網頁框架
var app = require('express')();
var http = require('http').Server(app);

//"socket.io"物件必須附著在http物件下
var io = require('socket.io')(http);


//送出html檔案
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/index.html');
});

//連接arduino板子
var boardConnect = require("./boardConnect.js");
boardConnect.connect(io);


http.listen(3000, function() {
    console.log('正在監聽 port 3000');
});
