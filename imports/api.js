import Joi from 'joi';

import createCollection from './util/collections';

const PostsSchema = {
  _id: Joi.string(),
  text: Joi.string().required(),
  _permissions: Joi.any()
};

export const Posts = BlogJS.isTest ?
  createCollection('test-posts', PostsSchema) :
    createCollection('posts', PostsSchema);
