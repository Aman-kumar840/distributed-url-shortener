const characters =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const encode = (num) => {
  let shortCode = "";

  while (num > 0) {
    shortCode = characters[num % 62] + shortCode;
    num = Math.floor(num / 62);
  }

  return shortCode;
};

module.exports = { encode };
