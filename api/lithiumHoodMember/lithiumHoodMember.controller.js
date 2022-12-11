const UserService = require('../../models/user/user.service');
const httpStatus = require('http-status');
const WebSocketHelper = require('../../lib/websocketHelper');
const {LithiumError, LithiumErrorTypes} = require('../../config/LithiumErrors');
const LithiumHoodMemberService = require("../../models/lithiumHoodMember/lithiumHoodMember.service");
const LithiumHoodService = require("../../models/lithiumHood/lithiumHood.service");

/**
 * Controller for getting user's lithium hood
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getLithiumHoodMembers = async (req, res) => {
    console.log(`getLithiumHoodMembers was CALLED with ${JSON.stringify(req.body)}`);

    const lithiumHood = await LithiumHoodService.getLithiumHood(req.user.id);

    const userLithiumHood = await LithiumHoodMemberService.getUserLithiumHoodMembers(lithiumHood.id);

    res.status(httpStatus.OK);
    res.json(userLithiumHood);
}


/**
 * Controller for removing user from lithium hood
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.removeUserFromTheLithiumHood = async (req, res) => {
    console.log(`removeUserFromTheLithiumHood was CALLED with ${JSON.stringify(req.body)}`);

    if (!req.body.removedUserUsername) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No username specified');

    const removedUser = await UserService.getUserByUsername(req.body.removedUserUsername);

    if (!removedUser) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'No such a user');

    if (req.user.username === removedUser.username) throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'Cannot remove yourself');

    await LithiumHoodMemberService.removeUserFromLithiumHood(req.user, removedUser);

    const removedUserLithiumHood = await LithiumHoodService.getLithiumHood(removedUser.id);

    const ws = await WebSocketHelper.getOpenWebsocket();
    await WebSocketHelper.sendWebsocketMessage(ws, 'lithiumHood', req.headers.clientid, 'removed-user-from-the-hood', removedUserLithiumHood.id, req.user.username);
    ws.close();

    res.status(httpStatus.OK);
    res.json(removedUser.username);
}