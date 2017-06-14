import generateTestData from '../imports/api/generate-test-data';
import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  if (isTest) {
    generateTestData();
  }
});
