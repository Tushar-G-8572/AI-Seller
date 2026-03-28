import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index:true,
        match: [/\S+@\S+\.\S+/, "Please use a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
        minlength: 6
    },
    
}, {
    timestamps: true 
});


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});


userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


const UserModel = mongoose.model("user", userSchema);
export default UserModel;