import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import jwt, { decode } from "jsonwebtoken"
import cors from "cors"
import userRouter from "./routes/userRoute.js"
import productRouter from "./routes/productRoute.js"
import orderRouter from "./routes/orderRoute.js"
import reviewRouter from "./routes/reviewRoute.js"
import dotenv from "dotenv"
dotenv.config()

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use(
    (req, res, next) => {
        const tokenString = req.header("Authorization")

        if (tokenString != null) {
            const token = tokenString.replace("Bearer ", "")

            jwt.verify(token, "secret-password123", 
                (err, decoded) => {
                    if (decode != null) {
                        req.user = decoded
                        next()
                    } else {
                        res.status(404).json({
                            message : "Invalid token"
                        })
                    }
                }
            )
        } else {
            next()
        }
    }
)


mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Connected to database"))
    .catch(() => console.log("Failed to connect to database"))


app.use("/api/users", userRouter)
app.use("/api/products", productRouter)
app.use("/api/orders", orderRouter)
app.use("/api/reviews", reviewRouter)


app.listen(5000, () => {
    console.log("Server is running on port 5000")
})