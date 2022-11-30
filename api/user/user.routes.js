const Router = require('express-promise-router');
const router = Router();
const userController = require("./user.controller");
const secured = require("../../lib/middleware/secured");

/* GET METHODS */
router
    .route('/get_active_user')
    .get(secured(), userController.getActiveUser)

/* POST METHODS */    
router
    .route('/register')
    .post(userController.registerUser);

router
    .route('/login')
    .post(userController.loginUser);

module.exports = router;