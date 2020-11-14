const { Pool } = require("pg");

const database = new Pool({
  host: "ec2-54-164-134-207.compute-1.amazonaws.com",
  user: "ucralauolpfuxc",
  password: "38afec102b9182a320e2c9afe515a1b6723d307eda29dc7f175037cb693b9649",
  database: "d8god16o1u8tk"
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