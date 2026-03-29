import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    product_name:{
        type:String,
        required:true
    },
    product_image_url:{
        type:String,
        required:true
    },
    product_category:{
        type:String,
        enum:{
            values:["clothing","electronics","jewelery"],
        }
    },
    product_description:{
        type:String,
        
    },
    product_mrp:{
        type:Number,
        required:true
    },
    product_offerPrice:{
        type:Number,
        required:true
    },
    product_basePrice:{
        type:Number,
        select:false
    },
    target_profit:{
        type:Number
    },
    negotiation_strategy:{
        type:String,
        enum:{
            values:["stubborn", "flexible", "moderate"]
        }
    },
    rating:{
        type:Number
    },
    product_purchase_count:{
        type:Number
    }
},{
    timestamps:true
})

const productModel = mongoose.model('product',productSchema);


export default productModel;