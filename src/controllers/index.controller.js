const { Pool } = require("pg");

const database = new Pool({
  host: "localhost",
  user: "postgres",
  password: "bdpassword",
  database: "AppTennis"
});

const getTorneos = async ( req,res)=>{
  const response = await database.query("select * from torneos");
  console.log(response.rows);
  res.send("users");
}

module.exports = {
  getTorneos,
}