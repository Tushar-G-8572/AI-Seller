import mongoose from "mongoose";

const leaderBoardSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product"
    },
    deal_price:{
        type:Number,
    },
    saving_percent:{
        type:Number
    },
},{
    timestamps:true
})

leaderBoardSchema.index({ product_id: 1, deal_price: 1 });

const leaderBoardModel = mongoose.model('leader-board',leaderBoardSchema)

export default leaderBoardModel; 