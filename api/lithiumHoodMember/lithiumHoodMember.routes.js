const Router = require('express-promise-router');
const router = Router();
const lithiumHoodMemberController = require("./lithiumHoodMember.controller");
const secured = require("../../lib/middleware/secured");

/* GET METHODS */
router
    .route('/get_lithium_hood_members')
    .get(secured(), lithiumHoodMemberController.getLithiumHoodMembers);

/* POST METHODS */
router
    .route('/remove_user_from_hood')
    .post(secured(), lithiumHoodMemberController.removeUserFromTheLithiumHood);

module.exports = router;