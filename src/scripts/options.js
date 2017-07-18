import ext from "./utils/ext";
import storage from "./utils/storage";

var wallet = document.getElementById('wallet');
var algorithm = document.getElementById('algorithm');
var button = document.getElementById('saveInformation');

button.addEventListener('click', function() {
  storage.set({ wallet: wallet.value, algorithm: algorithm.value });
}, false);

storage.get('wallet', function(resp) {
  var value = resp.wallet;
  if(value) {
    wallet.value = value;
  }
});

storage.get('algorithm', function(resp) {
  var value = resp.algorithm;
  if(value) {
    algorithm.value = value;
  }
});