const { Client } = require("pg");
const bcrypt = require('bcryptjs');
const token = require("../services/token");

var FCM = require('fcm-node');
var serverKey = 'AAAAZqt7s_E:APA91bHjDRT84dJeYeN9OzIgH7VHCEkn9E1vBxko5eStVwJMmKeUyXZqe2DC20UdCpVFVNHriIZho3HIac0q0446ihcDFq_pIE2ZjC0RfIw7Q2DOTxx-yIbdeb-WR0wRSvo8XpR_W8oB'; //put your server key here
var fcm = new FCM(serverKey);


const database = new Client({
  // connectionString: "postgres://ucralauolpfuxc:38afec102b9182a320e2c9afe515a1b6723d307eda29dc7f175037cb693b9649@ec2-54-164-134-207.compute-1.amazonaws.com:5432/d8god16o1u8tk",
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
//dgh3YaYC8aw:APA91bEvgFcc5Uena0STxfqWUhQRLHlWjEdxXVEC69Yv4vavlYazPUv_luvnArg7k9aGDAEm7-B60_1cyCBgg8OUmk1PCkfg-rj5olWix7A-JcJp1trvY6uppzM-YNBle0jYwlq0hFag
//cc2CUrcIkow:APA91bFNYav7wb4a-IVb83TtvJP17MtbCZW_iAHN4VgHXUQQqBXSZ95iYZfuetxUvhT-m3Fi3a-6BBqaVi90WwvMXNdfeLUtNrtooKtgunJ6idlvP9xKdPB9K5g5HIjlvesgg-G0rg9j

const sendMessage = async (req, res) => {
  try {
    const description = req.body.description;
    const title = req.body.title;
    const dispositivo = req.body.dispositivo;
    var message = {
      // registration_ids: ['ckcNPj4mieE:APA91bGhOCzdyCucv6LT6ev_py2XbDkIKsQoVw4khmdlgyWkUpngYN2vda9_h_Qg5Z-gNgTnAN5zMELWgak9nyOC8HKpkTc7CcOsD9hbe_rNBai60Lw8psZLuxkrfUhvbDOI75231G3y','cja-cxm_gHE:APA91bGeWG-Y4zVqHNw38VXmKw2ZC7FilnicMTzR9783UIDibFStI512teXEM0CmzDlU-uFFvvxF2hmGRKUvlNIDJwucHVe8glkQF8X5_ZCyHYyOGlwdoReSdhyy4CAcKwDbuibb4dB7'],
      to: dispositivo,
      notification: {
        title: title,
        body: description
      },
      data: {
        comida: 'quiero pollo chester',
      }
    };

    fcm.send(message, async function (err, response) {
      if (err) {
        res.status(500).send({ msg: "Ocurrio un error" });
      } else {
        var data = JSON.parse(response);
        var id = data.results[0].message_id;
        var enviado = new Date();
        const text = "insert into notificaciones values ($1, $2, $3, $4, $5, $6, $7, $8)";

        const id_torneo = parseInt(req.body.id_torneo);
        const id_categoria = parseInt(req.body.id_categoria);
        // const id_partido = parseInt(req.body.id_partido);

        await database.query(text, [id, id_torneo, id_categoria, 0, description, title, dispositivo, enviado]);
        res.status(200).json({ msg: "Notificación enviada" });
      }
    });

  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error " + error });
  }

}

const getNotifications = async (req, res) => {
  try {
    const response = await database.query("select * from notificaciones");
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
    res.status(500).send({ msg: "Ocurrio un error" + error });
  }
}

// const getPartidosCuadro = async (req, res) => {
//   try {
//     const text = "select partidos.id, partidos.numero_cancha, etapa, score_jugador1, score_jugador2, hora_inicio, partidos.jugador_uno_id, partidos.jugador_dos_id, jugadores1.nombre as jug1, jugadores2.nombre as jug2 from partidos, cuadros, jugadors jugadores1, jugadors jugadores2 where partidos.cuadro_id=cuadros.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and cuadros.categorium_id=$1 ";
//     const values = [req.params.id];
//     const response = await database.query(text, values);
//     res.status(200).json(response.rows);
//   } catch (error) {
//     res.status(500).send({ msg: "Ocurrio un error" });
//   }
// }
// const getPartidosCuadro = async (req, res) => {
//   try {
//     const text = "select * from cuadros inner join partidos on cuadros.id=partidos.cuadro_id where categorium_id=$1 order by partidos.numero";
//     const values = [req.params.id];
//     const response = await database.query(text, values);
//     res.status(200).json(response.rows);
//   } catch (error) {
//     res.status(500).send({ msg: "Ocurrio un error" });
//   }
// }
const getPartidosCuadro = async (req, res) => {
  try {
    const values = [req.params.id];
    const consulta = "select categoria_type from categoria where id=$1";
    const resp = await database.query(consulta, values);
    if (resp.rows[0].categoria_type == "Singles") {
      const text = "select partidos.id, partido_type, hora_inicio, hora_inico_mv, hora_fin, numero_cancha, ronda_torneo_id, marcador, partido_terminado, cuadros.etapa, jugadores1.nombre as jug1, jugadores2.nombre as jug2 from partidos, cuadros, jugadors jugadores1, jugadors jugadores2 where partidos.cuadro_id=cuadros.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and cuadros.categorium_id=$1 order by partidos.id";
      const response = await database.query(text, values);
      res.status(200).json(response.rows);
    } else {
      res.status(200).json([]);
    }

  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" + error });
  }
}

// const getSets = async (req, res) => {
//   try {
//     const text = "select * from sets where id_partido=$1";
//     const values = [req.params.id];
//     const response = await database.query(text, values);
//     res.status(200).json(response.rows);
//   } catch (error) {
//     res.status(500).send({ msg: "Ocurrio un error" });
//   }
// }

// const newSet = async (req, res) => {
//   try {
//     const text = "insert into sets values ($1, $2, $3, $4, $5)";
//     var id = new Date().valueOf();
//     const partidoId = parseInt(req.body.idPartido);
//     const scoreJug1 = parseInt(req.body.scoreJug1);
//     const scoreJug2 = parseInt(req.body.scoreJug2);
//     const nroSet = req.body.nroSet;

//     await database.query(text, [id, partidoId, scoreJug1, scoreJug2, nroSet]);
//     res.status(200).json({ msg: "Score guardado" });
//   } catch (error) {
//     res.status(500).send({ msg: "Ocurrio un error" });
//   }
// }
// const deleteSet = async (req, res) => {
//   try {
//     const text = "delete from sets where id=$1";
//     const value = [req.params.id];

//     await database.query(text, value);
//     res.status(200).json({ msg: "Score eliminado" });
//   } catch (error) {
//     res.status(500).send({ msg: "Ocurrio un error" });
//   }
// }

// const updateSet = async (req, res) => {
//   try {
//     const text = "update sets set score_jug_1=$1, score_jug_2=$2, nro_set=$3 where id=$4";
//     const scoreJug1 = parseInt(req.body.scoreJug1);
//     const scoreJug2 = parseInt(req.body.scoreJug2);
//     const nroSet = req.body.nroSet;
//     const idSet = parseInt(req.body.idSet);

//     await database.query(text, [scoreJug1, scoreJug2, nroSet, idSet]);
//     res.status(200).json({ msg: "Score actualizado" });
//   } catch (error) {
//     res.status(500).send({ msg: "Ocurrio un error " });
//   }
// }

// const getPartidosGrupo = async (req, res) => {
//   try {
//     const text = "select partidos.id, partidos.numero_cancha, grupos.nombre, score_jugador1, score_jugador2, hora_inicio, partidos.jugador_uno_id, partidos.jugador_dos_id, jugadores1.nombre as jug1, jugadores2.nombre as jug2 from partidos, grupos, jugadors jugadores1, jugadors jugadores2 where partidos.grupo_id=grupos.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and grupos.categorium_id=$1 ";
//     const values = [req.params.id];
//     const response = await database.query(text, values);
//     res.status(200).json(response.rows);
//   } catch (error) {
//     res.status(500).send({ msg: "Ocurrio un error" });
//   }
// }

// "[{\"jugador_uno\":6,\"jugador_dos\":0},{\"jugador_uno\":6,\"jugador_dos\":0}]"

const updateResult = async (req, res) => {
  try {
    // const text = "update partidos set marcador=$1 where id=$2";
    const text = `update partidos set marcador=$1 where id=$2`;
    const partidoId = req.body.idPartido;
    const score = req.body.score;
    await database.query(text, [JSON.stringify(score), partidoId]);
    res.status(200).json({ msg: "Marcador guardado" });
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error " + error });
  }
}
const fullTime = async (req, res) => {
  try {
    const fecha = new Date();
    const text = "update partidos set marcador=$1, hora_fin=$2, partido_terminado=true where id=$3";
    const partidoId = req.body.idPartido;
    const score = req.body.score;
    await database.query(text, [JSON.stringify(score), fecha, partidoId]);
    res.status(200).json({ msg: "Partido finalizado con exito" });
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error " + error });
  }
}
const getPartidosGrupo = async (req, res) => {
  try {
    const values = [req.params.id];
    const consulta = "select categoria_type from categoria where id=$1";
    const resp = await database.query(consulta, values);
    if (resp.rows[0].categoria_type == "Singles") {
      const text = "select partidos.id, partido_type, hora_inicio, hora_inico_mv, hora_fin, numero_cancha, ronda_torneo_id, marcador, partido_terminado, grupos.nombre, jugadores1.nombre as jug1, jugadores2.nombre as jug2 from partidos, grupos, jugadors jugadores1, jugadors jugadores2 where partidos.grupo_id=grupos.id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and grupos.categorium_id=$1 order by grupos.nombre";
      const response = await database.query(text, values);
      res.status(200).json(response.rows);
    } else {
      res.status(200).json([]);
    }

  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" + error });
  }
}

const newUser = async (req, res) => {
  try {
    const ci = req.body.ci;
    const nombre = req.body.nombre;
    const email = req.body.email;
    const fecha = new Date();
    var password = req.body.password;
    var text = "select * from usuarios where email=$1";
    var response = await database.query(text, [email]);

    if (response.rows.length != 0) {
      res.status(400).json({ msg: "Este email ya esta en uso" });
    } else {
      var text = "insert into usuarios (email, encrypted_password, created_at, updated_at, ci, nombre, rol) values ($1, $2, $3, $4, $5, $6, 'Jugador')";
      password = await bcrypt.hash(password, 10);
      var response = await database.query(text, [email, password, fecha, fecha, ci, nombre]);
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

    var text = "select * from usuarios where email=$1";
    var response = await database.query(text, [email]);
    var user = response.rows[0];

    if (user) {
      let match = await bcrypt.compare(passId, user.encrypted_password);
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
    res.status(500).send({ msg: "Ocurrio un error" });
  }

}

const getProg = async (req, res) => {
  try {
    // const text = "select * from ronda_torneos right join partidos on ronda_torneos.id=partidos.ronda_torneo_id where torneo_id=$1 order by partidos.numero";
    const text = "select partidos.id, partido_type, partidos.hora_inicio, hora_fin, hora_inico_mv, numero_cancha, ronda_torneo_id, partido_terminado, jugadores1.nombre as jug1, jugadores2.nombre as jug2 from partidos, ronda_torneos, jugadors jugadores1, jugadors jugadores2 where ronda_torneos.id=partidos.ronda_torneo_id and jugadores1.id=partidos.jugador_uno_id and jugadores2.id=partidos.jugador_dos_id and ronda_torneos.torneo_id=$1 order by partidos.numero";
    const values = [req.params.id];
    const response = await database.query(text, values);
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).send({ msg: "Ocurrio un error" + error });
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
  getTorneo,
  sendMessage,
  updateResult,
  getNotifications,
  fullTime
}