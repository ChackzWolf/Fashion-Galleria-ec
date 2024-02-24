function calculatePercentageDifference(originalPrice, discountPrice) {
    try{
        let  result = ((discountPrice-originalPrice)/originalPrice)*100
        result = Math.trunc(result);
        result = Math.abs(result);
        return result;
    }catch{
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
    }catch{
        console.log("reducePercentageFromPrice() calculation error")
        res.status(500).json({error: "Internal error."});
    }
}

module.exports = {calculatePercentageDifference,reducePercentageFromPrice}; 