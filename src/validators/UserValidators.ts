import { body,query } from "express-validator";
import User from "../models/User";


export class UserValidators {
    static signUp(){
        return [
            body('email', 'Email is Required').isEmail().custom((email,{req}) =>{
             return   User.findOne({email:email}).then(user =>{
                    if(user){
                        throw new Error('User Already Exist')
                    }else{
                        return true
                    }
                })
            }),

            body('password', 'Password is Required').isAlphanumeric()
            .isLength({min:8, max:20}).withMessage('Password Must be From 8-20 Characters only'),

            body('username', 'Username is Required').isString()
        ]
    }
    static verifyUser(){
         return [
            body('verification_token','Verification Token is Required').isNumeric(),
         ]
    }

    static resendVerificationEmail(){
        return [
            query('email', 'Email Is Required').isEmail()
        ]
    }

    static updatePassword(){
        return [
            body('password', 'Password is Required').isAlphanumeric(),
            body('confirm_password', 'Confirm Password Is Required').isAlphanumeric(),
            body('new_password', 'New Password Is Required').isAlphanumeric()
            .custom((newPassword, {req}) => {
                if(newPassword === req.body.confirm_password) {
                    return true;
                } else {
                    req.errorStatus = 422;  
                    throw new Error('Password and Confirm Password Dose Not Match');
                }
            })
        ]
    }

    static resetPassword() {
        return [
            body('email', 'Email is Required').isEmail().custom((email, {req}) => {
                return    User.findOne({email:email}).then(user => {
                       if (user) {
                           req.user = user;
                           return true;
                       } else {
                           throw new Error('User Dose Not Exist');
                       }
                    })
               }),
            body('new_password', 'New Password Is Required').isAlphanumeric().custom((newPassword, {req}) =>{
                if(newPassword === req.body.confirm_password) {
                    return true;
                } else {
                    throw new Error('Confirm Password And New Password Dose Not Match')
                }
            }), 
            body('confirm_password', 'Confirm Password Is Required').isAlphanumeric(),
            body('reset_password_token', 'Reset Password token').isNumeric()
            .custom((token, {req}) => {
                if(Number (req.user.reset_password_token) === Number (token)) {
                    return true
                } else {
                    req.errorStatus = 422;
                    throw new Error('Reset Password Token is Invalid. Please try Again');
                }
            })
        ]
    }

    static login(){
        return [
            query('email', 'Email Is Required').isEmail().custom((email, {req}) => {
             return    User.findOne({email:email}).then(user => {
                    if (user) {
                        req.user = user;
                        return true;
                    } else {
                        throw new Error('User Dose Not Exist');
                    }
                 })
            }),
            query('password', 'Password Is Required').isAlphanumeric()
        ]
    }

    static sendResetPasswordEmail() {
        return [
            query('email').isEmail().custom((email,{req}) => {
              return  User.findOne({email:email}).then((user) => {
                    if(user) {
                        return true;
                    } else {
                        throw new Error('Email Dose Not Exist')
                    }
                })
            })
        ]
    }

    static verifyResetPasswordToken() {
        return [
            query('reset_password_token', 'Reset Password Token Is Required').isNumeric().custom((token, {req}) =>{
                return User.findOne({
                    reset_password_token: token, 
                    reset_password_token_time: {$gt: Date.now()}
                }).then((user) =>{
                    if(user) {
                        return true;
                    } else {
                        throw new Error('Token Dose Not Exist.Please Request For A New One')
                    }
            })
              })
        ]
    }

    static updateProfilePic() {
        return [
            body('profile_pic').custom((profilePic, {req}) => {
               if(req.file) {
                return true;
               } else {
                throw new Error('File not Uploaded')
               }
            })
        ]
    }
}