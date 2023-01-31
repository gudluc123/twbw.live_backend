const express = require("express");
const router = express.Router();
const { getUserLogById, getUserLogList } = require("../controllers/userLogInController");

router.get("/:userId", getUserLogById);
router.get("/userLogList/:userId", getUserLogList);

module.exports = router;
