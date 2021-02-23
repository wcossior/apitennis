const { Router } = require("express");
const router = Router();

const { getTorneos, getCategorias, getCuadros, getGrupos, getPartidosCuadro, getPartidosGrupo, updatePartidos, login, newUser } = require("../controllers/index.controller");

router.get("/torneos", getTorneos);
router.get("/categorias/:id", getCategorias);
router.get("/cuadros/:id", getCuadros);
router.get("/grupos/:id", getGrupos);
router.get("/partidoscuadro/:id", getPartidosCuadro);
router.get("/partidosgrupo/:id", getPartidosGrupo);
router.put("/partidos/:id/:scoreJug1/:scoreJug2", updatePartidos);
router.post("/login", login);
router.post("/newUser", newUser);

module.exports = router;
