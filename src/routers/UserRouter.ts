import { Router } from "express";
import path = require("path");
import { UserController } from "../controllers/UserController";
import { body } from "express-validator";
import { UserValidators } from "../validators/UserValidators";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { Utils } from "../utils/Utils";

 class UserRouter {
    public router:Router;

    constructor(){
        this.router = Router();
        this.getRoutes();
        this.postRoutes();
        this.patchRoutes();
        this.deleteRoutes();
    }

    getRoutes(){
        this.router.get('/send/verification/email', GlobalMiddleware.authenticate, UserController.resendVerificationEmail)
        this.router.get('/login', UserValidators.login(),GlobalMiddleware.checkError, UserController.login)
        this.router.get('/reset/password', UserValidators.sendResetPasswordEmail(), GlobalMiddleware.checkError, UserController.sendResetPasswordEmail)
        this.router.get('/verify/resetPasswordToken', UserValidators.verifyResetPasswordToken(), GlobalMiddleware.checkError, UserController.verifyResetPasswordToken)
    }

    postRoutes(){
        this.router.post('/signup',UserValidators.signUp(), GlobalMiddleware.checkError, UserController.signUp);
       
    }

    patchRoutes(){
        this.router.patch('/verify', GlobalMiddleware.authenticate, UserValidators.verifyUser(), GlobalMiddleware.checkError, UserController.verify);
        this.router.patch('/update/password', GlobalMiddleware.authenticate, UserValidators.updatePassword(),GlobalMiddleware.checkError, UserController.updatePassword)
        this.router.patch('/reset/password', UserValidators.resetPassword(),GlobalMiddleware.checkError, UserController.resetPassword)
        this.router.patch('/update/profilePic',new Utils().multer.single('profile_pic'), GlobalMiddleware.authenticate, UserValidators.updateProfilePic(), GlobalMiddleware.checkError, UserController.updateProfilePic)
    }

    deleteRoutes(){}
}

export default new UserRouter().router;