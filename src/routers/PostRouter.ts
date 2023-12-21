import { Router } from "express";
import { GlobalMiddleware } from "../middlewares/GlobalMiddleware";
import { PostValidators } from "../validators/PostValidators";
import { PostController } from "../controllers/PostController";
import Post from "../models/Post";

class PostRouter {
    public router : Router;

    constructor() {
        this.router = Router();
        this.getRoutes();
        this.postRoutes();
        this.patchRoutes();
        this.deleteRoutes();
    }

    getRoutes() {
        this.router.get('/me',GlobalMiddleware.authenticate, PostController.getPostByUser)
        this.router.get('/all',GlobalMiddleware.authenticate, PostController.getAllPosts)
        this.router.get('/:id',GlobalMiddleware.authenticate, PostValidators.getPostById(), GlobalMiddleware.checkError, PostController.getPostById)
    }

    postRoutes() {
        this.router.post('/add', GlobalMiddleware.authenticate, PostValidators.addPost(),GlobalMiddleware.checkError, PostController.addPost);
    }

    patchRoutes() {
        this.router.patch('/edit/:id', GlobalMiddleware.authenticate, PostValidators.editPost(), GlobalMiddleware.checkError, PostController.editPost);
    }

    deleteRoutes() {
        this.router.delete('/delete/:id', GlobalMiddleware.authenticate,PostValidators.deletePost(),GlobalMiddleware.checkError, PostController.deletePost)
    }
}

export default new PostRouter().router;