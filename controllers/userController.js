import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.js";
import dotenv from "dotenv"
dotenv.config()


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

export function userLogin(req, res) {
    const email = req.body.email
    const password = req.body.password

    User.findOne({ email : email })
        .then((user) =>  {
            if (user == null) {
                res.status(404).json({
                    message : "User not found"
                })
            } else {
                const isPasswordCorrect = bcrypt.compareSync(password, user.password)

                if (isPasswordCorrect) {
                    const token = jwt.sign({
                        email : user.email,
                        firstName : user.firstName,
                        lastName : user.lastName,
                        role : user.role,
                        image : user.image,
                        isBlocked : user.isBlocked
                    }, process.env.JWT_KEY)

                    res.json({
                        message : "Login successful",
                        token : token,
                        role : user.role
                    })
                } else {
                    res.status(401).json({
                        message : "Invalid password"
                    })
                }
            }
        })
}

export async function editUser(req, res) {
    const email = req.params.email
    const updatedData = req.body

    try {
        
        await User.updateOne({ email : email }, updatedData)

        res.json({
            message : "User updated successfully"
        })
    } catch (err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}

export function isAdmin(req) {
    if (req.user == null) {
        return false
    }

    if (req.user.role != "admin") {
        return false
    }

    return true
}