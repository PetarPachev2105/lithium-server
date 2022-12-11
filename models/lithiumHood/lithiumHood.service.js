const LithiumHood = require('./lithiumHood.model');
const IDGenerator = require('../../lib/idGenerator');
const { LithiumError, LithiumErrorTypes } = require('../../config/LithiumErrors');
const LithiumHoodMember = require("../lithiumHoodMember/lithiumHoodMember.model");

exports.checkIfUserHasLithiumHood = async function (userId) {
    const existingLithiumHood = await LithiumHood.query()
        .select('id')
        .where('user_id', userId)
        .limit(1)
        .first();

    return !!existingLithiumHood;
}

exports.getLithiumHood = async function (userId) {
    const lithiumHood = await LithiumHood.query()
        .where('user_id', userId)
        .limit(1)
        .first();

    return lithiumHood;
}

exports.getUserByLithiumHoodId = async function (lithiumHood_id) {
    const lithiumHood = await LithiumHood.query()
        .select('user_id')
        .where('id', lithiumHood_id)
        .withGraphFetched('[user(userWithoutPass)]')
        .modifiers({
            userWithoutPass(builder) {
                builder.select('id','username','email');
            },
        })
        .limit(1)
        .first();

    return lithiumHood.user;
}

exports.getUsernameByLithiumHoodId = async function (lithiumHood_id) {
    const lithiumHood = await LithiumHood.query()
        .select('user_id')
        .where('id', lithiumHood_id)
        .withGraphFetched('[user(onlyUsername)]')
        .modifiers({
            onlyUsername(builder) {
                builder.select('username');
            },
        })
        .limit(1)
        .first();

    return lithiumHood.user.username;
}

exports.createLithiumHood = async function (userId) {
    const ifUserHasLithiumHood = await this.checkIfUserHasLithiumHood(userId);

    if (ifUserHasLithiumHood) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'User already have Lithium Space');
    }

    const newLithiumHood = await LithiumHood.query()
        .insert({
            id: IDGenerator.generateShortId(),
            user_id: userId,
            created_at: new Date(),
        });

    return newLithiumHood;
}

exports.getLithiumHoodsIdsOfUsers = async function (userIds) {

    const lithiumHoods = await LithiumHood.query()
        .select('id')
        .where('user_id', 'in', userIds);

    const lithiumHoodsIds = lithiumHoods.map(lithiumHood => lithiumHood.id);

    return lithiumHoodsIds;
}