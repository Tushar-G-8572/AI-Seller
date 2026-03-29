import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
    user_offer: Number,
    ai_message: String,
    ai_counter_offer: Number,
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    },
    round_history: [roundSchema],
    current_offer: { type: Number },
    max_rounds: { type: Number, default: 6 },
    status: {
        type: String,
        enum: {
            values: ['active', 'closed'],
            message: "Status must be active or closed"
        },
        default: 'active'
    },
    final_deal_price: { type: Number }
}, { timestamps: true });

sessionSchema.index({ user_id: 1, status: 1 });
sessionSchema.index({ user_id: 1, product_id: 1 });

const sessionModel = mongoose.model('session',sessionSchema);

export default sessionModel;