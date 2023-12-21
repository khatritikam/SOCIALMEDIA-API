import { body,param,query } from "express-validator";
import Post from "../models/Post";
import Comment from "../models/Comment";

export class CommentValidators {
        static addComment() {
            return [
                body('content','Content Is Required').isString(),
                param('id').custom((id, {req}) =>{
                  return  Post.findOne({_id: id}).then((post) => {
                            if(post) {
                                req.post = post;
                                return true
                            } else {
                                throw new Error('Post Dose Not Exist')
                            }
                    })
                })
            ]
        }

        static editComment() {
            return [
                body('content','Content is Required').isString()
            ]
        }

        static deleteComment() {
            return [
                param('id').custom((id,{req}) => {
                    return Comment.findOne({_id: id}).then((comment) => {
                        if(comment) {
                            req.comment = comment;
                            return true;
                        } else {
                            throw new Error('Comment Dose Not Exist')
                        }
                    })
                })
            ]
        }
}