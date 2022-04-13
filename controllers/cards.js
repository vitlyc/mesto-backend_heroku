const card = require('../models/cards');

const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');

module.exports.getCards = (req, res, next) => {
  card
    .find({})
    .then((item) => res.send(item))
    .catch((err) => next(err));
};
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  card
    .create({
      name,
      link,
      owner: req.user._id,
    })
    .then((item) => res.send(item))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Не удалось создать карточку'));
      } else {
        next(err);
      }
    });
};
module.exports.likeCard = (req, res, next) => {
  card
    .findByIdAndUpdate(
      req.params.cardId, {
        $addToSet: { likes: req.user._id },
      },
      // eslint-disable-next-line comma-dangle
      { new: true }
    )
    .orFail(new Error('NotFound'))
    .then((like) => {
      res.status(200).send(like);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Нет такой карточки'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequest('Неверные данные'));
      } else if (err.message === 'NotFound') {
        next(new NotFound('Нет такой карточки'));
      } else {
        next(err);
      }
    });
};
module.exports.dislikeCard = (req, res, next) => {
  card
    .findByIdAndUpdate(
      req.params.cardId, {
        $pull: { likes: req.user._id },
      },

      { new: true },
    )
    .orFail(new Error('NotFound'))
    .then((like) => {
      res.status(200).send(like);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Нет такой карточки'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequest('Неверные данные'));
      } else if (err.message === 'NotFound') {
        next(new NotFound('Нет такой карточки'));
      } else {
        next(err);
      }
    });
};
module.exports.deleteCard = (req, res, next) => {
  const cardid = req.params.cardId// находит по ид
  card.findById(cardid)
    .orFail(() => {
      throw new NotFound('Нет карточки по заданному id');
    })
    .then((item) => {
      if (item._id.toString() === req.params.cardId) {
        card.deleteOne(item).then(() => {
          res.send({ data: card });
        });
      } else {
        throw new Forbidden('Нельзя удалить чужую карточку');
      }
    })
    .catch((err) => next(err));
};
