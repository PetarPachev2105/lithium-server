const LithiumHoodService = require ('../../models/lithiumHood/lithiumHood.service');
const UserService = require('../../models/user/user.service');
const httpStatus = require('http-status');
const WebSocketHelper = require('../../lib/websocketHelper');
const {LithiumError, LithiumErrorTypes} = require('../../config/LithiumErrors');
const LithiumSentService = require("../../models/lithiumSent/lithiumSent.service");
const LithiumHoodMemberService = require("../../models/lithiumHoodMember/lithiumHoodMember.service");
const { convertDateTime } = require('../../lib/convertDateTime');

/**
 * Controller for sending lithium
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.sendLithium = async (req, res) => {
    console.log(`sendLithium was CALLED with ${JSON.stringify(req.body)}`);

    if (!req.body.username) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No username specified');
    if (req.body.username === req.user.username) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'Please input username different than yours');

    const user = await UserService.getUserIdByUsername(req.body.username);

    if (!user) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'No such a user');

    const lithiumHood = await LithiumHoodService.getLithiumHood(req.user.id);

    const isInTheHood = await LithiumHoodMemberService.checkIfUserIsInTheLithiumHood(lithiumHood.id, user.id);

    if (!isInTheHood) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, `${req.body.username} is not in your hood`);
    }

    const doesUserAlreadyHaveSentLithium = await LithiumSentService.checkForAlreadySentLithium(lithiumHood.id, user.id);

    if (doesUserAlreadyHaveSentLithium) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, `You already have sent lit to ${req.body.username}`);
    }

    const receiverLithiumHood = await LithiumHoodService.getLithiumHood(user.id);
    const doesUserAlreadyReceivedLithiumFromThisUser = await LithiumSentService.checkForAlreadySentLithium(receiverLithiumHood.id, req.user.id);

    if (doesUserAlreadyReceivedLithiumFromThisUser) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, `You already received lit from ${req.body.username}`);
    }

    const lithiumSent = await LithiumSentService.sendLithium(lithiumHood.id, user.id);
    lithiumSent.user = {
        username: req.user.username
    };
    lithiumSent.sent_at = convertDateTime(lithiumSent.sent_at);

    const ws = await WebSocketHelper.getOpenWebsocket();
    await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumHood', req.headers.clientid, 'received-lithium', receiverLithiumHood.id, lithiumSent);
    ws.close();

    res.status(httpStatus.OK);
    res.json(lithiumSent);
}

/**
 * Controller for getting received lithiums for user
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getLithiumsForUser = async (req, res) => {
    console.log(`getLithiumsForUser was CALLED with ${JSON.stringify(req.body)}`);

    const lithiumsSent = await LithiumSentService.getSentLithiumsForUser(req.user);

    res.status(httpStatus.OK);
    res.json(lithiumsSent);
}

/**
 * Controller for getting count of received lithiums for user
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getCountOfUnseenLithiumsForUser = async (req, res) => {
    console.log(`getCountOfUnseenLithiumsForUser was CALLED with ${JSON.stringify(req.body)}`);

    const count = await LithiumSentService.getCountOfUnseenLithiumsForUser(req.user);

    res.status(httpStatus.OK);
    res.json({ count: count });
}

/**
 * See all lithiums
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.seeAllLithiums = async (req, res) => {
    console.log(`seeAllLithiums was CALLED with ${JSON.stringify(req.body)}`);

    await LithiumSentService.seenAllLithiums(req.user.id);
    res.status(httpStatus.OK);
    res.json({});
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