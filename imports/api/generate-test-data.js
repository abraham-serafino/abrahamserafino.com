import Posts from './posts';
import { resetDatabase } from 'meteor/xolvio:cleaner';

export default function generateTestData() {
  resetDatabase();

  for (let count = 3; count < 6; ++count) {
    Posts.insert({ text: `Post ${count}` });
  }
}
