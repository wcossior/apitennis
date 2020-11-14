const { Pool } = require("pg");

const database = new Pool({
  host: "localhost",
  user: "postgres",
  password: "bdpassword",
  database: "AppTennis"
});

const getTorneos = async (req, res) => {
  const response = await database.query("select * from torneos");
  console.log(response.rows);
  res.status(200).json(response.rows);
}

const getCategorias = async (req, res) => {
  const response = await database.query("select * from categoria");
  console.log(response.rows);
  res.status(200).json(response.rows);
}

module.exports = {
  getTorneos,
  getCategorias,
}