import { Meteor } from 'meteor/meteor';

// eslint-disable-next-line no-undef
BlogJS = {
  isTest: Meteor.settings.public.isTest
};

if (BlogJS.isTest) {
  global.CURRENT_USER_ID = 'TEST_USER';
}
