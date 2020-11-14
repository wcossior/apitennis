const { Router } = require("express");
const router = Router();

const { getTorneos } = require("../controllers/index.controller");

router.get("/torneos", getTorneos);

module.exports = router;
