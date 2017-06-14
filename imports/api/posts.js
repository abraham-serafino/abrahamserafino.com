import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

let Posts;

if (isTest) {
  Posts = new Mongo.Collection('posts');
} else {
  Posts = new Mongo.Collection('posts-test');
}

const addPost = new ValidatedMethod({
  name: 'posts.add',

  validate: new SimpleSchema({
    text: {
      type: String,
      label: 'Text'
    }
  }).validator(),

  run({ text }) {
    Posts.insert({text});
  }
});

let exports;

if (Meteor.isClient) {
  class PostsCollection {
    constructor() {
      const subscription = Meteor.subscribe('posts');
      this.data = {};
      Tracker.autorun(() => {
        this.data.posts = (subscription.ready) ? this.getAll() : [];
      });
    }

    getAll = () => Posts.find().fetch();
    add = ({ text }) => addPost.call({ text });
  }

  exports = PostsCollection;
} else if (Meteor.isServer) {
  Meteor.publish('posts', () => Posts.find());
  exports = Posts;
}

export default exports;
