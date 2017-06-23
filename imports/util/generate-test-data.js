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
    Posts.save({ text: `Post ${count}` });
  }

  for (let count = 3; count < 6; ++count) {
    Posts.save({ text: `Post ${count}` });
  }
}
