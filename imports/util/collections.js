import { Promise } from 'meteor/promise';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const checkCollectionPermissions = {};

function checkPermission({ collection, userId, operation, collectionName }) {
  if (Meteor.isServer) {
    const permissions = collection.findOne({ _id: 'PERMISSIONS' });
    const message = `UserId (${userId}) may not ${operation} on '${collectionName}'`;

    if (!permissions || !permissions[userId] || !permissions[userId][operation]) {
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
      console.log('user has permission');
      return collection.find(); // { /* _permissions: { [CURRENT_USER_ID]: { find: true } } */ });
    } else {
      return this.ready();
    }
  });
}

function createMeteorMethods(collection, collectionName) {
  // add or remove a permissions for a user
  ['add', 'remove'].forEach(method => {
    Meteor.methods({
      [`${collectionName}.${method}Permission`](userId, operation) {
        checkCollectionPermissions['change collection permissions'](collection, global.CURRENT_USER_ID);
        collection.update({ _id: 'PERMISSIONS' }, {
          $set: {
            [`${userId}.${operation}`]: method === 'add'
          }
        }, { upsert: true });
      }
    });

    collection[`${method}Permission`] = (userId, operation) =>
      Meteor.call(`${collectionName}.${method}Permission`, userId, operation);
  });

  /* // findAll, removeAll (the 'All' is appended)
  ['find', 'remove'].forEach(method => {
    Meteor.methods({
      [`${collectionName}.${method}All`]() {
        if (!Meteor.isSimulation) {
          checkPermissions[method === 'find' ? 'read' : 'remove']
          (collection, global.CURRENT_USER_ID);

          return Promise.await(collection[`${method}All`]());
        }
      }
    });

    api[`${method}All`] = (query) => new Promise((resolve, reject) =>
      Meteor.call(`${collectionName}.${method}All`,
        (err, res) => {
          console.log('Hello world');
          if (err) reject(err);
          else resolve (res);
        }));
  });

  // methods that require read permissions and accept
  // a single param called 'query'
  ['find', 'findOne', 'findById'].forEach(method => {
    Meteor.methods({
      [`${collectionName}.${method}`](query) {
        checkPermissions.read(collection, global.CURRENT_USER_ID);
        return collection[method](query);
      }
    });

    api[method] = (query) => new Promise((resolve, rejest) =>
      Meteor.call(`${collectionName}.${method}`, query,
        (err, res) => {
          if (err) reject(err);
          else resolve (res);
        }));
  });

  // the "remove" method (takes a single param called 'query')
  Meteor.methods({
    [`${collectionName}.remove`](query) {
      checkPermissions.remove(collection, global.CURRENT_USER_ID);
      collection.remove(query);
    }
  });

  api.remove = (query) => new Promise((resolve, rejest) =>
    Meteor.call(`${collectionName}.remove`, query,
      (err, res) => {
        if (err) reject(err);
        else resolve (res);
      }));

  // the "save" method (takes a data model and optional query param)
  Meteor.methods({
    [`${collectionName}.save`](model, query) {
      checkPermissions.save(collection, global.CURRENT_USER_ID);
      collection.save(model, query);
    }
  });

  api.save = (model, query) => new Promise((resolve, rejest) =>
    Meteor.call(`${collectionName}.save`, model, query,
      (err, res) => {
        if (err) reject(err);
        else resolve (res);
      }));

  api.originalCollection = collection;

  return api; */
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

  createMeteorMethods(collection, name);

  return collection;
}

export default createCollection;
