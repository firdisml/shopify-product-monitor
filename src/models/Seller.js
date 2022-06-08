const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    url: String,
    keywords: [],
    products: [{}],
});

const Seller = mongoose.model('Sellers', sellerSchema);
module.exports = Seller;