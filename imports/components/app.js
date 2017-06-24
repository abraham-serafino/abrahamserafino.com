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
  editingIndex = -1;

  constructor() {
    Tracker.autorun(() => {
      this.posts = Posts.findAll().fetch();
    });
  }

  editPost(event, scope) {
    const { index } = scope;
    const currentPost = scope.posts[index];

    if (get(currentPost, `_permissions[${CURRENT_USER_ID}].save`, null) ||
        get(currentPost, '_permissions._world_.save', null)) {

      scope.editingIndex = index;
      document.querySelectorAll('input.post-editor')[index].focus();
    }
  }

  finishEditing(event, scope) {
    scope.editingIndex = -1;
  }

  isEditing(editingIndex, index) {
    return editingIndex === index;
  }

  onChangePost(event, scope) {
    const { index } = scope;

    switch (event.key) {
      case 'Enter':
        scope.finishEditing(event, scope);
        Posts.save(scope.posts[index], null, errorCallback);
        break;

      case 'Escape':
        scope.finishEditing(event, scope);
        break;

      default: // do nothing
    }
  }

  addPost() {
    Posts.save({ text: `Post ${count++}` }, null, errorCallback);
  }

  removePost(event, scope) {
    Posts.remove(scope.posts[scope.index], errorCallback);
  }
}

registerComponent('app', App);
