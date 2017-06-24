const messages = {
  'collection.permission.denied': 'You do not have \':operation\' rights on \':collection\'',
  'remove.permission.denied': 'You do not have \'remove\' permissions for this item.',
  'removeAll.permission.denied': 'You do not have \'remove\' permissions for all items.',
  'save.permission.denied': 'You do not have \'save\' permissions for this item.'
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
