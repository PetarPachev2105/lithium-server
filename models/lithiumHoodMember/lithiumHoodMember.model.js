const { Model } = require('objection');
const LithiumHood = require('../lithiumHood/lithiumHood.model');
const User = require('../user/user.model');

module.exports = class LithiumHood extends Model {
    static tableName = 'lithiumHoodMember';

    static jsonSchema = {
        type: 'object',
        required: ['id', 'lithiumHood_id', 'user_id'],

        properties: {
            id: { type: 'string' },

            lithiumHood_id: { type: 'string' }, // The Lithium Hood Id

            user_id: { type: 'string' }, // The id of the user

            role: {
                type: 'string',
                enum: ['owner', 'core', 'electron'], // It can be only one owner / Cores are close people / Electrons are just friends
                default: 'electron'
            }, // The role of the user

            in_the_hood_since: { type: 'timestamp' },
        },
    };

    // This object defines the relations to other models.
    static get relationMappings() {
        return {
            lithiumHood: {
                relation: Model.HasOneRelation,
                modelClass: LithiumHood,
                join: {
                    from: 'lithiumHoodMember.lithiumHood_id',
                    to: 'lithiumHood.id',
                },
            },
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'lithiumHoodMember.user_id',
                    to: 'user.id',
                },
            },
        };
    }
}