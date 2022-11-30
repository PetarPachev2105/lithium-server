const { Model } = require('objection');

module.exports = class ChatRoom extends Model {
    static tableName = 'chatRoom';

    static jsonSchema = {
        type: 'object',
        required: ['id', 'name'],

        properties: {
            id: { type: 'string' },

            name: { type: 'string' }, // The name of the chat room

            created_at: { type: 'timestamp' }, // The date+time when the chat room was created
        },
    };
}