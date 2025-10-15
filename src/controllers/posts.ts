import { Request, Response } from "express";
import { IUserDocument } from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";

import {
  throwPostNotFoundError,
  throwActionNotAllowedError
} from "../utils/throwError";
import { checkBody } from "../utils/validator";

import { wrapAsync } from "../helpers/wrap-async";

// 扩展Request接口，添加currentUser属性
declare module 'express' {
  interface Request {
    currentUser?: IUserDocument;
  }
}

/**
 * show posts list
 *
 * @Method GET
 * @URL /api/posts
 *
 */
export const getPosts = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { page } = req.query

    const options = {
      page: parseInt(page as string),
      limit: 10,
      sort: { createdAt: -1 }
    };

    const posts = await Post.paginate({}, options);

    res.json({
      success: true,
      data: posts
    });
  }
);

/**
 * show single post
 *
 * @Method GET
 * @URL /api/posts/:id
 *
 */
export const getPost = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (post) {
      res.json({
        success: true,
        data: { post }
      });
    } else {
      throwPostNotFoundError();
    }
  }
);

/**
 * update single post
 *
 * @Method PUT
 * @URL /api/posts/:id
 *
 */
export const updatePost = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const post = await Post.findById(id);

    const { body } = req.body;

    checkBody(body);

    const user = req.currentUser as IUserDocument;

    if (post) {
      if ((post.user as any).equals(user._id)) {
        const resPost = await Post.findByIdAndUpdate(
          id,
          { body },
          { new: true }
        );

        res.json({
          success: true,
          data: { message: "updated successfully", post: resPost }
        });
      } else {
        throwActionNotAllowedError();
      }
    } else {
      throwPostNotFoundError();
    }
  }
);

/**
 * delete a post
 *
 * @Method DELETE
 * @URL /api/posts/:id
 *
 */
export const deletePost = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const post = await Post.findById(id);

    const user = req.currentUser as IUserDocument;

    if (post) {
      if ((post.user as any).equals(user._id)) {
        await Post.findByIdAndDelete(id);

        await Comment.deleteMany({ post: post._id });

        res.json({
          success: true,
          data: { message: "deleted successfully" }
        });
      } else {
        throwActionNotAllowedError();
      }
    } else {
      throwPostNotFoundError();
    }
  }
);

/**
 * create post
 *
 * @Method POST
 * @URL /api/posts
 *
 */
export const createPost = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = req.currentUser as IUserDocument;

    const { body } = req.body;

    checkBody(body);

    const newPost = new Post({
      body,
      user: user._id
    });

    const post = await newPost.save();

    res.json({
      success: true,
      data: { message: "created successfully", post }
    });
  }
);

/**
 * login user like post
 *
 * @Method POST
 * @URL /api/posts/:id/like
 *
 */
export const likePost = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const post = await Post.findById(id);

    const user = req.currentUser as IUserDocument;

    if (post) {
      if (post.likes.find((like: any) => like.equals(user._id))) {
        post.likes = post.likes.filter((like: any) => !like.equals(user._id));
      } else {
        post.likes.push(user._id);
      }

      await post.populate("likes");

      await post.save();

      res.json({
        success: true,
        data: { post }
      });
    } else {
      throwPostNotFoundError();
    }
  }
);
