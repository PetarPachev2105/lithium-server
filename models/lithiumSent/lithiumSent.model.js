const { Model } = require('objection');
const User = require('../user/user.model');
const LithiumHood = require('../lithiumHood/lithiumHood.model');

/* It is something like pouch in facebook */
/* You send lithium to somebody who you want to be notified */

module.exports = class LithiumSent extends Model {
    static tableName = 'lithiumSent';

    static jsonSchema = {
        type: 'object',
        required: ['id', 'lithiumHood_id', 'user_id', 'sent_at'],

        properties: {
            id: { type: 'string' },

            user_id: { type: 'string' }, // The id of the user who sent it

            lithiumHood_id: { type: 'string' }, // The id of the lithium hood which is the receiver

            sent_at: { type: 'timestamp' }, // When this request was sent

            seen: { type: 'boolean'} // If it was seen
        },
    };

    // This object defines the relations to other models.
    static get relationMappings() {
        return {
            lithiumHood: {
                relation: Model.HasOneRelation,
                modelClass: LithiumHood,
                join: {
                    from: 'lithiumSent.lithiumHood_id',
                    to: 'lithiumHoodMembers.id',
                },
            },
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'lithiumSent.user_id',
                    to: 'user.id',
                },
            },
        };
    }
}