const Router = require('express-promise-router');
const router = Router();
const sessionController = require("./session.controller");
const secured = require("../../lib/middleware/secured");

/* POST METHODS */
router
    .route('/check_token')
    .post(secured(), sessionController.checkToken);

module.exports = router;