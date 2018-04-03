var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var productSchema = new Schema({
  "productId": {type: String},
  "productName": {type: String},
  "salePrice": {type: Number},
  "productImage": {type: String},
  "checked": {type:String},
  "productNum": {type:Number}
});
module.exports = mongoose.model('Good', productSchema)
