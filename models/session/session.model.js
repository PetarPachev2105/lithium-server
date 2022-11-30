const { Model } = require('objection');
const User = require('../user/user.model');

module.exports = class Session extends Model {
  static tableName = 'session';

  static jsonSchema = {
    type: 'object',
    required: ['id', 'access_token', 'user_id'],

    properties: {
      id: { type: 'string' }, // The id of the session. We have this only because Knex wants it and errors out if we don't have an id column

      access_token: { type: 'string' }, // The JWT access token

      user_id: { type: 'string' }, // The id of the user

      created_at: { type: 'timestamp' }, // The date+time when the session was created
    },
  };

  // This object defines the relations to other models.
  static get relationMappings() {
    return {
      user: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'session.user_id',
          to: 'user.id',
        },
      },
    };
  }
}