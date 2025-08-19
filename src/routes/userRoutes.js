const express = require("express");
const jwtAuth = require("../middleware/jwtAuth");
const { validateUserInput } = require("../middleware/register/register-data-validator");
const { registerUser } = require("../main/users/user-register");
const { validateLoginInput } = require("../middleware/login/login-data-validator");
const { loginUser } = require("../main/users/user-login");
const { getUserDetails } = require("../main/users/user-details");

const router = express.Router();

router.post("/register", validateUserInput, async (req, res) => {
    registerUser(req.body)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});


router.post("/login", validateLoginInput, async (req, res) => {
    loginUser(req.body)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                token: data.token,
                user: data.user,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
})

router.get("/:id", jwtAuth, async (req, res) => {
    const requestData = {
        userId: req.params.id,
        requestingUser: req.user
    };

    getUserDetails(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                user: data.user,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});




module.exports = router;
