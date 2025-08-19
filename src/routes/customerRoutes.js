const express = require("express");
const jwtAuth = require("../middleware/jwtAuth");
const { registerCustomer } = require("../main/customers/add-customer");

const customerRouter = express.Router();

customerRouter.post("/create", async (req, res) => {
    registerCustomer(req.body)
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


module.exports = customerRouter;
