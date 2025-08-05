const express = require("express");
const router = express.Router();

const registerRouter = require("./register.routes");
const loginRouter = require("./login.routes");
const otpRouter = require("./otp.routes");
const logoutRouter = require("./logout.routes");
const refreshTokenRouter = require("./refreshToken.routes");
const passwordRouter = require("./password.routes");

router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/", otpRouter);
router.use("/logout", logoutRouter);
router.use("/refresh-token", refreshTokenRouter);
router.use("/forgot-password", passwordRouter);
router.use("/reset-password", passwordRouter);

module.exports = router;
