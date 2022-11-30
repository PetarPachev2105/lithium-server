const MessageService = require('../../models/message/message.service');
const ChatRoom = require('../../models/chatRoom/chatRoom.model');
const httpStatus = require('http-status');
const { LithiumError, LithiumErrorTypes } = require('../../config/LithiumErrors');

exports.getMessagesForChatRoom = async (req, res) => {
    console.log(`getMessagesForChatRoom was CALLED with ${JSON.stringify(req.body)}`);

    if (!req.params.chatRoomId) throw new LithiumError(LithiumErrorTypes.DATA_NOT_FOUND, 'No Lithium Room was specified');

    const chatRoomId = req.params.chatRoomId;

    const chatRoom = await ChatRoom.query().findById(chatRoomId);

    if (!chatRoom) throw new LithiumError(LithiumErrorTypes.DATA_NOT_FOUND, 'No such Lithium Room');

    const messages = await MessageService.getMessagesForChatRoom(chatRoomId);

    res.status(httpStatus.OK);
    res.json(messages);
}