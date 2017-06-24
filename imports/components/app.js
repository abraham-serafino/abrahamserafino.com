import { Posts } from '../api';
import registerComponent from '../util/register-component';

import './app.scss';
import './app.html';

let count = 0;

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
    this.posts[index].editing = true;

    document.querySelectorAll('input.post-editor')[index].focus();
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
        Posts.save(this.posts[index]);
        break;

      case 'Escape':
        this.finishEditing(e, scope);
        break;

      default: // do nothing
    }
  };

  addPost = () => {
    Posts.save({ text: `Post ${count++}` });
  };

  removePost = (el, scope) => {
    Posts.remove(this.posts[scope.index]);
  };
}

registerComponent('app', App);
