const { Router } = require("express");
const router = Router();

const { getTorneos, getCategorias } = require("../controllers/index.controller");

router.get("/torneos", getTorneos);
router.get("/categorias", getCategorias);

module.exports = router;
