import createCollection from './util/collections';

const PostsSchema = {
  _id: { type: String, optional: true },
  text: { type: String, label: 'Text' },
  _permissions: { type: Object, blackbox: true, optional: true }
};

export const Posts = BlogJS.isTest ?
  createCollection('test-posts', PostsSchema) :
    createCollection('posts', PostsSchema);
