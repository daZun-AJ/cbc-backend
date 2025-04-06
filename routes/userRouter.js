import express from "express";
import { getUsers, loginUser, saveUser } from "../controllers/userContoller.js";


const userRouter = express.Router();

userRouter.get('/', getUsers);
userRouter.post('/', saveUser);
userRouter.post('/login', loginUser);


export default userRouter;