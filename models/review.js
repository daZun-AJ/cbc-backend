import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
    reviewId : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    rating : {
        type : Number,
        required : true
    },
    review : {
        type : String,
        required : true
    },
    images : [
        { type : String }
    ],
    date : {
        type : Date,
        required : true,
        default : Date.now
    }
})

const Review = mongoose.model("reviews", reviewSchema)

export default Review