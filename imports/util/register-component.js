import rivets from 'rivets';

function registerComponent(name, controller) {
  rivets.components[name] = {
    template: () => Blaze.toHTML(Template['app']),
    initialize() {
      return new controller();
    }
  };
}

export default registerComponent;
