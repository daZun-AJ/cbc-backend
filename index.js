import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";


const app = express();

app.use(bodyParser.json());

app.use(
    (req, res, next) => {
        const tokenString = req.header("Authorization");

        if (tokenString != null) {
            const token = tokenString.replace("Bearer ", "");

            jwt.verify(token, "secret-password",
                (err, decoded) => {
                    if (decoded != null) {
                        req.user = decoded;
                        next();
                    } else {
                        res.status(404).json({
                            message: "Invalid token"
                        })
                    }
                }
            )
        }
        else {
            next();
        }
    }
)

mongoose.connect("mongodb+srv://admin:123@cluster0.5xzx0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("Database is connected successfully");
    }).catch(() => {
        console.log("Database is not connected successfully");
    })



app.use('/users', userRouter);
app.use('/products', productRouter);



app.listen(5000, () => {
    console.log("Server is running on port 5000");
})