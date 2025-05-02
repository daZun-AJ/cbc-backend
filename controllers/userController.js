import bcrypt from "bcrypt"
import User from "../models/user.js";


export async function getUsers(req, res) {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}

export async function createUser(req, res) {
    if (req.body.role == "admin") {
        if (req.user == null) {
            res.status(403).json({
                message : "Unauthorized. Please login first"
            })
            return
        } else if (req.user.role != "admin") {
            res.status(403).json({
                message : "Unauthorized. You are not an admin"
            })
            return
        }
    }

    try {
        const hashedPassword = await bcrypt.hashSync(req.body.password, 10) 

        const user = new User({
            email : req.body.email,
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            password : hashedPassword,
            image : req.body.image,
            role : req.body.role
        })

        user.save()

        res.status(201).json({
            message : "User created successfully"
        })
    } catch (err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}

