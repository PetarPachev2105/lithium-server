const { Model } = require('objection');

module.exports = class User extends Model {
  static tableName = 'user';

  static jsonSchema = {
    type: 'object',
    required: ['id', 'username', 'email', 'password'],

    properties: {
      id: { type: 'string' }, // The user id

      username: { type: 'string' }, // User unique username

      email: { type: 'string' }, // The email of the user

      global_role: {
        type: ['string', 'null'],
        enum: ['support'],
      },
    },
  };
}