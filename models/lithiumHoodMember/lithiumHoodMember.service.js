const LithiumHoodMember = require('./lithiumHoodMember.model');
const LithiumHoodRequest = require('../lithiumHoodRequest/lithiumHoodRequest.model');
const LithiumHoodService = require('../lithiumHood/lithiumHood.service');
const IDGenerator = require('../../lib/idGenerator');
const { LithiumError, LithiumErrorTypes } = require('../../config/LithiumErrors');

exports.checkIfUserIsInTheLithiumHood = async function (lithiumHoodId, userId) {
    const isInLithiumHood = await LithiumHoodMember.query()
        .select('id')
        .where('lithiumHood_id', lithiumHoodId)
        .andWhere('user_id', userId)
        .limit(1)
        .first();

    return !!isInLithiumHood;
};

exports.getUserLithiumHoodMembers = async function (lithiumHoodId) {
    const lithiumHoodMembers = await LithiumHoodMember.query()
        .where('lithiumHood_id', lithiumHoodId)
        .andWhere('role', '!=', 'owner')
        .withGraphFetched('[user(onlyUsername)]')
        .modifiers({
            onlyUsername(builder) {
                builder.select('username');
            },
        });

    return lithiumHoodMembers;
};

exports.addUserInTheLithiumHood = async function (userId, lithiumHoodId, role) {
    const newLithiumHoodMember = await LithiumHoodMember.query()
        .insert({
            id: IDGenerator.generateUUID(),
            lithiumHood_id: lithiumHoodId,
            user_id: userId,
            role: role,
            in_the_hood_since: new Date(),
        })
        .withGraphFetched('[user(onlyUsername)]')
        .modifiers({
            onlyUsername(builder) {
                builder.select('username');
            },
        });

    return newLithiumHoodMember;
};

exports.removeUserFromLithiumHood = async function (userWhoIsRemoving, userWhoIsRemoved) {
    const userWhoIsRemovingLithiumHood = await LithiumHoodService.getLithiumHood(userWhoIsRemoving.id);
    await LithiumHoodMember.query()
        .delete()
        .where('lithiumHood_id', userWhoIsRemovingLithiumHood.id)
        .andWhere('user_id', userWhoIsRemoved.id)
        .andWhere('role', '!=', 'owner');

    const userWhoIsRemovedLithiumHood = await LithiumHoodService.getLithiumHood(userWhoIsRemoved.id);
    await LithiumHoodMember.query()
        .delete()
        .where('lithiumHood_id', userWhoIsRemovedLithiumHood.id)
        .andWhere('user_id', userWhoIsRemoving.id)
        .andWhere('role', '!=', 'owner');
};
