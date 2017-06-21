import rivets from 'rivets';
import { Router } from 'meteor/iron:router';

import '../imports/components/app';

Router.route('/', function() {
  rivets.init('app', document.querySelector('app'), {});
});
