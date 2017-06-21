import createCollection from './util/collections';

export const Posts = BlogJS.isTest ?
  createCollection('posts-test') :
    createCollection('posts');
