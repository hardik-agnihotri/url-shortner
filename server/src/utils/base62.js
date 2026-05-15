const charSet =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const encode = (id) => {
  if (id === 0) {
    return charSet[0];
  }

  let shortCode = '';

  while (id > 0) {
    shortCode = charSet[id % 62] + shortCode;
    id = Math.floor(id / 62);
  }

  return shortCode;
};

module.exports = { encode };