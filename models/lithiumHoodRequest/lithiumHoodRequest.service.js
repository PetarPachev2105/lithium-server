const LithiumHoodRequest = require('./lithiumHoodRequest.model');
const LithiumHoodMember = require('../lithiumHoodMember/lithiumHoodMember.model');
const WebSocketHelper = require('../../lib/websocketHelper');
const LithiumHoodService = require('../lithiumHood/lithiumHood.service');
const IDGenerator = require('../../lib/idGenerator');
const { LithiumError, LithiumErrorTypes } = require('../../config/LithiumErrors');
const { convertDateTime } = require('../../lib/convertDateTime');
const asyncJS = require("async");

exports.sendLithiumHoodRequest = async function (lithiumHoodId, userId) {
    console.log(`sendLithiumHoodRequest was CALLED with user - ${userId} and lithiumHoodId - ${lithiumHoodId}`);

    const lithiumHoodRequest = await LithiumHoodRequest.query()
        .insert({
            id: IDGenerator.generateUUID(),
            lithiumHood_id: lithiumHoodId,
            user_id: userId,
            sent_at: new Date(),
        });

    console.log(`Successfully sent request with id ${lithiumHoodRequest.id}`);
    return lithiumHoodRequest;
};

exports.checkForAlreadySentRequest = async function (lithiumHoodId, userId) {
    console.log(`checkForAlreadySentRequest was CALLED with user - ${userId} and lithiumHoodId - ${lithiumHoodId}`);

    const alreadySentRequestFromUser = await LithiumHoodRequest.query()
        .select('id')
        .where('lithiumHood_id', lithiumHoodId)
        .andWhere('user_id', userId)
        .limit(1)
        .first();

    return alreadySentRequestFromUser;
};

exports.getLithiumHoodRequestsForUser = async function (user) {
    console.log(`getLithiumHoodRequestsForUser was CALLED with ${user.username}`);

    const allHoodRequestsForUser = await LithiumHoodRequest.query()
        .where('user_id', user.id);

    const hoodRequestsReadable = [];

    await asyncJS.eachSeries(allHoodRequestsForUser, async hoodRequest => {
       const username = await LithiumHoodService.getUsernameByLithiumHoodId(hoodRequest.lithiumHood_id);
       const sent_at = convertDateTime(hoodRequest.sent_at);

       hoodRequestsReadable.push({
           id: hoodRequest.id,
           user: {
               username: username,
           },
           sent_at: sent_at,
       });

       return true;
    });
    return hoodRequestsReadable;
}

exports.acceptLithiumHoodRequest = async function (lithiumHoodRequest, user) {
    const userWhoAcceptedLithiumHood = await LithiumHoodService.getLithiumHood(user.id);
    const userWhoAcceptedId = user.id;

    const userWhoSentRequestLithiumHoodId = lithiumHoodRequest.lithiumHood_id;
    const userWhoSentRequest = await LithiumHoodService.getUserByLithiumHoodId(userWhoSentRequestLithiumHoodId);

    const date = new Date();

    const newMemberships = [];

    const userWhoAcceptedLithiumHoodMembership = {
        id: IDGenerator.generateUUID(),
        lithiumHood_id: userWhoSentRequestLithiumHoodId,
        user_id: userWhoAcceptedId,
        in_the_hood_since: date,
    };

    newMemberships.push(userWhoAcceptedLithiumHoodMembership);

    const userWhoSentRequestLithiumHoodMembership = {
        id: IDGenerator.generateUUID(),
        lithiumHood_id: userWhoAcceptedLithiumHood.id,
        user_id: userWhoSentRequest.id,
        in_the_hood_since: date,
    };

    newMemberships.push(userWhoSentRequestLithiumHoodMembership);

    // Insert new membership in db
    await LithiumHoodMember.query().insert(newMemberships);

    // Delete request
    await LithiumHoodRequest.query().deleteById(lithiumHoodRequest.id);

    return newMemberships;
}


exports.deleteHoodRequest = async function (lithiumHoodRequest) {
    await LithiumHoodRequest.query().deleteById(lithiumHoodRequest.id);
}
