'use strict'

/*
 * 呼叫壓縮器的function
 * 用到內建模組child_process
 * 回傳promise，來等待壓縮
*/

module.exports.startCompress = function(pathName){
	return new Promise(function(resolve , reject){
		var cp = require("child_process");
		cp.exec(pathName , function(err, stdout, stderr){
			if(err)
				reject(err);
			resolve(stdout);
		});
	});
}
