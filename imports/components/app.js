import { get } from 'lodash';

import i18n from '../util/i18n';
import { Posts } from '../api';
import registerComponent from '../util/register-component';

import './app.scss';
import './app.html';

let count = 0;

function errorCallback(err) {
  if (err) {
    alert(i18n(err.error, err.details));

    if (err.reason) {
      console.error(error.reason);
    }
  }
}

class App {
  testMode = BlogJS.isTest ? 'on' : 'off';
  posts = [];
  editing = -1;

  constructor() {
    Tracker.autorun(() => {
      this.posts = Posts.findAll().fetch();
    });
  }

  editPost = (e, scope) => {
    const { index } = scope;

    if (this.editing > -1) {
      this.posts[this.editing].editing = undefined;
    }

    this.editing = index;

    const currentPost = this.posts[index];

    if (get(currentPost, `_permissions[${CURRENT_USER_ID}].save`, null) ||
        get(currentPost, '_permissions._world_.save', null)) {

      currentPost.editing = true;
      document.querySelectorAll('input.post-editor')[index].focus();
    }
  };

  finishEditing = (e, scope) => {
    const { index } = scope;

    this.editing = -1;
    this.posts[index].editing = undefined;
  };

  onChangePost = (e, scope) => {
    const { index } = scope;

    switch (e.key) {
      case 'Enter':
        this.finishEditing(e, scope);
        Posts.save(this.posts[index], null, errorCallback);
        break;

      case 'Escape':
        this.finishEditing(e, scope);
        break;

      default: // do nothing
    }
  };

  addPost = () => {
    Posts.save({ text: `Post ${count++}` }, null, errorCallback);
  };

  removePost = (el, scope) => {
    Posts.remove(this.posts[scope.index], errorCallback);
  };
}

registerComponent('app', App);
