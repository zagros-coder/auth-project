const express = require("express");

const router =  express.Router() ;
const authContoller = require("../controllers/authController");
router.route("/register").post(authContoller.register);
router.route("/login").post(authContoller.login);
router.route("/refresh").get(authContoller.refresh);
router.route("/logout").post(authContoller.logout)
module.exports = router