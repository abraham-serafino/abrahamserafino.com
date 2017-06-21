import { Posts } from '../api';
import { resetDatabase } from 'meteor/xolvio:cleaner';

export default function generateTestData() {
  resetDatabase();

  Posts.insert({
    _id: 'PERMISSIONS',
    TEST_USER: { ['change collection permissions']: true }
  });

  Posts.addPermission('TEST_USER', 'find');
  Posts.addPermission('TEST_USER', 'insert');
  Posts.addPermission('TEST_USER', 'update');
  Posts.addPermission('TEST_USER', 'remove');

  for (let count = 1; count < 4; ++count) {
    Posts.insert({ text: `Post ${count}` });
  }

  for (let count = 3; count < 6; ++count) {
    Posts.insert({ text: `Post ${count}`, _permissions: {
      TEST_USER: { find: true }
    } });
  }
}
