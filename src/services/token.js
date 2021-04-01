var jwt = require('jsonwebtoken')

async function checkToken(token) {
  let __id = null;
  try {
    const { _id } = await jwt.decode(token);
    __id = _id;
  } catch (e) {
    return false;
  }

  var text = "select * from users where ci=$1 and state=1";
  var response = await database.query(text, [__id]);
  var user = response[0];

  if (user) {
    const token = jwt.sign({ _id: __id }, "clavesecretaparagenerareltoken", { expiresIn: 30 });
    return { token, role: user.role };
  } else {
    return false;
  }
}

const encode = async (_id) => {
  const token = jwt.sign({ _id: _id }, "clavesecretaparagenerareltoken", { expiresIn: 30 });
  return token;
}
const decode = async (token) => {
  try {
    const { _id } = await jwt.verify(token, "clavesecretaparagenerareltoken");
    var text = "select * from users where ci=$1 and state=1";
    var response = await database.query(text, [_id]);
    var user = response[0];
    if (user) {
      return user;
    } else {
      return false;
    }
  } catch (e) {
    const newToken = await checkToken(token);
    return newToken;
  }
}

module.exports = {
  encode,
  decode
}