import Review from "../models/review.js";


export async function getReviews(req, res) {
    try {
        const reviews = await Review.find()
        res.json(reviews)
    } catch (err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}

export async function createReview(req, res) {
    // get user info
    if (req.user == null) {
        res.status(403).json({
            message : "Unauthorized. Please login first"
        })
        return
    }

    // add user's name (in not provided)
    const reviewInfo = req.body
    if (reviewInfo.name == null) {
        reviewInfo.name = req.user.firstName + " " + req.user.lastName
    }

    // check if user is blocked
    if (req.user.isBlocked) {
        res.status(403).json({
            message : "Unauthorized. You are blocked"
        })
        return
    }

    if (!req.body.rating || !req.body.review) {
        res.status(400).json({ 
            message: "Rating and review are required." 
        });
        return 
    }

    let reviewId = "REV00001"
    const lastReview = await Review.find().sort({ date : -1 }).limit(1)
    if (lastReview.length > 0) {
        const lastReviewId = lastReview[0].reviewId
        let lastReviewNumberString = lastReviewId.replace("REV", "")
        let lastReviewNumber = parseInt(lastReviewNumberString)
        let newReviewNumber = lastReviewNumber + 1
        let newReviewNumberString = String(newReviewNumber).padStart(5, "0")
        reviewId = "REV" + newReviewNumberString
    }

    try {
        const review = new Review({
            reviewId: reviewId,
            email: req.user.email,
            name: reviewInfo.name,
            rating: req.body.rating,
            review: req.body.review,
            images: req.body.images
        })
        

        const savedReview = await review.save()

        res.status(201).json({
            message : "Review saved successfully",
            review : savedReview
        })
    } catch (err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}