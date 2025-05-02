import express from "express"
import { createUser, getUsers, userLogin } from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.get("/", getUsers)
userRouter.post("/", createUser)
userRouter.post("/login", userLogin)

export default userRouter