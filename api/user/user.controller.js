const UserService = require('../../models/user/user.service');
const User = require('../../models/user/user.model');
const httpStatus = require('http-status');
const { LithiumError, LithiumErrorTypes } = require('../../config/LithiumErrors');
const { generateAccessToken } = require("../../config/jwt");
const SessionService = require("../../models/session/session.service");

exports.registerUser = async (req, res) => {
    console.log(`registerUser was CALLED with ${JSON.stringify(req.body)}`);
    if (!req.body.email) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No email was specified');
    if (!req.body.password) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No password was specified');
    if (!req.body.username) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No username was specified');
    
    const usersWithTheSameCredentials = await User.query()
        .where('username', req.body.username)
        .orWhere('email', req.body.email)

    if (usersWithTheSameCredentials.length > 0) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'User with the same credentials already exists :(');
    }

    const user = await UserService.createUser(req.body.email, req.body.username, req.body.password);

    const accessToken = generateAccessToken(user);

    await SessionService.createSession(accessToken, user);
    user.accessToken = accessToken;

    res.status(httpStatus.OK);
    res.json(user);
}

exports.loginUser = async (req, res) => {
    console.log(`loginUser was CALLED with ${JSON.stringify(req.body)}`);
    if (!req.body.email) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No email was specified');
    if (!req.body.password) throw new LithiumError(LithiumErrorTypes.MISSING_INPUTS, 'No password was specified');
    
    const usersWithTheSameCredentials = await User.query()
        .where('email', req.body.email)

    if (usersWithTheSameCredentials.length !== 1) {
        throw new LithiumError(LithiumErrorTypes.BAD_INPUTS, 'User with the given credentials do not exists :(');
    }


    const user = await UserService.loginUser(usersWithTheSameCredentials[0], req.body.password);

    const accessToken = generateAccessToken(user);
    await SessionService.createSession(accessToken, user);

    user.accessToken = accessToken;

    res.status(httpStatus.OK);
    res.json(user);
}

exports.getActiveUser = async (req, res) => {
    console.log(`getActiveUser was CALLED with ${JSON.stringify(req.body)}`);
    res.status(httpStatus.OK);
    res.json(req.user);
}