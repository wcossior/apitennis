const { Client } = require("pg");
const bcrypt = require('bcryptjs');
const token = require("../services/token");


const database = new Client({
  connectionString: "postgres://ucralauolpfuxc:38afec102b9182a320e2c9afe515a1b6723d307eda29dc7f175037cb693b9649@ec2-54-164-134-207.compute-1.amazonaws.com:5432/d8god16o1u8tk",
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

const getTorneo = async (req, res) => {
  try {

    //obteniendo la categoria del jugador de su ultima inscripcion
    const text = "select max(fecha_inscripcion), categorium_id from jugadors where ci=$1 group by categorium_id";
    const values = [req.params.ci];
    const response = await database.query(text, values);
    if (!response.rows[0]) {
      res.status(200).json([]);
    }
    const data = response.rows[0];
    const idCategoria = [data.categorium_id];

    const text2 = "select torneo_id from categoria where id=$1";
    const response2 = await database.query(text2, idCategoria);
    const data2 = response2.rows[0];
    const idTorneo = [data2.torneo_id];


    const text3 = "select * from torneos where id=$1";
    const response3 = await database.query(text3, idTorneo);
    var today = new Date();
    var currentDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const dateTorneo = response3.rows[0].fecha_fin;
    var finishDateTorneo = dateTorneo.getFullYear() + '-' + (dateTorneo.getMonth() + 1) + '-' + dateTorneo.getDate();

    //si el torneo ya termino no retorna nada
    if (finishDateTorneo > currentDate) {
      res.status(200).json(response3.rows);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const newMessage = async (req, res) => {

}
const getCategorias = async (req, res) => {
  try {
    const text = "select * from categoria where torneo_id=$1";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const getGrupos = async (req, res) => {
  try {
    const text = "select * from grupos where categorium_id=$1";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const getCuadros = async (req, res) => {
  try {
    const text = "select * from cuadros where categorium_id=$1";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const getPartidosCuadro = async (req, res) => {
  try {
    const text = "select partidos.id, partidos.numero_cancha, etapa, score_jugador1, score_jugador2, hora_inicio, partidos.jugador_uno_id, partidos.jugador_dos_id, jugadores1.nombre as jug1, jugadores2.nombre as jug2 from partidos, cuadros, jugadors jugadores1, jugadors jugadores2 where partidos.cuadro_id=cuadros.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and cuadros.categorium_id=$1 ";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}
const getSets = async (req, res) => {
  try {
    const text = "select * from sets where id_partido=$1";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const newSet = async (req, res) => {
  try {
    const text = "insert into sets values ($1, $2, $3, $4, $5)";
    var id = new Date().valueOf();
    const partidoId = parseInt(req.body.idPartido);
    const scoreJug1 = parseInt(req.body.scoreJug1);
    const scoreJug2 = parseInt(req.body.scoreJug2);
    const nroSet = req.body.nroSet;

    await database.query(text, [id, partidoId, scoreJug1, scoreJug2, nroSet]);
    res.status(200).json({ msg: "Score guardado" });
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error"});
  }
}
const deleteSet = async (req, res) => {
  try {
    const text = "delete from sets where id=$1";
    const value = [req.params.id];

    await database.query(text, value);
    res.status(200).json({ msg: "Score eliminado" });
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" + error });
  }
}

const updateSet = async (req, res) => {
  try {
    const text = "update sets set score_jug_1=$1, score_jug_2=$2, nro_set=$3 where id=$4";
    const scoreJug1 = parseInt(req.body.scoreJug1);
    const scoreJug2 = parseInt(req.body.scoreJug2);
    const nroSet = req.body.nroSet;
    const idSet = parseInt(req.body.idSet);

    await database.query(text, [scoreJug1, scoreJug2, nroSet, idSet]);
    res.status(200).json({ msg: "Score actualizado" });
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error "+error });
  }
}

const getPartidosGrupo = async (req, res) => {
  try {
    const text = "select partidos.id, partidos.numero_cancha, grupos.nombre, score_jugador1, score_jugador2, hora_inicio, partidos.jugador_uno_id, partidos.jugador_dos_id, jugadores1.nombre as jug1, jugadores2.nombre as jug2 from partidos, grupos, jugadors jugadores1, jugadors jugadores2 where partidos.grupo_id=grupos.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and grupos.categorium_id=$1 ";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const updatePartidos = async (req, res) => {
  try {
    const text = "update partidos set score_jug1_set=$1, score_jug2_set=$2 where partidos.id=$3";
    const partidoId = parseInt(req.params.id);
    const partidoScoreJug1 = parseInt(req.params.scoreJug1);
    const partidoScoreJug2 = parseInt(req.params.scoreJug2);

    const response = await database.query(text, [partidoScoreJug1, partidoScoreJug2, partidoId]);
    res.status(200).json({ msg: "Score actualizado" });
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const newUser = async (req, res) => {
  try {
    var id = new Date().valueOf();
    const ci = req.body.ci;
    const nombre = req.body.nombre;
    const email = req.body.email;
    var password = req.body.password;
    var text = "select * from usuarios where email=$1";
    var response = await database.query(text, [email]);

    if (response.rows.length != 0) {
      res.status(400).json({ msg: "Este email ya esta en uso" });
    } else {
      var text = "insert into usuarios values ($1, $2, $3, $4, $5, $6)";
      password = await bcrypt.hash(password, 10);
      var response = await database.query(text, [id, ci, nombre, email, password, "Jugador"]);
      res.status(200).json({ msg: "Cuenta creada exitosamente!" });
    }
  } catch (e) {
    res.status(500).send({ msg: "Ocurrio un error" + e });
  }
}

const login = async (req, res) => {
  try {
    const email = req.body.email;
    const passId = req.body.password;

    var text = "select * from usuarios where email=$1";
    var response = await database.query(text, [email]);
    var user = response.rows[0];

    if (user) {
      let match = await bcrypt.compare(passId, user.password);
      if (match) {
        let tokenReturn = await token.encode(user.ci);
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
    res.status(500).send({ msg: "Ocurrio un error" + e });
  }

}

const getProg = async (req, res) => {
  try {
    const text = "select * from programacion where torneo_id=$1 ";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

module.exports = {
  getTorneos,
  getCategorias,
  getCuadros,
  getGrupos,
  getPartidosGrupo,
  getPartidosCuadro,
  updatePartidos,
  newUser,
  login,
  getProg,
  getTorneo,
  newMessage,
  getSets,
  newSet,
  updateSet,
  deleteSet,
}