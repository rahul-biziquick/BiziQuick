const express = require("express");
const router = express.Router();

const leadRouter = require("./lead.routes");
const leadScoresRouter = require("./leadScores.routes");

router.use("/", leadRouter);
router.use("/lead-scores", leadScoresRouter);

module.exports = router;
