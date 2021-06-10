const { Router } = require("express");
const router = Router();

const { getTorneos, getCategorias, getPartidosCuadro, getPartidosGrupo, login, newUser, getProg, getTorneo, sendMessage, updateResult, getNotifications, fullTime } = require("../controllers/index.controller");

router.get("/torneos", getTorneos);
router.get("/notifications", getNotifications);
router.get("/torneo/:ci", getTorneo);
router.get("/programacion/:id", getProg);
router.get("/categorias/:id", getCategorias);
router.get("/partidoscuadro/:id", getPartidosCuadro);
router.get("/partidosgrupo/:id", getPartidosGrupo);
router.post("/login", login);
router.post("/newUser", newUser);
router.post("/sendMessage", sendMessage);
router.put("/actualizarResultado", updateResult);
router.put("/partidoTerminado", fullTime);

module.exports = router;
