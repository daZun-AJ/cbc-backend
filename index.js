import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import userRouter from "./routes/userRoute.js"

const app = express()

app.use(bodyParser.json())


mongoose.connect("mongodb+srv://admin:123@cluster0.uu2dhg2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Connected to database"))
    .catch(() => console.log("Failed to connect to database"))


app.use("/users", userRouter)



app.listen(5000, () => {
    console.log("Server is running on port 5000")
})