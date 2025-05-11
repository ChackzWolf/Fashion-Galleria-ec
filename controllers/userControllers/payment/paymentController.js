var instance = new Razorpay({
    key_id: 'rzp_test_lc7R4jCpEpM90Q',
    key_secret: 'l23pXte67Ewz57CcDGSNANZd',
});


  


////////////////////////////////////////////////////////////////////////////////////     POST Methods     >>>>>>>>>>>>>>>>





const generateRazorpay = async (randomOrderId, finalAmount) => {
    try {
        const order = await instance.orders.create({
          amount: finalAmount * 100,
          currency: "INR",
          receipt: randomOrderId,
          notes: {
            key1: "value3",
            key2: "value2"
          }
        });
        console.log(order,'order-------------------')
        return order;
    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
 };
