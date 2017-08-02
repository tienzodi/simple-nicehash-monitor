import ext from "./utils/ext";
import storage from "./utils/storage";

var template = (workers) => {
  var template = '<div class="site-description">';
  var totalWorkers = workers.length;

  template += `<div class="row">`;
  template += `<div class="col-xs-12"><div class="card green"><div class="title">Total workers: <strong>${totalWorkers}</div></div></div>`;
  template += `</div>`;

  for(var i=0; i <= totalWorkers; i++) {
    var worker = workers[i];
    if(worker) {
      var hashRateObject = worker[1];
      var hashRate = hashRateObject.a * 1 || 0;
      var hashRateReject = hashRateObject.rd * 1 || 0;
      var hashRatePercent = hashRate / (hashRateReject + hashRate) * 100;
      hashRatePercent = hashRatePercent.toFixed(2);
      var timeConnected = worker[2];

      template += `<div class="row">`;
      template += `<div class="col-xs-12"><div class="card blue"><div class="title">${worker[0]}</div><div class="content">A:<strong>${hashRate} MH/s</strong> | A%: <strong>${hashRatePercent}%</strong> | <strong>${timeConnected} mins</strong></div></div></div>`;
      template += `</div>`;
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
    var message = "Please add your wallet address in Options";
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
            var template = ``;
            template += `<div class="row">`;
            template += `<div class="col-xs-12"><div class="card green"><div class="title">Balance</div><div class="content">${stats.balance} BTC</div></div></div>`;
            template += `</div>`;
            displayContainer.innerHTML = template;
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
        if(responseText.result && responseText.result.error == null) {
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

            template += `<div class="row">`;
            template += `<div class="col-xs-12"><div class="card red"><div class="title">Algorithm: ${nameAlgor}</div></div></div>`;
            template += `</div>`;

            template += `<div class="row">`;
            template += `<div class="col-xs-6"><div class="card blue"><div class="title">Unpaid balance</div><div class="content">${unpaid} BTC</div></div></div>`;
            template += `<div class="col-xs-6"><div class="card blue"><div class="title">Total speed</div><div class="content">${totalSpeed} MH/s</div></div></div>`;
            template += `</div>`;

            template += `<div class="row">`;
            template += `<div class="col-xs-6"><div class="card yellow"><div class="title">Profit per MH</div><div class="content">${profitability} BTC</div></div></div>`;
            template += `<div class="col-xs-6"><div class="card yellow"><div class="title">Profitability</div><div class="content">${profitEstimate} BTC</div></div></div>`;
            template += `</div>`;
            
            template += `<div id='worker-${value_algorithm}' class='worker'></div>`;
          }

          var displayContainer = document.getElementById("display-balance");
          displayContainer.innerHTML = template;

          for(var i=0; i < totalAlgors.length; i++) {
            var algor = totalAlgors[i];
            var value_algorithm =  algor.algo;
            getWorkers(address, value_algorithm);
          }
        } else {
          var displayContainer = document.getElementById("display-balance");
          displayContainer.innerHTML = 'Please wait ...';

          setTimeout(function(){
            getBalance(address);
          }, 3000);
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
