const { Model } = require('objection');
const User = require('../user/user.model');

module.exports = class LithiumHood extends Model {
    static tableName = 'lithiumHood';

    static jsonSchema = {
        type: 'object',
        required: ['id', 'user_id', 'created_at'],

        properties: {
            id: { type: 'string' },

            user_id: { type: 'string' }, // The id of the user

            created_at: { type: 'timestamp' }, // The date+time when the space was created
        },
    };

    // This object defines the relations to other models.
    static get relationMappings() {
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'lithiumHood.user_id',
                    to: 'user.id',
                },
            },
        };
    }
}