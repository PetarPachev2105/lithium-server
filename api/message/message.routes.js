const Router = require('express-promise-router');
const router = Router();
const messageController = require("./message.controller");
const secured = require("../../lib/middleware/secured");

/* GET METHODS */
router
    .route('/:chatRoomId/messages')
    .get(secured(), messageController.getMessagesForChatRoom);

module.exports = router;