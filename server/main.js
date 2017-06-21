import generateTestData from '../imports/util/generate-test-data';
import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  if (BlogJS.isTest) {
    generateTestData();
  }
});
