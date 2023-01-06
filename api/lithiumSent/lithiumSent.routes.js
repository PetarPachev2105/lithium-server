const Router = require('express-promise-router');
const router = Router();
const lithiumSentController = require("./lithiumSent.controller");
const secured = require("../../lib/middleware/secured");


/* GET METHODS */
router
    .route('/get_lithiums')
    .get(secured(), lithiumSentController.getLithiumsForUser);

router
    .route('/get_count_of_unseen_lithiums')
    .get(secured(), lithiumSentController.getCountOfUnseenLithiumsForUser);

/* POST METHODS */
router
    .route('/send_lithium')
    .post(secured(), lithiumSentController.sendLithium);

router
    .route('/see_all_lithiums')
    .post(secured(), lithiumSentController.seeAllLithiums);


module.exports = router;
