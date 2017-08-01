import ext from "./utils/ext";
import storage from "./utils/storage";

var wallet = document.getElementById('wallet');
var button = document.getElementById('saveInformation');

button.addEventListener('click', function() {
  var data = { wallet: wallet.value };
  storage.set({ data: data });
}, false);

storage.get('data', function(resp) {
  if(resp.data) {
    var wallet_value = resp.data.wallet;
    if (wallet_value) {
      wallet.value = wallet_value;
    }
  }
});