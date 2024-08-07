const mongoose = require("mongoose");
const Schema = mongoose.Schema

const CategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },listStatus:{
        type:Boolean,
        default:true,
    },offer:{
        type:Number,
        default:0
    },
    deleteStatus:{
        type:Boolean,
        default:false
    }
})
 
const CategoryModel = mongoose.model("Category",CategorySchema);
module.exports = CategoryModel;