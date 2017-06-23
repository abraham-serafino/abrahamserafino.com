import rivets from 'rivets';

import { Posts } from '../api';

import './app.html';

let count = 0;

rivets.components['app'] = {
  template: () => Blaze.toHTML(Template['app']),
  initialize() {
    const model = {
      testMode: BlogJS.isTest ? 'on' : 'off',

      addPost() {
        Posts.save({ text: `Post ${count++}` });
      },

      posts: []
    };

    Tracker.autorun(() => {
      model.posts = Posts.findAll().fetch();
    });

    return { model };
  }
};
