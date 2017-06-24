const messages = {
  'collection.permission.denied': 'You do not have permission to perform \':operation\' on collection :collection',
  'remove.permission.denied.query': 'You do not have permission to remove the specified item(s).',
  'removeAll.permission.denied': 'You do not have permission to remove all items.'
};

function i18n(key, model) {
  let message = messages[key];

  if (!message) {
    throw new Error(`No such message: (${message})`);
  }

  if (model) {
    Object.keys(model).forEach(k =>
      message = message.replace(`:${k}`, model[k]));
  }

  return message;
}

export default i18n;
