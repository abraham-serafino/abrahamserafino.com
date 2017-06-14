browser.ignoreSynchronization = true;

describe('Posts component', function () {
  beforeEach(function () {
    browser.get('http://localhost:3000');
  });

  it('displays 3 posts', function() {
    const $li = element.all(by.css('li'));
    expect($li.count()).toEqual(3);
  });

  it('clicking the button adds a post', function() {
    element(by.css('button')).click();
    const $li = element.all(by.css('li'));
    expect($li.count()).toEqual(4);
  });
});
