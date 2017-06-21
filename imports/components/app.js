import rivets from 'rivets';

import { Posts } from '../api';

import './app.html';

let count = 0;
let model = {
  data: {}
};

rivets.components['app'] = {
  template: () => Blaze.toHTML(Template['app']),
  initialize() {
    model.testMode = BlogJS.isTest ? 'on' : 'off';

    model.addPost = () => {
      Posts.save({ text: `Post ${count++}` });
    };

    Tracker.autorun(() => {
      model.data.posts = Posts.findAll().fetch();
    });

    return model;
  }
};
