const Router = require('express-promise-router');
const router = Router();

const userRoutes = require("./user/user.routes");
const sessionRoutes = require("./session/session.routes");
const chatRoomRoutes = require("./chatRoom/chatRoom.routes");

router.use('/user', userRoutes);
router.use('/session', sessionRoutes);
router.use('/chatRoom', chatRoomRoutes);

module.exports = router;