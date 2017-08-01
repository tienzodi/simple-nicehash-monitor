import ext from "./utils/ext";
import storage from "./utils/storage";

var template = (workers) => {
  var template = '<div class="site-description">';
  var totalWorkers = workers.length;

  template += `<h3>Total workers: <strong>${totalWorkers}</strong></h3>`;
  for(var i=0; i <= totalWorkers; i++) {
    var worker = workers[i];
    if(worker) {
      var hashRateObject = worker[1];
      var hashRate = hashRateObject.a * 1 || 0;
      var hashRateReject = hashRateObject.rd * 1 || 0;
      var hashRatePercent = hashRate / (hashRateReject + hashRate) * 100;
      hashRatePercent = hashRatePercent.toFixed(2);
      var timeConnected = worker[2];

      template += `<div class="worker-wrapper"><h6 class="worker-name" style="margin-bottom:3px;">[${worker[0]}]</h6>`;
      template += `<p class="worker-rate">A:<strong>${hashRate} MH/s</strong> | A%: <strong>${hashRatePercent}%</strong> | <strong>${timeConnected} mins</strong></p></div>`;
    }
  }
  template += '</div>';
  return template;
};

var renderInformation = (data, algorithm) => {
  var displayContainer = document.getElementById("worker-" + algorithm);
  if(data) {
    var tmpl = template(data);
    displayContainer.innerHTML = tmpl;
  } else {
    renderMessage("Sorry, could not get your workers information")
  }
};

var renderMessage = (message) => {
  var displayContainer = document.getElementById("display-container");
  displayContainer.innerHTML = `<p class='message'>${message}</p>`;
};

storage.get('data', function(resp) {
  if(!resp.data) {
    var message = "Please add your wallet address in Option";
    renderMessage(message);
    return;
  }

  var wallet_value = resp.data.wallet;
  var value_algorithm = resp.data.algorithm;

  getBalance(wallet_value);
  getTotalBalance(wallet_value);
});

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
          renderInformation(workers, algorithm);
        }
      }
    } else {
      console.log('Error: ' + xhr.status);
    }
  };
};

var getTotalBalance = function (address) {
  var requestUrl = `https://api.nicehash.com/api?method=stats.provider&addr=${address}`;
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
            var displayContainer = document.getElementById("display-total-balance");
            var stats = responseText.result.stats[0];
            var temlplate = `<h5>Balance: ${stats.balance}</h5>`;
            displayContainer.innerHTML = temlplate;
        }
      }
    } else {
      console.log('Error: ' + xhr.status);
    }
  };
};

var getBalance = function (address) {
  var requestUrl = `https://api.nicehash.com/api?method=stats.provider.ex&addr=${address}`;
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
          var totalAlgors = responseText.result.current;
          var template = '';
          for(var i=0; i < totalAlgors.length; i++) {
            var algor = totalAlgors[i];
            var value_algorithm =  algor.algo;
            var nameAlgor =  algor.name;
            var unpaid = algor.data[1];
            var totalSpeed = algor.data[0].a  || 0;
            var profitability = algor.profitability  || 0;
            var profitEstimate = algor.profitability * totalSpeed;
            profitEstimate = profitEstimate.toFixed(8);

            template += `<p class="algor">${nameAlgor}</p>`;
            template += `<small>Unpaid balance: <strong>${unpaid} BTC</strong></small><br/>`;
            template += `<small>Profit per MH: <strong>${profitability} BTC</strong></small><br/>`;
            template += `<small>Profitability: <strong>${profitEstimate} BTC</strong></small><br/>`;
            template += `<small>Total speed: ${totalSpeed}</small> MH/s<br/>`;
            template += `<div id='worker-${value_algorithm}' class='worker'></div>`;
          }

          var displayContainer = document.getElementById("display-balance");
          displayContainer.innerHTML = template;

          for(var i=0; i < totalAlgors.length; i++) {
            var algor = totalAlgors[i];
            var value_algorithm =  algor.algo;
            getWorkers(address, value_algorithm);
          }
        }
      }
    } else {
      console.log('Error: ' + xhr.status);
    }
  };
};

var optionsLink = document.querySelector(".js-options");
optionsLink.addEventListener("click", function(e) {
  e.preventDefault();
  ext.tabs.create({'url': ext.extension.getURL('options.html')});
});
