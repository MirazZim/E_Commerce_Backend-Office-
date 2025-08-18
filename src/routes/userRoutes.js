const express = require("express");
const {
  registerUser,
  loginUser,
  getUserDetails,
} = require("../controllers/userController");
const jwtAuth = require("../middleware/jwtAuth");

const router = express.Router();

router.post("/users/register", registerUser);
router.post("/users/login", loginUser);
router.get("/users/:id", jwtAuth, getUserDetails);

module.exports = router;
