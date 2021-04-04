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
// select etapa, hora_inicio, jugadors.nombre as jug1 from partidos, cuadros, jugadors where partidos.cuadro_id=cuadros.id and jugadors.id=partidos.jugador_uno_id and cuadros.categorium_id=$1
// select partidos.id, partidos.jugador_uno_id, partidos.jugador_dos_id, jugadores1.nombre as jug1, jugadores2.nombre as jug2 from partidos inner join jugadors jugadores1 on jugadores1.id=partidos.jugador_uno_id inner join jugadors jugadores2 on jugadores2.id=partidos.jugador_dos_id
//select etapa, hora_inicio, jugadores1.nombre as jug1, jugadores2.nombre as jug2 from partidos, cuadros, jugadors jugadores1, jugadors jugadores2 where partidos.cuadro_id=cuadros.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and cuadros.categorium_id=$1 
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
//select * from partidos, grupos where partidos.grupo_id=grupos.id and grupos.categorium_id=$1

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
    const text = "update partidos set score_jugador1=$1, score_jugador2=$2 where partidos.id=$3";
    const partidoId = parseInt([req.params.id]);
    const partidoScoreJug1 = parseInt([req.params.scoreJug1]);
    const partidoScoreJug2 = parseInt([req.params.scoreJug2]);

    const response = await database.query(text, [partidoScoreJug1, partidoScoreJug2, partidoId]);
    res.status(200).json("Score actualizado");
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}

const newUser = async (req, res) => {
  try {
    const ci = req.body.ci;
    const nombre = req.body.nombre;
    const email = req.body.email;
    var password = req.body.password;
    var text = "select * from users where email=$1";
    var response = await database.query(text, [email]);

    if (response.rows.length != 0) {
      return res.status(400).json({ msg: "Este email ya esta en uso" });
    } else {
      var text = "insert into users values ($1, $2, $3, $4, $5, $6)";
      password = await bcrypt.hash(password, 10);
      var response = await database.query(text, [ci, nombre, email, password, 1, "Jugador"]);
      res.status(200).json({ msg: "Cuenta creada exitosamente!" });
    }
  } catch (e) {
    res.status(500).send({ msg: "Ocurrio un error" });
  }
}


// const login = async (req, res) => {
//   try {
//     const user = req.body.user;
//     const passId = req.body.password;
//     console.log(user + " " + passId);

//     var text = "select * from users where (nombre=$1 or email=$1) and state=1";
//     var response = await database.query(text, [user]);
//     if (response.rows.length != 0) {

//       const text = `select * from users where (nombre=$1 or email=$1) and password=$2`;
//       const datos = await database.query(text, [user, passId]);

//       if (datos.rows.length != 0) {
//         res.status(200).json(datos.rows[0]);
//       } else {
//         res.status(404).send({ msg: "Nombre o constraseña incorrectos" });
//       }

//     } else {
//       res.status(404).send({ msg: "El usuario no existe" });
//     }

//   } catch (e) {
//     res.status(500).send({ msg: "Ocurrio un error" });
//   }
// }
const login = async (req, res) => {
  try {
    const email = req.body.email;
    const passId = req.body.password;

    var text = "select * from users where email=$1 and state=1";
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
    const text = "select * from programacion where torneo_id=$1";
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
  getProg
}