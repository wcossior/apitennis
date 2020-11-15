const { Client } = require("pg");

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
    console.log(error);
  }
}

const getCategorias = async (req, res) => {
  try {
    const text = "select * from categoria where torneo_id=$1";
    const values = [req.params.id];
    const response = await database.query(text, values);    
    res.status(200).json(response.rows);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getTorneos,
  getCategorias,
}