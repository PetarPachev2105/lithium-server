const Router = require('express-promise-router');
const router = Router();

const userRoutes = require("./user/user.routes");
const sessionRoutes = require("./session/session.routes");
const chatRoomRoutes = require("./chatRoom/chatRoom.routes");
const lithiumHoodRoutes = require("./lithiumHood/lithiumHood.routes");
const lithiumHoodMemberRoutes = require("./lithiumHoodMember/lithiumHoodMember.routes");
const lithiumHoodRequestRoutes = require("./lithiumHoodRequest/lithiumHoodRequest.routes");
const lithiumSentRoutes = require("./lithiumSent/lithiumSent.routes");

router.use('/user', userRoutes);
router.use('/session', sessionRoutes);
router.use('/chatRoom', chatRoomRoutes);
router.use('/lithiumHood', lithiumHoodRoutes);
router.use('/lithiumHoodMember', lithiumHoodMemberRoutes);
router.use('/lithiumHoodRequest', lithiumHoodRequestRoutes);
router.use('/lithiumSent', lithiumSentRoutes);

module.exports = router;