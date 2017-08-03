import ext from "./utils/ext";
import storage from "./utils/storage";

var intervalNoti = 60000;//1 * 1000 * 60;

setInterval(function(){
  storage.get('data', function(resp) {
		if(!resp.data) {
		    return;
		}
  		
		var wallet_value = resp.data.wallet;
  	var disable_notification = resp.data.disableNotification;
  	
  	if(wallet_value != null) {
  		getBalance(wallet_value);
  	}
  });
}, intervalNoti);

function notifyMe(message) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check if the user is okay to get some notification
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification(message);
  }

  // Otherwise, we need to ask the user for permission
  // Note, Chrome does not implement the permission static property
  // So we have to check for NOT 'denied' instead of 'default'
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {

      // Whatever the user answers, we make sure we store the information
      if(!('permission' in Notification)) {
        Notification.permission = permission;
      }

      // If the user is okay, let's create a notification
      if (permission === "granted") {
        var notification = new Notification(message);
      }
    });
  }

  // At last, if the user already denied any notification, and you 
  // want to be respectful there is no need to bother him any more.
}



var getBalance = function (address, alertHashRate) {
	var requestUrl = `https://api.nicehash.com/api?method=stats.provider&addr=${address}`;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', requestUrl);
	xhr.send(null);

  	xhr.onreadystatechange = function () {
	    var DONE = 4;
	    var OK = 200;
	    if (xhr.readyState === DONE) {
	      	if (xhr.status === OK) {
		        var data = JSON.parse(xhr.responseText);
		        if(data.result && data.result.error == null) {
		        	var totalAlgors = data.result.stats;
		        	for(var i=0; i < totalAlgors.length; i++) {
			            var algor = totalAlgors[i];
			            var value_algorithm =  algor.algo;
			            getWorkers(address, value_algorithm);
		          	}
		    	}
	      	}
	    } 
  	};
};


var getWorkers = function (address, algorithm) {
	var requestUrl = `https://api.nicehash.com/api?method=stats.provider.workers&addr=${address}&algo=${algorithm}`;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', requestUrl);
	xhr.send(null);

	xhr.onreadystatechange = function () {
		var DONE = 4;
		var OK = 200;
		if (xhr.readyState === DONE) {
		  	if (xhr.status === OK) {
			    var responseText = JSON.parse(xhr.responseText);
			    if(responseText.result) {
			      	var workers = responseText.result.workers || [];
			        checkWorkerUpOrDown(workers, algorithm);
			    }
		  	}
		} else {
		  	console.log('Error: ' + xhr.status);
		}
	};
};


var checkWorkerUpOrDown = function(workers, algorithm) {
  	var key_storage = 'workers_' + algorithm;

  storage.get(key_storage, function(resp) {
      var new_wokers = [];
      for (var index in workers) {
          new_wokers.push(workers[index][0]);
      }

      if(resp[key_storage]) {
        for (var index in resp[key_storage]) {
            if(new_wokers.indexOf(resp[key_storage][index]) < 0) {
                notifyMe('The worker (' + resp[key_storage][index] +') is down');
            } 
        }

        for (var index in new_wokers) {
            if(resp[key_storage].indexOf(new_wokers[index]) < 0) {
                notifyMe('The worker (' + new_wokers[index] +') is up');
            } 
        }
      }

      var data = {};
      data[key_storage] = new_wokers;

      storage.set(data);
  });
}