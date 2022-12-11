const Router = require('express-promise-router');
const router = Router();
const chatRoomController = require("./chatRoom.controller");
const secured = require("../../lib/middleware/secured");

/* GET METHODS */
router
    .route('/get_chat_rooms')
    .get(secured(), chatRoomController.getChatRooms);

router
    .route('/:chatRoomId/enter_chat_room')
    .get(secured(), chatRoomController.enterChatRoom);

router
    .route('/:chatRoomId/get_members')
    .get(secured(), chatRoomController.getMembers);

router
    .route('/:chatRoomId/:lastMessageNumber/load_old_messages')
    .get(secured(), chatRoomController.getOldMessages);

/* POST METHODS */
router
    .route('/create_group_lithium_room')
    .post(secured(), chatRoomController.createGroupLithiumRoom);

router
    .route('/:chatRoomId/send_message')
    .post(secured(), chatRoomController.sendMessage);

router
    .route('/:chatRoomId/add_member')
    .post(secured(), chatRoomController.addMember);

router
    .route('/:chatRoomId/remove_member')
    .post(secured(), chatRoomController.removeMember);

router
    .route('/:chatRoomId/change_name')
    .post(secured(), chatRoomController.changeName);

module.exports = router;