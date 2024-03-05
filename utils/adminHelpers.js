const OrderModel = require("../models/Order");
const ProductModel = require("../models/Product");

function calculatePercentageDifference(originalPrice, discountPrice) {
    try{
        let  result = ((discountPrice-originalPrice)/originalPrice)*100
        result = Math.trunc(result);
        result = Math.abs(result);
        return result;
    }catch(error){
        console.log("calculatePercentageDifference() calculation error")
        res.status(500).json({error: "Internal error."});

    }

}    

// Function to apply a percentage reduction to a price
function reducePercentageFromPrice(price, percentage) {
    try{
        const amount = (price*percentage)/100
        let result = price-amount
        result = Math.trunc(result)
        return result;
    }catch(error){
        console.log("reducePercentageFromPrice() calculation error")
        res.status(500).json({error: "Internal error."});
    }
};


const getOrderPrice= async (orderId, productId)=>{
    try {
        // Find the order with the given orderId
        const order = await OrderModel.findOne({ _id: orderId });

        if (!order) {
            console.log('No order found with the given orderId.');
            return;
        }
        console.log(order,'orderrrrrrrr')
        const product = order.products
        console.log(product,'product', productId,'productId');

        // Iterate over the product array
        for (let i = 0; i < product.length; i++) {
            console.log(i,'bign')
            // Check if the current product's productId matches the target productId
            console.log(product[i].price,'kkkkkkk')
            console.log(product[i].productId,'productId')
            console.log(productId,'productId to match');
            if (product[i].productId == productId) {
                console.log(product[i].price,'price')
                // If a match is found, return the price of the product
                return product[i].price;
            }
        }
   

        // Access and log the price of the found product
        // const price = product.price;
        // console.log('Product price:', price);
    } catch (error) {
        console.error('Error:', error);
    }
    }
module.exports = {calculatePercentageDifference,reducePercentageFromPrice,getOrderPrice}; 