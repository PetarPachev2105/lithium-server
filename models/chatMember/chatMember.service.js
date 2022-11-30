const ChatMember = require('./chatMember.model');
const IDGenerator = require('../../lib/idGenerator');
const { LithiumError, LithiumErrorTypes } = require('../../config/LithiumErrors');

exports.addChatMember = async function (userId, chatRoomId) {
    const checkIfExists = await ChatMember.query()
        .select('id')
        .where('chatRoom_id', chatRoomId)
        .andWhere('user_id', userId)
        .first();

    if (checkIfExists) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'User is already in the room');
    }

    const chatMember = await ChatMember.query()
        .insert({
            id: IDGenerator.generateUUID(),
            chatRoom_id: chatRoomId,
            user_id: userId,
        });
    return chatMember;
}

exports.removeChatMember = async function (userId, chatRoomId) {
    const existingChatMembership = await ChatMember.query()
        .select('id')
        .where('chatRoom_id', chatRoomId)
        .andWhere('user_id', userId)
        .first();

    if (!existingChatMembership) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'User is not in the room');
    }

    const removedChatMembership = await ChatMember.query()
        .delete()
        .where('id', existingChatMembership.id);

    return removedChatMembership;
}

exports.getMembers = async function (chatRoomId) {
    const chatMembers = await ChatMember.query()
        .select('id')
        .where('chatRoom_id', chatRoomId)
        .withGraphFetched('[user(onlyUsername)]')
        .modifiers({
            onlyUsername(builder) {
                builder.select('username');
            },
        });

    return chatMembers;
}