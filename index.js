/*
 * 目前用到額外的套件有 :
 * express、socket.io、nodemailer
 * 這邊是後台，用express.js
*/
'use strict';
//網頁框架
var express = require('express');
var app = express();
var http = require('http').Server(app);

//"socket.io"物件必須附著在http物件下
var io = require('socket.io')(http);

//use static files directory in middleware
app.use(express.static('static'));

//送出html檔案
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/static/index.html');
});

//連接arduino板子
var boardConnect = require("./boardConnect.js");

boardConnect.connect(io , {capacity: "垃圾桶容量(公分)" , freq : "感應器更新頻率(毫秒)"});
//boardConnect.connect(io , {capacity: 75 , freq : 1000});

http.listen(3000, function() {
    console.log('正在監聽 port 3000');
});
