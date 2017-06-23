import { Promise } from 'meteor/promise';
import { Meteor } from 'meteor/meteor';
import merge from 'lodash.merge';
import { Mongo } from 'meteor/mongo';

const checkCollectionPermissions = {};

function initializePermissions(permissions, collectionName) {
  function checkPermission({ collection, userId, operation, collectionName }) {
    if (Meteor.isServer) {
      const permissions = collection.findOne({ _id: 'PERMISSIONS' });
      const message = `UserId (${userId}) may not ${operation} on '${collectionName}'`;

      if (!permissions || ((!permissions[userId] || !permissions[userId][operation]) &&
          (!permissions._world_ || !permissions._world_[operation]))) {

        if (operation === 'read') {
          return false;
        }

        throw new Error(message);
      }

      return true;
    }
  }

  permissions.forEach(operation => {
    checkCollectionPermissions[operation] = (collection, userId) =>
        checkPermission({ collection, userId, operation, collectionName });
  });
}

function setupPublications(collection, collectionName) {
  Meteor.publish(collectionName, function() { // cannot be an arrow function
    if (checkCollectionPermissions.read(collection, CURRENT_USER_ID)) {
      console.log(collection.find({ _permissions: { $ne: null } }).fetch()[0]._permissions[CURRENT_USER_ID].read);

      return collection.find({
        $or: [
          { _permissions: { [CURRENT_USER_ID]: { read: true } } },
          { _permissions: { _world_: { read: true } } }
        ]
      });

    } else {
      return this.ready();
    }
  });
}

function createMethods(collection, collectionName) {
  // add permissions for a user
  Meteor.methods({
    [`${collectionName}.addPermission`](userId, operation) {
      checkCollectionPermissions['change collection permissions'](collection, global.CURRENT_USER_ID);
      collection.update({_id: 'PERMISSIONS'}, {
        $set: { [`${userId}.${operation}`]: true }
      }, { upsert: true });
    }
  });

  // remove permissions for a user
  Meteor.methods({
    [`${collectionName}.removePermission`](userId, operation) {
      checkCollectionPermissions['change collection permissions'](collection, global.CURRENT_USER_ID);
      collection.update({_id: 'PERMISSIONS'}, {
        $unset: { [`${userId}.${operation}`]: false }
      });
    }
  });

  // upsert a document with permission metadata
  Meteor.methods({
    [`${collectionName}.save`](model, query, cb) {
      checkCollectionPermissions.save(collection, global.CURRENT_USER_ID);

      let existing = null;

      if (query) {
        existing = collection.findOne(query);
      } else if (model._id) {
        existing = collection.findOne(model._id);
      }

      if (existing) {
        collection.update(existing, model, cb);
      } else {
        let modelToSave = model;

        if (!model._permissions) {
          modelToSave = merge(model, {
            _permissions: {
              [CURRENT_USER_ID]: {
                read: true,
                save: true,
                remove: true
              }
            }
          });
        }

        collection.insert(modelToSave, cb);
      }
    }
  });
}

function createApi(collection, collectionName) {
  return {
    addPermission(userId, operation) {
      Meteor.call(`${collectionName}.addPermission`, userId, operation);
    },

    removePermission(userId, operation) {
      Meteor.call(`${collectionName}.removePermission`, userId, operation);
    },

    findById(id) {
      return collection.findOne(id);
    },

    findOne: collection.findOne,

    find: collection.find,

    findAll() {
      return collection.find();
    },

    save(model, query, callback) {
      Meteor.call(`${collectionName}.save`, model, query, callback);
    },

    originalCollection: collection
  }
}

function createCollection(name, schema) {
  const collection = new Mongo.Collection(name);

  /**
   * @todo - validate against the schema in save()
   * use aldeed:simple-schema or joi?
   */
  collection.schema = schema;

  collection.removeAll = () => collection.remove({});

  initializePermissions([
    'read',
    'remove',
    'save',
    'change collection permissions'
  ], name);

  if (Meteor.isServer) {
    setupPublications(collection, name);
  } else {
    Meteor.subscribe(name);
  }

  createMethods(collection, name);

  return createApi(collection, name);
}

export default createCollection;
