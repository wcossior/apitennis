const { Router } = require("express");
const router = Router();

const { getTorneos, getCategorias } = require("../controllers/index.controller");

router.get("/torneos", getTorneos);
router.get("/categorias/:id", getCategorias);

module.exports = router;
