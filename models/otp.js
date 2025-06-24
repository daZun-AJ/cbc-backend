import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
    email : {   // email of the user
        type : String,
        required : true
    },
    otp : {
        type : Number,
        required : true
    }
})

const OTP = mongoose.model("otps", otpSchema)

export default OTP


// We create this model to store the otp sent to the user