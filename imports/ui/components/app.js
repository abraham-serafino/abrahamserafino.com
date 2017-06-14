import PostsCollection from '../../api/posts';
import rivets from 'rivets';
import './app.html';

let count = 0;

rivets.components['app'] = {
  template: () => Blaze.toHTML(Template['app']),
  initialize(element, attributes) {
    const posts = new PostsCollection();

    return {
      data: posts.data,
      testMode: isTest ? 'on' : 'off',
      addPost: (e, scope) => {
        posts.add({ text: `Post ${count++}` });
      }
    };
  }
};
