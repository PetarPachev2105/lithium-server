const { Model } = require('objection');
const User = require('../user/user.model');
const ChatRoom = require('../chatRoom/chatRoom.model');

module.exports = class Message extends Model {
    static tableName = 'message';

    static jsonSchema = {
        type: 'object',
        required: ['id', 'chatRoom_id', 'user_id', 'content'],

        properties: {
            id: { type: 'string' },

            chatRoom_id: { type: 'string' }, // Where the message was sent

            user_id: { type: 'string' }, // The id of the author

            number: { type: 'integer' }, // 0-based

            content: { type: 'text' }, // The content of the message

            timestamp: { type: 'timestamp' }, // When the message was sent
        },
    };

    // This object defines the relations to other models.
    static get relationMappings() {
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'message.user_id',
                    to: 'user.id',
                },
            },
            chatRoom: {
                relation: Model.HasOneRelation,
                modelClass: ChatRoom,
                join: {
                    from: 'message.user_id',
                    to: 'chatRoom.id',
                },
            },
        };
    }
}