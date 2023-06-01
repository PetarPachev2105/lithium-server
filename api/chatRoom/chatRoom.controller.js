const ChatRoom = require('../../models/chatRoom/chatRoom.model');
const ChatRoomService = require('../../models/chatRoom/chatRoom.service');
const ChatMemberService = require('../../models/chatMember/chatMember.service');
const MessageService = require('../../models/message/message.service');
const LithiumHoodService = require('../../models/lithiumHood/lithiumHood.service');
const LithiumHoodMemberService = require('../../models/lithiumHoodMember/lithiumHoodMember.service');
const UserService = require('../../models/user/user.service');
const httpStatus = require('http-status');
const WebSocketHelper = require('../../lib/websocketHelper');
const {LithiumError, LithiumErrorTypes} = require('../../config/LithiumErrors');

/**
 * Controller for getting chatRooms
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getChatRooms = async (req, res) => {
    console.log(`getChatRooms was CALLED with ${JSON.stringify(req.body)}`);
    const user = req.user;

    const chatRooms = await ChatRoomService.getChatRooms(user);

    res.status(httpStatus.OK);
    res.json(chatRooms);
}

exports.createGroupLithiumRoom = async (req, res) => {
    console.log(`createGroupLithiumRoom was CALLED with ${JSON.stringify(req.body)}`);
    if (!req.body.name) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No name was specified');

    const chatRoom = await ChatRoomService.createGroupLithiumRoom(req.body.name);
    if (chatRoom) {
        await ChatMemberService.addChatMember(req.user.id, chatRoom.id)
        chatRoom.lastMessage = await MessageService.getLastMessageForChatRoom(chatRoom);
    }

    // await MessageService.send1000Messages(chatRoom, req.user);

    res.status(httpStatus.OK);
    res.json(chatRoom);
}

exports.enterChatRoom = async (req, res) => {
    console.log(`enterChatRoom was CALLED with ${JSON.stringify(req.body)}`);

    const chatRoomId = req.params.chatRoomId;

    if (!chatRoomId) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No Lithium room was specified');

    const chatRoom = await ChatRoom.query().findById(chatRoomId);

    if (!chatRoom) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No such a Lithium room');

    chatRoom.messages = await MessageService.getLastMessagesForChatRoom(chatRoomId, 100);

    chatRoom.username = req.user.username;

    res.status(httpStatus.OK);
    res.json(chatRoom);
}

exports.getMembers = async (req, res) => {
    console.log(`getMembers was CALLED with ${JSON.stringify(req.body)}`);

    const chatRoomId = req.params.chatRoomId;

    if (!chatRoomId) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No Lithium room was specified');

    const chatRoom = await ChatRoom.query().findById(chatRoomId);

    if (!chatRoom) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No such a Lithium room');

    const members = await ChatMemberService.getMembers(chatRoomId);

    res.status(httpStatus.OK);
    res.json(members);
}

exports.getOldMessages = async (req, res) => {
    console.log(`getOldMessages was CALLED with ${JSON.stringify(req.body)}`);

    const chatRoomId = req.params.chatRoomId;

    if (!chatRoomId) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No Lithium room was specified');

    const chatRoom = await ChatRoom.query().findById(chatRoomId);

    if (!chatRoom) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No such a Lithium room');

    const lastMessageNumber = req.params.lastMessageNumber;

    if (!lastMessageNumber) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No message number was specified');

    const message = await MessageService.getMessageByNumber(chatRoomId, lastMessageNumber);

    if (!message) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No such a message');

    const oldMessages = await MessageService.getOldMessagesForChatRoom(chatRoom, message);

    res.status(httpStatus.OK);
    res.json(oldMessages);
}

exports.sendMessage = async (req, res) => {
    console.log(`sendMessage was CALLED with ${JSON.stringify(req.body)}`);

    const chatRoomId = req.params.chatRoomId;

    if (!chatRoomId) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No Lithium room was specified');
    if (!req.body.content) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No content was specified');

    const chatRoom = await ChatRoom.query().findById(chatRoomId);

    if (!chatRoom) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No such a Lithium room');

    const isMember = await ChatMemberService.checkIfMember(req.user.id, chatRoomId);

    if (!isMember) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'You are no longer member of this room');

    const message = await MessageService.sendMessage(chatRoomId, req.user.id, req.body.content);

    message.user = req.user;

    const ws = await WebSocketHelper.getOpenWebsocket();
    await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumRoom', req.headers.clientid, 'message-received', chatRoomId, message);

    /* Send message to the lithium Hood websockets */
    const lithiumHoodsIds = await ChatMemberService.getMembersLithiumHoods(chatRoomId);
    lithiumHoodsIds.forEach(async (lithiumHoodsId) => {
        const payload = {
            lithiumRoom: chatRoom,
            message: message,
        }
        await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumHood', req.headers.clientid, 'received-message', lithiumHoodsId, payload);
    })
    ws.close();

    res.status(httpStatus.OK);
    res.json(message);
}

exports.addMember = async (req, res) => {
    console.log(`addMember was CALLED with ${JSON.stringify(req.body)}`);

    const chatRoomId = req.params.chatRoomId;

    if (!chatRoomId) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No Lithium room was specified');
    if (!req.body.username) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No username was specified');

    const user = await UserService.getUserIdByUsername(req.body.username);

    if (!user) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'No such a user');

    const chatRoom = await ChatRoom.query().findById(chatRoomId);

    if (!chatRoom) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'No such a Lithium room');

    if (!chatRoom.is_group) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'You can not add members to a personal room');

    const lithiumHood = await LithiumHoodService.getLithiumHood(req.user.id);
    const isPartOfLithiumHood = await LithiumHoodMemberService.checkIfUserIsInTheLithiumHood(lithiumHood.id, user.id);

    if (!isPartOfLithiumHood) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'User is not part of your lithium hood');

    const addMember = await ChatMemberService.addChatMember(user.id, chatRoomId);
    addMember.username = req.body.username;

    const customMessage = `${req.user.username} added ${req.body.username}`;
    const message = await MessageService.sendMessage(chatRoomId, req.user.id, customMessage);

    const ws = await WebSocketHelper.getOpenWebsocket();
    await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumRoom', req.headers.clientid, 'automated-message', chatRoomId, message);
    await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumRoom', req.headers.clientid, 'added-member', chatRoomId, addMember)

    ws.close();

    res.status(httpStatus.OK);
    res.json(addMember);
}

exports.removeMember = async (req, res) => {
    console.log(`removeMember was CALLED with ${JSON.stringify(req.body)}`);

    const chatRoomId = req.params.chatRoomId;

    if (!chatRoomId) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No Lithium room was specified');
    if (!req.body.username) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No username was specified');

    const user = await UserService.getUserIdByUsername(req.body.username);

    if (!user) {
        throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No such a user');
    }

    const chatRoom = await ChatRoom.query().findById(chatRoomId);

    if (!chatRoom) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No such a Lithium room');

    if (!chatRoom.is_group) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'This is a personal room you cannot remove members');

    const removedMember = await ChatMemberService.removeChatMember(user.id, chatRoomId);
    removedMember.username = req.body.username;

    const customMessage = `${req.user.username} removed ${req.body.username}`;
    const message = await MessageService.sendMessage(chatRoomId, req.user.id, customMessage);

    const ws = await WebSocketHelper.getOpenWebsocket();
    await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumRoom', req.headers.clientid, 'automated-message', chatRoomId, message);
    await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumRoom', req.headers.clientid, 'removed-member', chatRoomId, removedMember)

    ws.close();

    res.status(httpStatus.OK);
    res.json({username: req.body.username});
}

exports.changeName = async (req, res) => {
    console.log(`changeName was CALLED with ${JSON.stringify(req.body)}`);

    const chatRoomId = req.params.chatRoomId;

    if (!chatRoomId) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No Lithium room was specified');
    if (!req.body.name) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No name was specified');

    const chatRoom = await ChatRoom.query().findById(chatRoomId);

    if (!chatRoom) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No such a Lithium room');

    const updatedChatRoom = await ChatRoomService.changeName(chatRoom, req.body.name);

    const ws = await WebSocketHelper.getOpenWebsocket();
    await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumRoom', req.headers.clientid, 'name-changed', chatRoomId, updatedChatRoom);

    ws.close();

    res.status(httpStatus.OK);
    res.json(updatedChatRoom);
}