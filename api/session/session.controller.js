const SessionService = require('../../models/session/session.service');
const httpStatus = require('http-status');

exports.checkToken = async function (req, res) {
    const token = req.headers.token;
    const session = await SessionService.getSession(token);
    if (session) {
        res.status(httpStatus.OK);
        res.json(session);
    } else {
        res.status(httpStatus.BAD_REQUEST);
        res.json({ logout: true });
    }
}