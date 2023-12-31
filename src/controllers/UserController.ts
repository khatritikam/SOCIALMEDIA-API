import User from '../models/User';
import { Utils } from '../utils/Utils';
import { NodeMailer } from '../utils/NodeMailer';
import * as Bcrypt from 'bcrypt';
import { query } from 'express-validator';
import * as Jwt from 'jsonwebtoken';
import { getEnvironmentVariables } from '../environments/env';


export class UserController {

    static async signUp(req, res, next) {
        const email = req.body.email;
        const password = req.body.password;
        const username = req.body.username;
        const verificationToken = Utils.generateVerificatonToken()


        try {
            const hash = await Utils.encryptPassword(password)
            const data = {
                email: email,
                password: hash,
                username: username,
                verification_token: verificationToken,
                verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME,
                created_at: new Date(),
                updated_at: new Date()
            };

            let user = await new User(data).save();
            res.send(user);
            await NodeMailer.sendEmail({
                to: ['mihirkhatri2597@gmail.com'],
                subject: 'Email Verification',
                html: `<h1>${verificationToken}</h1>`
            })

        } catch (e) {
            next(e)
        }
    }


    static async verify(req, res, next) {
        const verificationToken = req.body.verification_token;
        const email = req.user.email;

        try {
            const user = await User.findOneAndUpdate({
                email: email, verification_token: verificationToken,
                verification_token_time: { $gt: Date.now() }
            }, { verified: true }, { new: true })
            if (user) {
                res.send(user);
            } else {
                throw new Error('Verification Token Is Expired.Please Request For A New One')
            }
        } catch (e) {
            next(e)
        }
    }


    static async resendVerificationEmail(req, res, next) {
        const email = req.user.email;
        const verificationToken = Utils.generateVerificatonToken()
        try {
            const user: any = await User.findOneAndUpdate(
                { email: email },
                {
                    verification_token: verificationToken,
                    verification_token_time: Date.now() + new Utils().MAX_TOKEN_TIME
                });
            if (user) {
                NodeMailer.sendEmail({
                    to: [user.email],
                    subject: 'Email Verification',
                    html: `<h1>${verificationToken}</h1>`
                })
                res.json({
                    success: true
                })
            } else {
                throw Error('User Dose Not Exist')
            }
        } catch (e) {
            next(e)
        }
    }

    static async login(req, res, next) {
        const email = req.query.email;
        const password = req.query.password;
        const user = req.user;

        try {
            await Utils.comparePassword({
                plainPassword: password,
                encryptedPassword: user.password
            });
            const token = Jwt.sign({ email: user.email, user_id: user._id },
                getEnvironmentVariables().jwt_secret, { expiresIn: '120d' });

            const data = {
                user: user,
                token: token
            };
            res.json(data)
        } catch (e) {
            next(e);
        }
    }

   static async updatePassword(req, res, next){
        const user_id = req.user.user_id;
        const password = req.body.password;
        const confirmPassword = req.body.confirm_password;
        const newPassword = req.body.new_password;

        try {
          const user:any = await  User.findOne({_id:user_id})
            await Utils.comparePassword({
                   plainPassword:password,
                   encryptedPassword:user.password 
               });
            const encryptedPassword = await Utils.encryptPassword(newPassword);   
            const newUser = await User.findOneAndUpdate({_id:user_id},{password:encryptedPassword}, {new:true})
            res.send(newUser); 
           
        } catch (e) {
            next(e)
        }
    }

    static async resetPassword(req, res, next) {
        const user = req.user;
        const newPassword = req.body.new_password;
        try {
            const encryptedPassword = await Utils.encryptPassword(newPassword)
            const updateUser =  await User.findOneAndUpdate({_id: user._id}, 
                { updated_at: new Date(),
                  password: encryptedPassword}, {new:true})
            res.send(updateUser)
        } catch (e) {
            next(e)
        }
    }

    static async sendResetPasswordEmail(req, res, next) {
        const email = req.query.email;
        const resetPasswordToken = Utils.generateVerificatonToken();
         try {  
            const updateUser = await User.findOneAndUpdate({email:email},
                { updated_at: new Date(), 
                  reset_password_token : resetPasswordToken,
                  reset_password_token_time: Date.now() + new Utils().MAX_TOKEN_TIME}, {new: true});
            res.send(updateUser)
            await NodeMailer.sendEmail({
                to:[email], 
                subject: 'Reset Password Email', 
                html:`<h1>${resetPasswordToken}</h1>`
            })
         } catch (e) {
            next(e)
         }
    }

    static async verifyResetPasswordToken(req, res, next) {
        res.json({
            success: true
        })
    }

    
    static async updateProfilePic(req, res, next) {
       const userId = req.user.user_id;
       const fileUrl = 'http://localhost:4000/' + req.file.path;
      try {
      const user = await  User.findOneAndUpdate({_id: userId}, 
            { updated_at: new Date(),
               profile_pic_url : fileUrl
           }, {new: true});
           res.send(user)
   
      } catch (e) {
        next(e)
      }
    }
}