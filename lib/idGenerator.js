require('dotenv').config({ path: '../.env' });

const { customAlphabet } =  require('nanoid');
const uuid = require('uuid');

/* Set up nanoid with a custom alphabet that only have letters and numbers */
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);

function generateShortId() {
    return nanoid();
}

/* Set up the custom namespace for our UUID.v5 generation */
const uuidV5Namespace = process.env.UUID_NAMESPACE_ID;

function generateUUID() {
  return uuid.v1();
}

/**
 * Returns a UUID v5 value - takes an input and generates a hash that is always the same given the same input
 * @param stringToHash
 * @returns {*|string}
 */
function generateUUIDHash(stringToHash) {
    return uuid.v5(stringToHash, uuidV5Namespace);
}

module.exports = {
    generateUUID,
    generateUUIDHash,
    generateShortId,
};