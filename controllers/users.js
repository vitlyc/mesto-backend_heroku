const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

const ERROR_200 = 200;
const ERROR_201 = 201;
// const ERROR_400 = 400;
// const ERROR_404 = 404;
// const ERROR_409 = 409;
// const ERROR_500 = 500;

const NotFound = require("../errors/NotFound");
const BadRequest = require("../errors/BadRequest");
const Unauthorized = require("../errors/Unauthorized");
const WrongEmail = require("../errors/WrongEmail");

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((item) => res.send({ data: item }))
    .catch(next);
};
module.exports.createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
    )
    .then((user) => {
      res.status(ERROR_201).send({ _id: user._id, email: user.email });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequest(err.message));
      }
      if (err.code === 11000) {
        next(new WrongEmail("Этот email уже зарегистрирован"));
      } else {
        next(err);
      }
    });
};
module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(new NotFound("NotFound"))
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequest("Нет такого пользователя"));
      } else if (err.message === "NotFound") {
        next(new NotFound("Нет такого пользователя"));
      } else {
        next(err);
      }
    });
};
module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    {
      avatar,
    },
    // eslint-disable-next-line comma-dangle
    { new: true, runValidators: true }
  )
    .orFail(new NotFound("NotFound"))
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequest("Нет такого пользователя"));
      } else if (err.name === "ValidationError") {
        next(new BadRequest("Неверные данные"));
      } else if (err.message === "NotFound") {
        next(new NotFound("Нет такого пользователя"));
      } else {
        next(err);
      }
    });
};
module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true }
  )
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        throw new BadRequest(err.message);
      }
    })
    .catch(next);
};
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  console.log(req);
  User.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        next(new Unauthorized("Неправильные почта или пароль"));
      }
      bcrypt
        .compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            next(new Unauthorized("Неправильные почта или пароль"));
          }
          const token = jwt.sign({ _id: user.id }, "super-strong-secret", {
            expiresIn: "7d",
          });
          return res.status(ERROR_200).send({ token });
        })
        .catch((err) => {
          next(new Unauthorized(err.message));
        })
        .catch(next);
    })
    .catch(next);
};
module.exports.getCurrentUser = (req, res, next) => {
  console.log(req.user);
  User.findById(req.user._id)
    .then((item) => {
      if (!item) {
        return next(new NotFound("Пользователь не найден"));
      }
      return res.status(ERROR_200).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequest("Нет такого пользователя"));
      }
      next(err);
    });
};
