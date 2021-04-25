const { Router } = require("express");
const router = Router();

const { getTorneos, getCategorias, getCuadros, getGrupos, getPartidosCuadro, getPartidosGrupo, updatePartidos, login, newUser, getProg, getTorneo, newMessage, getSets, newSet, updateSet, deleteSet } = require("../controllers/index.controller");

router.get("/torneos", getTorneos);
router.get("/torneo/:ci", getTorneo);
router.get("/programacion/:id", getProg);
router.get("/categorias/:id", getCategorias);
router.get("/cuadros/:id", getCuadros);
router.get("/grupos/:id", getGrupos);
router.get("/partidoscuadro/:id", getPartidosCuadro);
router.get("/sets/:id", getSets);
router.get("/partidosgrupo/:id", getPartidosGrupo);
router.put("/partidos/:id/:scoreJug1/:scoreJug2", updatePartidos);
router.post("/login", login);
router.post("/newUser", newUser);
router.post("/newMessage", newMessage);
router.post("/newSet", newSet);
router.put("/updateSet", updateSet);
router.delete("/deleteSet/:id", deleteSet);

module.exports = router;
