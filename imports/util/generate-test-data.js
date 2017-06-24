import { Posts } from '../api';
import { resetDatabase } from 'meteor/xolvio:cleaner';

export default function generateTestData() {
  resetDatabase();

  Posts.originalCollection.insert({
    _id: 'PERMISSIONS',
    TEST_USER: { ['change collection permissions']: true }
  });

  Posts.addPermission('_world_', 'read');
  Posts.addPermission('TEST_USER', 'save');
  Posts.addPermission('TEST_USER', 'remove');

  for (let count = 1; count < 4; ++count) {
    Posts.originalCollection.insert({
      text: `Post ${count}`,
      _permissions: {
        TEST_USER: { read: true, remove: false }
      } });
  }

  for (let count = 4; count < 7; ++count) {
    Posts.save({ text: `Post ${count}` });
  }
}
