import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/user.js";
import dotenv from "dotenv"
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";
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

export async function loginWithGoogle(req, res) {
    const token = req.body.accessToken

    if (token == null) {
        res.status(400).json({
            message : "Access token is required"
        })
        return
    }
        
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    console.log(response.data);

    const user = await User.findOne({ email : response.data.email })

    if (user == null) {
        const newUser = new User({
            email : response.data.email,
            firstName : response.data.given_name,
            lastName : response.data.family_name,
            password : "googleUser",
            image : response.data.picture
        })

        await newUser.save()
        
        const token = jwt.sign({
            email : newUser.email,
            firstName : newUser.firstName,
            lastName : newUser.lastName,
            role : newUser.role,
            image : newUser.image
        }, process.env.JWT_KEY)

        res.json({
            message : "Login successful",
            token : token,
            role : newUser.role
        })

    } else {

        const token = jwt.sign({
            email : user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            role : user.role,
            image : user.image
        }, process.env.JWT_KEY)

        res.json({
            message : "Login successful",
            token : token,
            role : user.role
        })

    }
    
}

// manage the sending of emails
const transport = nodemailer.createTransport({
    service : "gmail",
    host : "smtp.gmail.com",
    port : 587,
    secure : false,
    auth : {
        user : "dasuna39@gmail.com",
        pass : process.env.GENERATED_APP_PASSWORD
    }
})

export async function sendOTP(req, res) {
    const randomOTP = Math.floor(100000 + Math.random() * 900000)
    const email = req.body.email;

    if (email == null) {
        res.status(400).json({
            message : "Email is required"
        })
        return
    }

    const user = await User.findOne({ email : email })

    if (user == null) {
        res.status(404).json({
            message : "User not found"
        })
        return;
    }

    // delete all previous otps
    await OTP.deleteMany({ email : email })

    const message = {
        from: "dasuna39@gmail.com",
        to: email,
        subject: "Password Reset OTP for Crystal Beauty Clear.",
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px 20px;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px; text-align: center;">
                    <h2 style="color: #4CAF50; margin-bottom: 20px;">Crystal Beauty Clear</h2>
                    <p style="font-size: 16px; color: #555;">You requested to reset your password. Use the following OTP to complete the process:</p>
                    <div style="font-size: 24px; font-weight: bold; margin: 20px auto; background-color: #f0f0f0; padding: 15px; border-radius: 8px; width: fit-content; color: #333;">
                        ${randomOTP}
                    </div>
                    <p style="font-size: 14px; color: #888;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                </div>
            </div>
        `
    };
    
    const otp = new OTP({
        email : email,
        otp : randomOTP
    })

    await otp.save()
        
    transport.sendMail(message , (error, infor) => {
        if (error) {
            res.status(500).json({
                message : "Internal server error",
                error : error
            })
        } else {
            res.json({
                message : "OTP sent successfully",
                otp : randomOTP
            })
        }
    })
}


export async function resetPassword(req, res) {
    const otp = req.body.otp
    const email = req.body.email
    const newPassword = req.body.newPassword

    const response = await OTP.findOne({ email : email })

    if (response == null) {
        res.status(500).json({
            message : "No OTP request found. Please try again"
        })
        return
    }

    if (otp == response.otp) {
        await OTP.deleteMany({ email : email })
        const hashedPassword = bcrypt.hashSync(newPassword, 10) 
        const response2 = await User.updateOne({ email : email }, { password : hashedPassword })
        res.json({
            message : "Password reset successful"
        })
    } else {
        res.status(403).json({
            message : "Invalid OTP. Please try again"
        })
        
    }

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