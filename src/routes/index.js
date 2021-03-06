const { Router } = require("express");
const router = Router();

const { getTorneos, getRondaTorneos, getCategorias, getPartidosCuadro, getPartidosGrupo, login, newUser, getProg, updateResult, fullTime, partidoGrupo, partidoCuadro, getPlayersFromCategory} = require("../controllers/index.controller");

router.get("/torneos", getTorneos);
router.get("/rondatorneos/:id", getRondaTorneos);
router.get("/players/:id", getPlayersFromCategory);
router.get("/programacion/:id", getProg);
router.get("/categorias/:id", getCategorias);
router.get("/partidoscuadro/:id", getPartidosCuadro);
router.get("/partidoscuadro/:id/:idpartido", partidoCuadro);
router.get("/partidosgrupo/:id", getPartidosGrupo);
router.get("/partidosgrupo/:id/:idpartido", partidoGrupo);
router.post("/login", login);
router.post("/newUser", newUser);
router.put("/actualizarResultado", updateResult);
router.put("/partidoTerminado", fullTime);

module.exports = router;
