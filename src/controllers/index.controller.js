const { Client } = require("pg");
const bcrypt = require('bcryptjs');
const token = require("../services/token");

var FCM = require('fcm-node');
var serverKey = 'AAAAZqt7s_E:APA91bHjDRT84dJeYeN9OzIgH7VHCEkn9E1vBxko5eStVwJMmKeUyXZqe2DC20UdCpVFVNHriIZho3HIac0q0446ihcDFq_pIE2ZjC0RfIw7Q2DOTxx-yIbdeb-WR0wRSvo8XpR_W8oB'; //put your server key here
var fcm = new FCM(serverKey);


const database = new Client({
  connectionString: "postgres://otzjcoeswezxpk:4fa2f79da23442fb255dcfebd8910b2b57f31484414f102ebd0e167df5e650fe@ec2-54-166-167-192.compute-1.amazonaws.com:5432/dfqineasdsbne5",
  ssl: { rejectUnauthorized: false }
});

database.connect();

const getTorneos = async (req, res) => {
  try {
    const response = await database.query("select * from torneos");
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}
const getRondaTorneos = async (req, res) => {
  try {
    const text = "select * from ronda_torneos where torneo_id=$1 order by numero";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const getCategorias = async (req, res) => {
  try {
    const text = "select * from categoria where torneo_id=$1 and categoria_type='Singles'";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}
const getPlayersFromCategory = async (req, res) => {
  try {
    const text = "select nombre, club from jugadors where categorium_id=$1";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const getPartidosCuadro = async (req, res) => {
  try {
    const values = [req.params.id];
    const text = "select partidos.id, partido_type, hora_inicio, hora_inico_mv, hora_fin, numero_cancha, ronda_torneo_id, marcador, partido_terminado, cuadros.etapa, jugadores1.nombre as jug1, jugadores2.nombre as jug2,  jugadores1.club as club1, jugadores2.club as club2 from partidos, cuadros, jugadors jugadores1, jugadors jugadores2 where partidos.cuadro_id=cuadros.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and cuadros.categorium_id=$1 order by partidos.id";
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const updateResult = async (req, res) => {
  try {
    const text = `update partidos set marcador=$1 where id=$2`;
    const partidoId = req.body.idPartido;
    const score = req.body.score;
    await database.query(text, [JSON.stringify(score), partidoId]);
    res.status(200).json({ msg: "Marcador guardado" });
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error " });
  }
}
const fullTime = async (req, res) => {
  try {
    var fecha = new Date();
    fecha.setHours(fecha.getHours() - 4);
    const text = "update partidos set marcador=$1, hora_fin=$2, partido_terminado=true where id=$3";
    const partidoId = req.body.idPartido;
    const score = req.body.score;
    await database.query(text, [JSON.stringify(score), fecha, partidoId]);
    res.status(200).json({ msg: "Partido finalizado con exito" });
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error " });
  }
}
const getPartidosGrupo = async (req, res) => {
  try {
    const values = [req.params.id];
    const text = "select partidos.id, partido_type, hora_inicio, hora_inico_mv, hora_fin, numero_cancha, ronda_torneo_id, marcador, partido_terminado, grupos.nombre, jugadores1.nombre as jug1, jugadores2.nombre as jug2,  jugadores1.club as club1, jugadores2.club as club2 from partidos, grupos, jugadors jugadores1, jugadors jugadores2 where partidos.grupo_id=grupos.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and grupos.categorium_id=$1 order by grupos.nombre";
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const newUser = async (req, res) => {
  try {
    const ci = req.body.ci;
    const nombre = req.body.nombre;
    const email = req.body.email;
    const dispositivo = req.body.dispositivo;
    const fecha = new Date();
    fecha.setHours(fecha.getHours() - 4);
    var password = req.body.password;
    var text = "select * from usuarios where email=$1";
    var response = await database.query(text, [email]);

    if (response.rows.length != 0) {
      res.status(400).json({ msg: "Este email ya esta en uso" });
    } else {
      var text = "insert into usuarios (email, encrypted_password, created_at, updated_at, ci, nombre, rol, dispositivos) values ($1, $2, $3, $4, $5, $6, 'Jugador', $7)";
      password = await bcrypt.hash(password, 10);
      var response = await database.query(text, [email, password, fecha, fecha, ci, nombre, [dispositivo]]);
      res.status(200).json({ msg: "Cuenta creada exitosamente!" });
    }
  } catch (e) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const login = async (req, res) => {
  try {
    const email = req.body.email;
    const passId = req.body.password;
    const dispositivo = req.body.dispositivo;

    var text = "select * from usuarios where email=$1";
    var response = await database.query(text, [email]);
    var user = response.rows[0];

    if (user) {
      let match = await bcrypt.compare(passId, user.encrypted_password);
      if (match) {
        let tokenReturn = await token.encode(user.ci);
        text = "select dispositivos from usuarios where email=$1";
        response = await database.query(text, [email]);

        var dispositivos = response.rows[0].dispositivos;
        var seRegistro = dispositivos.includes(dispositivo);
        if (!seRegistro) {
          text = "update usuarios set dispositivos = array_cat(dispositivos, $1) where email=$2";
          response = await database.query(text,[[dispositivo], email]);
        }
        res.status(200).json({ user, tokenReturn });
      } else {
        res.status(404).send({
          msg: "Correo o Contraseña incorrectos"
        });
      }
    }
    else {
      res.status(404).send({ msg: "Correo o Contraseña incorrectos" });
    }
  }
  catch (e) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }

}

const getProg = async (req, res) => {
  try {
    const text = "select partidos.id, partido_type, partidos.hora_inicio, hora_fin, hora_inico_mv, numero_cancha, ronda_torneo_id, partido_terminado, jugadores1.nombre as jug1, jugadores2.nombre as jug2, categoria.nombre, partidos.marcador from partidos, ronda_torneos, categoria, jugadors jugadores1, jugadors jugadores2 where ronda_torneos.id=partidos.ronda_torneo_id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and ronda_torneos.torneo_id=$1 and jugadores1.categorium_id=categoria.id order by partidos.numero";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const partidoGrupo = async (req, res) => {
  try {
    const idCategoria = req.params.id;
    const idPartido = req.params.idpartido;
    const text = "select partidos.id, partido_type, hora_inicio, hora_inico_mv, hora_fin, numero_cancha, ronda_torneo_id, marcador, partido_terminado, grupos.nombre, jugadores1.nombre as jug1, jugadores2.nombre as jug2,  jugadores1.club as club1, jugadores2.club as club2 from partidos, grupos, jugadors jugadores1, jugadors jugadores2 where partidos.grupo_id=grupos.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and grupos.categorium_id=$1 and partidos.id=$2";
    const response = await database.query(text, [idCategoria, idPartido]);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}
const partidoCuadro = async (req, res) => {
  try {
    const idCategoria = req.params.id;
    const idPartido = req.params.idpartido;
    const text = "select partidos.id, partido_type, hora_inicio, hora_inico_mv, hora_fin, numero_cancha, ronda_torneo_id, marcador, partido_terminado, cuadros.etapa, jugadores1.nombre as jug1, jugadores2.nombre as jug2,  jugadores1.club as club1, jugadores2.club as club2 from partidos, cuadros, jugadors jugadores1, jugadors jugadores2 where partidos.cuadro_id=cuadros.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and cuadros.categorium_id=$1 and partidos.id=$2";
    const response = await database.query(text, [idCategoria, idPartido]);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

module.exports = {
  getTorneos,
  getCategorias,
  getPartidosGrupo,
  getPartidosCuadro,
  newUser,
  login,
  getProg,
  updateResult,
  fullTime,
  getRondaTorneos,
  partidoGrupo,
  partidoCuadro,
  getPlayersFromCategory
}