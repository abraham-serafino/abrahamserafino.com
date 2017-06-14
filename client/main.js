import { Router } from 'meteor/iron:router';
import '../imports/ui/components/app';

import rivets from 'rivets';

Router.route('/', function() {
  rivets.init('app', document.querySelector('app'), {});
});
