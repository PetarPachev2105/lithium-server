const LithiumSent = require('./lithiumSent.model');
const LithiumHoodService = require('../lithiumHood/lithiumHood.service');
const IDGenerator = require('../../lib/idGenerator');
const { convertDateTime } = require('../../lib/convertDateTime');
const asyncJS = require("async");

exports.sendLithium = async function (lithiumHoodId, userId) {
    console.log(`sendLithium was CALLED with from lithiumHoodId - ${lithiumHoodId} to user - ${userId}`);

    const lithiumSent = await LithiumSent.query()
        .insert({
            id: IDGenerator.generateUUID(),
            user_id: userId,
            lithiumHood_id: lithiumHoodId,
            sent_at: new Date(),
            seen: false,
        });

    console.log(`Successfully sent lithium to ${userId} from lithiumHood - ${lithiumHoodId}`);
    return lithiumSent;
};

exports.checkForAlreadySentLithium = async function (lithiumHoodId, userId) {
    console.log(`checkForAlreadySentLithium was CALLED with user - ${userId} and lithiumHoodId - ${lithiumHoodId}`);

    const alreadySentLithium = await LithiumSent.query()
        .select('id', 'sent_at', 'seen')
        .where('lithiumHood_id', lithiumHoodId)
        .andWhere('user_id', userId)
        .limit(1)
        .first();

    if (alreadySentLithium) {
        console.log(`There is such a lithium with id ${alreadySentLithium.id}`)

        /*  Check if lithium was seen or it was sent 30 min ago and*/
        if (alreadySentLithium.seen && alreadySentLithium.sent_at > new Date(new Date().getTime() - (10*1000)) ) {
            console.log(`This lithium shouldn't be deleted because it was sent in 30 min from now or it was seen`)
            return true;
        }

        console.log(`Delete sent lithium with id ${alreadySentLithium.id} because it was send 30 min ago or it wasn't seen`)
        /* If it wasn't seen and it was sent more than 30 min ago then delete it */
        await LithiumSent.query()
            .delete()
            .where('id', alreadySentLithium.id);
    }

    return false;
};

exports.getSentLithiumsForUser = async function (user) {
    console.log(`getSentLithiumsForUser was CALLED with ${user.username}`);

    /* Get all sent lithium which are not seen or sent in a range of 15 min from now */
    const allSentLithiums = await LithiumSent.query()
        .where('seen', false)
        .orWhere('sent_at', '>=', new Date(new Date().getTime() - (10*60*1000)))
        .andWhere('user_id', user.id)
        .orderBy('seen', 'DESC');

    const allSentLithiumsReadable = [];

    await asyncJS.eachSeries(allSentLithiums, async lithiumSent => {
        const username = await LithiumHoodService.getUsernameByLithiumHoodId(lithiumSent.lithiumHood_id);
        const sent_at = convertDateTime(lithiumSent.sent_at);

        allSentLithiumsReadable.push({
            id: lithiumSent.id,
            user: {
                username: username,
            },
            sent_at: sent_at,
            seen: lithiumSent.seen,
        });

        return true;
    });
    return allSentLithiumsReadable;
}

exports.getCountOfUnseenLithiumsForUser = async function (user) {
    console.log(`getCountOfUnseenLithiumsForUser was CALLED with ${user.username}`);

    /* Get all sent lithium which are not seen or sent in a range of 15 min from now */
    const unseenLithiumsCount = await LithiumSent.query()
        .count()
        .where('user_id', user.id)
        .andWhere('seen', false)
        .limit(1)
        .first();

    return unseenLithiumsCount.count;
}

exports.seenAllLithiums = async function (userId) {
    console.log(`seenAllLithiums was CALLED with ${userId}`);
    await LithiumSent.query().patch({'seen': true}).where('user_id', userId);
}


exports.cleanUpLithiums = async function () {
    await LithiumSent.query()
        .delete()
        .where('seen', true)
        .andWhere('sent_at', '<=', new Date(new Date().getTime() - (7*24*60*60*1000)));
}
