const jwt = require("jsonwebtoken");
const Unauthorized = require("../errors/Unauthorized");
require("dotenv").config();
const getToken = (header) => header.replace("Bearer ", "");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  console.log(req.headers);

  const { NODE_ENV, JWT_SECRET } = process.env;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Unauthorized("Нужна авторизация1");
  }
  const token = getToken(authorization);
  let payload;
  try {
    payload = jwt.verify(
      token,
      NODE_ENV === "production" ? JWT_SECRET : "super-strong-secret"
    );
  } catch (err) {
    throw new Unauthorized("Нужна авторизация2");
  }
  req.user = payload;
  next();
};
