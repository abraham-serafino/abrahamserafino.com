import { Promise } from 'meteor/promise';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const checkCollectionPermissions = {};

function checkPermission({ collection, userId, operation, collectionName }) {
  if (Meteor.isServer) {
    const permissions = collection.findOne({ _id: 'PERMISSIONS' });
    const message = `UserId (${userId}) may not ${operation} on '${collectionName}'`;

    if (!permissions || ((!permissions[userId] || !permissions[userId][operation]) &&
        (!permissions._world_ || !permissions._world_[operation]))) {

      if (operation === 'find') {
        return false;
      }

      throw new Error(message);
    }

    return true;
  }
}

function setupPublications(collection, collectionName) {
  ['find', 'remove', 'update', 'insert', 'change collection permissions']
      .forEach(operation => {

    checkCollectionPermissions[operation] = (collection, userId) =>
        checkPermission({ collection, userId, operation, collectionName });
  });

  Meteor.publish(collectionName, function() {
    if (checkCollectionPermissions.find(collection, CURRENT_USER_ID)) {
      return collection.find({ $or: [
        { _permissions: { [CURRENT_USER_ID]: { find: true } } },
        { _permissions: { _world_: { find: true } } }
      ] });
    } else {
      return this.ready();
    }
  });
}

function createPermissionMethods(collection, collectionName) {
  // add or remove a permissions for a user
  ['add', 'remove'].forEach(method => {
    Meteor.methods({
      [`${collectionName}.${method}Permission`](userId, operation) {
        checkCollectionPermissions['change collection permissions'](collection, global.CURRENT_USER_ID);
        collection.update({_id: 'PERMISSIONS'}, {
          $set: {
            [`${userId}.${operation}`]: method === 'add'
          }
        }, {upsert: true});
      }
    });

    collection[`${method}Permission`] = (userId, operation) =>
        Meteor.call(`${collectionName}.${method}Permission`, userId, operation);
  });
}

function createCollection(name, schema) {
  const collection = new Mongo.Collection(name);

  /**
   * @todo - validate against the schema in save()
   * use aldeed:simple-schema or joi?
   */
  collection.schema = schema;

  collection.findById = id => collection.findOne(id);
  collection.findAll = () => collection.find();
  collection.removeAll = () => collection.remove({});

  collection.save = (model, query) => {
    let existing = null;

    if (query) {
      existing = collection.findOne(query);
    } else if (model._id) {
      existing = findOne({ _id: model._id });
    }
  
    if (existing) {
      collection.update(existing, model);
    } else {
      collection.insert(model);
    }

    return collection.findOne(model);
  };

  if (Meteor.isServer) {
    setupPublications(collection, name);
  } else {
    Meteor.subscribe(name);
  }

  createPermissionMethods(collection, name);

  return collection;
}

export default createCollection;
