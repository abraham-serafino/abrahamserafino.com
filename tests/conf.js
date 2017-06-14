/* global jasmine */
const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['protractor/**/*-spec.js'],
  framework: 'jasmine',
  onPrepare: function () {
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: { displayStacktrace: true }
    }));
  },
  jasmineNodeOpts: {
    print: function() {}
  }
};
