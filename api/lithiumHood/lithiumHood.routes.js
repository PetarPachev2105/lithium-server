const Router = require('express-promise-router');
const router = Router();
const lithiumHoodController = require("./lithiumHood.controller");
const secured = require("../../lib/middleware/secured");

/* GET METHODS */
router
    .route('/get_lithium_hood')
    .get(secured(), lithiumHoodController.getLithiumHood);

module.exports = router;
