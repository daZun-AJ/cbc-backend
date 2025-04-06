import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";


export function getUsers(req, res) {
    User.find()
        .then((users) => {
            res.json(users);
    })    
}


export function saveUser(req, res) {
    
    if (req.body.role == "admin") {
        if (req.user != null) {
            if (req.user.role != "admin") {
                res.status(403).json({
                    message : "You are not authorized to create an admin account."
                })
                return
            }
        } else {
            res.status(403).json({
                message : "You are not authorized to create an admin account. Please login first"
            })
            return
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        email : req.body.email,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        password : hashedPassword,
        role : req.body.role,
        img : req.body.img
    });

    user.save()
        .then(() => {
            res.json({
                message : "User saved successfully"
            })
        }).catch(() => {
            res.status(500).json({
                message : "User not saved successfully"
            })
        })
}


export function loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email : email})
        .then((user) => {
            if (user == null) {
                res.status(404).json({
                    message : "User not found"
                })
            }
            else {
                const isPasswordCorrect = bcrypt.compareSync(password, user.password);

                if (isPasswordCorrect) {
                    const token = jwt.sign({
                        email : user.email,
                        firstName : user.firstName,
                        lastName : user.lastName,
                        role : user.role,
                        img : user.img
                    }, "secret-password")

                    res.json({
                        message : "Login successful",
                        token : token
                    })
                }
            }
        })
}



export function isAdmin(req) {
    if (req.user == null) {
        return false;
    }
    if (req.user.role != "admin") {
        return false;
    }
    return true;
}