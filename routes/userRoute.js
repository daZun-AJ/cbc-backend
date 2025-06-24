import express from "express"
import { createUser, editUser, getUsers, loginWithGoogle, resetPassword, sendOTP, userLogin } from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.get("/", getUsers)
userRouter.post("/", createUser)
userRouter.post("/login", userLogin)
userRouter.put("/:email", editUser)
userRouter.post("/login/google", loginWithGoogle)
userRouter.post("/send-otp", sendOTP)
userRouter.post("/reset-password", resetPassword)

export default userRouter