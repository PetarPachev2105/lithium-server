const ChatRoom = require('./chatRoom.model');
const ChatMembers = require('../chatMember/chatMember.model');
const MessageService = require('../message/message.service');
const IDGenerator = require('../../lib/idGenerator');
const asyncJS = require('async');
// const { LithiumError, LithiumErrorTypes } = require('../../config/LithiumErrors');

exports.getChatRooms = async function (user) {
    console.log(`getChatRooms was CALLED for user ${user.username}`)
    const chatMembersWhereUserIsMember = await ChatMembers.query()
        .select('chatRoom_id')
        .where('user_id', user.id);


    const chatRoomsIds = chatMembersWhereUserIsMember.map(chatMember => chatMember.chatRoom_id);

    const chatRooms = [];

    for (const chatRoomId of chatRoomsIds) {
        const chatRoom = await ChatRoom.query()
            .where('id', chatRoomId)
            .limit(1)
            .first();

        chatRoom.lastMessage = await MessageService.getLastMessageForChatRoom(chatRoom);

        chatRooms.push(chatRoom);
    }

    const sortedChatRooms = chatRooms.sort( (chatRoomA, chatRoomB) => Number(chatRoomB.lastMessage.sent_at) - Number(chatRoomA.lastMessage.sent_at),);
    console.log(sortedChatRooms);
    return sortedChatRooms;
}

exports.createChatRoom = async function (name) {
    const chatRoom = await ChatRoom.query()
        .insert({
            id: IDGenerator.generateShortId(),
            name: name,
            created_at: new Date(),
        });
    return chatRoom;
}

exports.changeName = async function (chatRoom, name) {
    const newChatRoom = await ChatRoom.query().patch({name: name}).where('id', chatRoom.id);
    chatRoom.name = name
    return chatRoom;
}