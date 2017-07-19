import ext from "./utils/ext";
import storage from "./utils/storage";

var template = (workers) => {
  var template = '<div class="site-description">';
  var totalWorkers = workers.length;

  template += `<h3>Total workers: ${totalWorkers}</h3>`;
  for(var i=0; i <= totalWorkers; i++) {
    var worker = workers[i];
    if(worker) {
      var hashRateObject = worker[1];
      var hashRate = hashRateObject.a || 0;
      var hashRateReject = hashRateObject.rd || 0;

      template += `<div class="worker-wrapper"><h5 class="worker-name">Name: ${worker[0]}</h5>`;
      template += `<p class="worker-accepted-rate">Accepted speed: ${hashRate} MH/s</p>`;
      template += `<p class="worker-rejected-rate">Rejected speed: ${hashRateReject} MH/s</p></div>`;
    }
  }
  template += '</div>';
  return template;
};

var renderInformation = (data) => {
  var displayContainer = document.getElementById("display-container");
  if(data) {
    var tmpl = template(data);
    console.log(tmpl);
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

  var requestUrl = `https://api.nicehash.com/api?method=stats.provider.workers&addr=${wallet_value}&algo=${value_algorithm}`;
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
            renderInformation(workers);
          }
        }
      } else {
        console.log('Error: ' + xhr.status);
      }
  };
});

var optionsLink = document.querySelector(".js-options");
optionsLink.addEventListener("click", function(e) {
  e.preventDefault();
  ext.tabs.create({'url': ext.extension.getURL('options.html')});
});
