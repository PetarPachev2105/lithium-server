const { Model } = require('objection');
const User = require('../user/user.model');
const LithiumHood = require('../lithiumHood/lithiumHood.model');

module.exports = class LithiumHoodRequest extends Model {
    static tableName = 'lithiumHoodRequest';

    static jsonSchema = {
        type: 'object',
        required: ['id', 'lithiumHood_id', 'user_id', 'sent_at'],

        properties: {
            id: { type: 'string' },

            lithiumHood_id: { type: 'string' }, // The id of the lithium hood

            user_id: { type: 'string' }, // The id of the user

            sent_at: { type: 'timestamp' }, // When this request was sent
        },
    };

    // This object defines the relations to other models.
    static get relationMappings() {
        return {
            lithiumHood: {
                relation: Model.HasOneRelation,
                modelClass: LithiumHood,
                join: {
                    from: 'lithiumHoodRequest.lithiumHood_id',
                    to: 'lithiumHoodMembers.id',
                },
            },
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'lithiumHoodRequest.user_id',
                    to: 'user.id',
                },
            },
        };
    }
}