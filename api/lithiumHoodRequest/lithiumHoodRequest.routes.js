const Router = require('express-promise-router');
const router = Router();
const lithiumHoodRequestController = require("./lithiumHoodRequest.controller");
const secured = require("../../lib/middleware/secured");


/* GET METHODS */
router
    .route('/get_hood_requests')
    .get(secured(), lithiumHoodRequestController.getLithiumHoodRequestsForUser);

/* POST METHODS */
router
    .route('/send_hood_request')
    .post(secured(), lithiumHoodRequestController.sendLithiumHoodRequest);

router
    .route('/:lithiumHoodRequestId/accept_hood_request')
    .post(secured(), lithiumHoodRequestController.acceptLithiumHoodRequests);

router
    .route('/:lithiumHoodRequestId/decline_hood_request')
    .post(secured(), lithiumHoodRequestController.declineLithiumHoodRequests);


module.exports = router;
