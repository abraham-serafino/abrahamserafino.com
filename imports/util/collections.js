import Joi from 'joi';
import { merge, get } from 'lodash';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

let defaultPermissions = {};
let permissionsCollection = new Mongo.Collection('collection-permissions');
const checkPermissions = {};

function initializePermissions(permissions, collectionName) {
  function checkPermission({ userId, operation, collectionName }) {
    if (Meteor.isServer) {
      const permissions = permissionsCollection.findOne({ collection: collectionName });

      if (!permissions || ((!permissions[userId] || !permissions[userId][operation]) &&
          (!permissions._world_ || !permissions._world_[operation]))) {

        if (operation === 'read') {
          return false;
        }

        const error = `collection.permission.denied`;
        const reason = `UserId ${userId} lacks ${operation} permissions on ${collectionName}`;
        const details = { operation, collection: collectionName };
        throw new Meteor.Error(error, reason, details);
      }

      return true;
    }
  }

  permissions.forEach(operation => {
    checkPermissions[operation] = userId =>
        checkPermission({ userId, operation, collectionName });
  });
}

function setupPublications(collection, collectionName) {
  Meteor.publish(collectionName, function() { // cannot be an arrow function
    if (checkPermissions.read(CURRENT_USER_ID)) {
      return collection.find({
        $or: [
          { [`_permissions.${CURRENT_USER_ID}.read`]: true },
          { '_permissions._world_.read': true }
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
      checkPermissions['change collection permissions'](CURRENT_USER_ID);
      permissionsCollection.update({ collection: collectionName }, {
        $set: { [`${userId}.${operation}`]: true }
      }, { upsert: true });
    }
  });

  // remove permissions for a user
  Meteor.methods({
    [`${collectionName}.removePermission`](userId, operation) {
      checkPermissions['change collection permissions'](CURRENT_USER_ID);
      permissionsCollection.update({ collection: collectionName }, {
        $unset: { [`${userId}.${operation}`]: false }
      });
    }
  });

  // upsert a document with permission metadata
  Meteor.methods({
    [`${collectionName}.save`](model, query) {
      const { error } = collection.schema.validate(model);

      if (error) {
        throw new Meteor.Error(error.details[0].message);
      }

      checkPermissions.save(CURRENT_USER_ID);

      let existing = null;

      if (query) {
        existing = collection.findOne(query);
      } else if (model._id) {
        existing = collection.findOne(model._id);
      }

      if (existing) {
        if (get(existing, `_permissions[${CURRENT_USER_ID}].save`, null) ||
            get(existing, '_permissions._world_.save', null)) {

          collection.update(existing, model, { validate: false });
        } else {
          const error = 'save.permission.denied';
          const reason = `UserId ${CURRENT_USER_ID} lacks save permissions on document: ${JSON.stringify(existing)}`;

          throw new Meteor.Error(error, reason);
        }
      } else {
        let toInsert = (!model._permissions) ?
            merge(model, { _permissions: defaultPermissions }) :
            model;

          collection.insert(toInsert);
      }
    }
  });

  // remove any document(s) matching the query
  Meteor.methods({
    [`${collectionName}.remove`](query) {
      checkPermissions.remove(CURRENT_USER_ID);

      const permissionQuery = {
        $and: [query, {
          $or: [
            { [`_permissions.${CURRENT_USER_ID}.remove`]: true },
            { '_permissions._world_.remove': true }
          ]
        }]
      };

      if (!collection.findOne(permissionQuery)) {
        const error = 'remove.permission.denied';
        const reason = `UserId ${CURRENT_USER_ID} lacks remove permissions on document for query: ${JSON.stringify(query)}`;
        throw new Meteor.Error(error, reason);
      }

      collection.remove(permissionQuery);
    }
  });

  // remove all documents from the collection
  Meteor.methods({
    [`${collectionName}.removeAll`]() {
      checkPermissions.remove(CURRENT_USER_ID);

      if (!collection.find({
            $and: [
              { $or: [
                { [`_permissions.${CURRENT_USER_ID}.remove`]: { $exists: false } },
                { [`_permissions.${CURRENT_USER_ID}.remove`]: false }
              ] },

              { $or: [
                { [`_permissions._world_.remove`]: { $exists: false } },
                { [`_permissions._world_.remove`]: false }
              ] }
            ]
          }).fetch().length) {

        collection.remove({});
      } else {
        const error = 'removeAll.permission.denied';
        const reason = `UserId: ${CURRENT_USER_ID} lacks permission to remove at least one item in ${collectionName}`;
        throw new Meteor.Error(error, reason);
      }
    }
  });
}

function createApi(collection, collectionName) {
  return {
    addPermission(userId, operation) {
      Meteor.call(`${collectionName}.addPermission`, userId, operation);
    },

    defaultPermissions: {
      [CURRENT_USER_ID]: {
        read: true,
        save: true,
        remove: true
      },

      _world_: { read: true }
    },

    find: collection.find,

    findAll() {
      return collection.find();
    },

    findById(id) {
      return collection.findOne(id);
    },

    findOne: collection.findOne,

    remove(query, callback) {
      Meteor.call(`${collectionName}.remove`, query, callback);
    },

    removeAll(callback) {
      Meteor.call(`${collectionName}.removeAll`, callback);
    },

    removePermission(userId, operation) {
      Meteor.call(`${collectionName}.removePermission`, userId, operation);
    },

    save(model, query, callback) {
      defaultPermissions = this.defaultPermissions;
      Meteor.call(`${collectionName}.save`, model, query, callback);
    },

    originalCollection: collection,

    permissionsCollection
  }
}

function createCollection(name, schema) {
  const collection = new Mongo.Collection(name);

  if (schema) {
    collection.schema = Joi.compile(schema);
  }

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
