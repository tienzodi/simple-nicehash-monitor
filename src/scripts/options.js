import ext from "./utils/ext";
import storage from "./utils/storage";

var wallet = document.getElementById('wallet');
var algorithm = document.getElementById('algorithm');
var button = document.getElementById('saveInformation');

button.addEventListener('click', function() {
  var data = { wallet: wallet.value, algorithm: algorithm.value };
  storage.set({ data: data });
}, false);

storage.get('data', function(resp) {
  var wallet_value = resp.data.wallet;
  if(wallet_value) {
    wallet.value = wallet_value;
  }

  var value_algorithm = resp.data.algorithm;
  if(value_algorithm) {
    algorithm.value = value_algorithm;
  }
});