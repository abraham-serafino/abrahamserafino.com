const messages = {
  'collection.permission.denied': 'You do not have permission to perform \':operation\' on collection \':collection\'',
  'remove.permission.denied': 'You do not have permission to remove this item.',
  'removeAll.permission.denied': 'You do not have permission to remove all items.',
  'save.permission.denied': 'You do not have permission to edit this item.'
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
