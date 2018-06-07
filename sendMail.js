'use strict';
/*
* 使用pchome 的smtp server做測試，因為也不用三小認證或api key
*/

module.exports.sendMail = function(id , pw , message , reciver){
	message = message || "請清除垃圾，容量小於30%"; //function overloading
	var nodemailer = require('nodemailer');

	nodemailer.createTestAccount(function(err, account){
		var transporter = nodemailer.createTransport({
			host: 'smtp.pchome.com.tw',
			port: 25,
			secure: false, // true for 465, false for other ports
			auth: {
				user: id,
				pass: pw
			},
			tls: {
			// do not fail on invalid certs
			rejectUnauthorized: false
			}
		});

		// setup email data with unicode symbols
		var mailOptions = {
			from: '"Sender" <' + id + '>', // sender address
			to: reciver + ',' + reciver, // list of receivers
			subject: '垃圾桶容量不足', // 主旨
			text: message, // 內文
			html: '<b>' + message + '</b>' // html 內文
		};

		//發送信件方法
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}
			console.log('訊息發送: ' + info.response);
		});
	});
}
