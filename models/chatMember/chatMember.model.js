const { Model } = require('objection');
const User = require('../user/user.model');
const ChatRoom = require('../chatRoom/chatRoom.model');

module.exports = class ChatMember extends Model {
    static tableName = 'chatMember';

    static jsonSchema = {
        type: 'object',
        required: ['id', 'chatRoom_id', 'user_id'],

        properties: {
            id: { type: 'string' },

            chatRoom_id: { type: 'string' }, // The Chat Room Id

            user_id: { type: 'string' }, // The id of the user
        },
    };

    // This object defines the relations to other models.
    static get relationMappings() {
        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'chatMember.user_id',
                    to: 'user.id',
                },
            },
            chatRoom: {
                relation: Model.HasOneRelation,
                modelClass: ChatRoom,
                join: {
                    from: 'chatMember.user_id',
                    to: 'chatRoom.id',
                },
            },
        };
    }
}