const LithiumHoodService = require ('../../models/lithiumHood/lithiumHood.service');
const httpStatus = require('http-status');

/**
 * Controller for getting lithium Space
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
exports.getLithiumHood = async (req, res) => {
    console.log(`getLithiumHood was CALLED with ${JSON.stringify(req.body)}`);
    const user = req.user;

    const lithiumHood = await LithiumHoodService.getLithiumHood(user.id);
    lithiumHood.user = user;

    res.status(httpStatus.OK);
    res.json(lithiumHood);
}