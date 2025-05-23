const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        require:true,
    },
    orderId:{
        type:Number,
        require:true
    },
    address:{
        name:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        }, 
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        default:{
            type:Boolean
        }
    },
    date:{
        type:String,
        required:true
    },
    products:[{
        productId:{
            type:String,
            required:true
        },
        name:{
            type:String,
            required:true,
        },
        price:{
            type:Number,
            required:true
        },
        size:{
            type:String,
            required:true
        },
        count:{
            type:Number, 
        },
        productStatus:{
            type:String,
        },
        status:{
            type:String,
        }
    }],
    couponCode:{
        type:String,
       
    },
    amount:{
        type:Number,
        required:true,
    },
    paymentMethod:{
        type:String,
        required:true,
    }
});

const OrderModel = mongoose.model("Order",OrderSchema);
module.exports = OrderModel













