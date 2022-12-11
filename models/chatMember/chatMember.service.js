const ChatMember = require('./chatMember.model');
const IDGenerator = require('../../lib/idGenerator');
const { LithiumError, LithiumErrorTypes } = require('../../config/LithiumErrors');
const LithiumHoodService = require("../lithiumHood/lithiumHood.service");
const LithiumHoodMember = require("../lithiumHoodMember/lithiumHoodMember.model");

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

exports.checkIfUsersHavePersonalRoomAlready = async function (user1, user2) {
    const chatMembersInPersonalRoom = await ChatMember.query()
        .select('id')
        .where('user_id', user1.id)
        .orWhere('user_id', user2.id)
        .withGraphFetched('[chatRoom(onlyPersonalLithiumRooms)]')
        .modifiers({
            onlyPersonalLithiumRooms(builder) {
                builder.select('id').where('is_group', false);
            },
        });

    if (chatMembersInPersonalRoom.length > 0) {
        for (const chatMembership of chatMembersInPersonalRoom) {
            if (chatMembership.chatRoom) {
                const otherMembershipInChatRoom = chatMembersInPersonalRoom.filter(obj => obj.chatRoom.id === chatMembership.chatRoom.id && obj.id !== chatMembership.id);
                if (otherMembershipInChatRoom) {
                    return true;
                }
            }
        }
    }

    return false;
};

exports.getMembersLithiumHoods = async function (lithiumRoomId) {
    const chatMembers = await ChatMember.query()
        .select('user_id')
        .where('chatRoom_id', lithiumRoomId);

    const userIds = chatMembers.map(chatMember => chatMember.user_id);

    const lithiumHoods = await LithiumHoodService.getLithiumHoodsIdsOfUsers(userIds);

    return lithiumHoods;
};
