const LithiumHood = require ('../../models/lithiumHood/lithiumHood.model');
const LithiumHoodService = require ('../../models/lithiumHood/lithiumHood.service');
const UserService = require('../../models/user/user.service');
const ChatRoomService = require('../../models/chatRoom/chatRoom.service');
const ChatMemberService = require('../../models/chatMember/chatMember.service');
const httpStatus = require('http-status');
const WebSocketHelper = require('../../lib/websocketHelper');
const {LithiumError, LithiumErrorTypes} = require('../../config/LithiumErrors');
const LithiumHoodRequest = require("../../models/lithiumHoodRequest/lithiumHoodRequest.model");
const LithiumHoodRequestService = require("../../models/lithiumHoodRequest/lithiumHoodRequest.service");
const LithiumHoodMemberService = require("../../models/lithiumHoodMember/lithiumHoodMember.service");
const { convertDateTime } = require('../../lib/convertDateTime');

/**
 * Controller for sending lithium hood request
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.sendLithiumHoodRequest = async (req, res) => {
    console.log(`sendLithiumHoodRequest was CALLED with ${JSON.stringify(req.body)}`);

    if (!req.body.username) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No username specified');
    if (req.body.username === req.user.username) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'Please input username different than yours');

    const user = await UserService.getUserIdByUsername(req.body.username);

    if (!user) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'No such a user');

    const lithiumHood = await LithiumHoodService.getLithiumHood(req.user.id);

    const isInTheHood = await LithiumHoodMemberService.checkIfUserIsInTheLithiumHood(lithiumHood.id, user.id);

    if (isInTheHood) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'User is already in the hood');
    }

    const doesUserAlreadyHaveSentRequest = await LithiumHoodRequestService.checkForAlreadySentRequest(lithiumHood.id, user.id);

    if (doesUserAlreadyHaveSentRequest) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, `You already had sent request to ${req.body.username}`);
    }

    const receiverLithiumHood = await LithiumHoodService.getLithiumHood(user.id);
    const doesUserAlreadyReceivedRequestFromThisUser = await LithiumHoodRequestService.checkForAlreadySentRequest(receiverLithiumHood.id, req.user.id);

    if (doesUserAlreadyReceivedRequestFromThisUser) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, `You already have request from ${req.body.username}`);
    }

    const lithiumHoodRequest = await LithiumHoodRequestService.sendLithiumHoodRequest(lithiumHood.id, user.id);
    lithiumHoodRequest.user = {
        username: req.user.username
    };
    lithiumHoodRequest.sent_at = convertDateTime(lithiumHoodRequest.sent_at);

    const ws = await WebSocketHelper.getOpenWebsocket();
    await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumHood', req.headers.clientid, 'received-request', receiverLithiumHood.id, lithiumHoodRequest);
    ws.close();

    res.status(httpStatus.OK);
    res.json(lithiumHoodRequest);
}

/**
 * Controller for getting lithium hood requests for user
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getLithiumHoodRequestsForUser = async (req, res) => {
    console.log(`getLithiumHoodRequestsForUser was CALLED with ${JSON.stringify(req.body)}`);

    const lithiumHoodRequests = await LithiumHoodRequestService.getLithiumHoodRequestsForUser(req.user);

    res.status(httpStatus.OK);
    res.json(lithiumHoodRequests);
}

/**
 * Controller for accepting lithium hood requests
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.acceptLithiumHoodRequests = async (req, res) => {
    console.log(`acceptLithiumHoodRequests was CALLED with ${JSON.stringify(req.body)}`);

    if (!req.params.lithiumHoodRequestId) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No id of lithium hood request');

    const lithiumHoodRequest = await LithiumHoodRequest.query().findById(req.params.lithiumHoodRequestId);

    if (!lithiumHoodRequest) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No such a request');

    const senderLithiumHoodId = lithiumHoodRequest.lithiumHood_id;
    const sender = await LithiumHoodService.getUserByLithiumHoodId(senderLithiumHoodId);


    const receiver = req.user;
    const receiverLithiumHood = await LithiumHoodService.getLithiumHood(req.user.id);

    const isSenderInTheHood = await LithiumHoodMemberService.checkIfUserIsInTheLithiumHood(receiverLithiumHood.id, sender.id);
    if (isSenderInTheHood) {
        await LithiumHoodRequestService.deleteHoodRequest(lithiumHoodRequest);
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'User is already in your hood');
    }

    const isReceiverInTheHood = await LithiumHoodMemberService.checkIfUserIsInTheLithiumHood(senderLithiumHoodId, req.user.id);
    if (isReceiverInTheHood) {
        await LithiumHoodRequestService.deleteHoodRequest(lithiumHoodRequest);
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'You are already in their hood');
    }

    const senderLithiumHood = await LithiumHoodMemberService.addUserInTheLithiumHood(receiver.id, senderLithiumHoodId, 'electron');

    const receiverNewLithiumHoodMember = await LithiumHoodMemberService.addUserInTheLithiumHood(sender.id, receiverLithiumHood.id, 'electron');

    await LithiumHoodRequestService.deleteHoodRequest(lithiumHoodRequest);

    const doTheyHavePersonalRoomAlready = await ChatMemberService.checkIfUsersHavePersonalRoomAlready(receiver, sender);

    const ws = await WebSocketHelper.getOpenWebsocket();

    if (!doTheyHavePersonalRoomAlready) {
        const newChatRoom = await ChatRoomService.createPersonalLithiumRoom(`${sender.username} && ${receiver.username}`);
        await ChatMemberService.addChatMember(sender.id, newChatRoom.id);
        await ChatMemberService.addChatMember(receiver.id, newChatRoom.id);

        const chatRoomExport = await ChatRoomService.exportChatRoom(newChatRoom);

        // Send to the receiver that he has new lithium room
        await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumHood', req.headers.clientid, 'automated-new-lithium-room', receiverLithiumHood.id, chatRoomExport);
        // Send to the sender that he has new lithium room
        await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumHood', req.headers.clientid, 'automated-new-lithium-room', senderLithiumHoodId, chatRoomExport);
    }


    await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumHood', req.headers.clientid, 'accepted-request', senderLithiumHoodId, senderLithiumHood);
    ws.close();

    res.status(httpStatus.OK);
    res.json(receiverNewLithiumHoodMember);
}

/**
 * Controller for declining lithium hood requests
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.declineLithiumHoodRequests = async (req, res) => {
    console.log(`declineLithiumHoodRequests was CALLED with ${JSON.stringify(req.body)}`);

    if (!req.params.lithiumHoodRequestId) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No id of lithium hood request');

    const lithiumHoodRequest = await LithiumHoodRequest.query().findById(req.params.lithiumHoodRequestId);

    if (!lithiumHoodRequest) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No such a request');

    await LithiumHoodRequestService.deleteHoodRequest(lithiumHoodRequest);

    const declinedUser = await LithiumHoodService.getUserByLithiumHoodId(lithiumHoodRequest.lithiumHood_id)

    res.status(httpStatus.OK);
    res.json({username: declinedUser.username});
}