const Card = require('../models/card');

const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');

// const {
//   ERROR_CODE_USER, ERROR_CODE_BAD_REQUEST, ERROR_CODE_SERVER, message400, message500,
// } = require('../utils/error_codes.js');

const getCards = (req, res, next) => Card.find({})
  .sort({ createdAt: -1 })
  .then((cards) => res.status(200).send(cards))
  .catch(next);

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Данные не прошли валидацию');
      }
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const owner = req.user._id;
  Card
    .findOne({ _id: req.params.cardId })
    .orFail(() => new NotFoundError('Карточка с таким id не найдена'))
    .then((card) => {
      if (!card.owner.equals(owner)) {
        next(new ForbiddenError('Нельзя удалить чужую карточку'));
      } else {
        Card.deleteOne(card)
          .then(() => res.status(200).send({ message: 'Карточка удалена' }));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Данные не прошли валидацию'));
      }
      throw err;
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  const owner = req.user._id;
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: owner } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с таким id не найдена');
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Данные не прошли валидацию');
      }
      throw err;
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  const owner = req.user._id;
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: owner } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с таким id не найдена');
      }
      return res.status(200).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Данные не прошли валидацию');
      }
      throw err;
    })
    .catch(next);
};



//Old verison
// const getCards = async (req, res) => {
//   try {
//     const cards = await Card.find({});
//     res.send(cards);
//   } catch (err) {
//     if (err.name === 'CastError') {
//       res.status(ERROR_CODE_USER).send({ message: message400 });
//     } else {
//       res.status(ERROR_CODE_SERVER).send({ message: message500 });
//     }
//   }
// };

//Old verison
// const createCard = async (req, res) => {
//   try {
//     const { name, link } = req.body;
//     const owner = req.user._id;
//     const card = await Card.create({
//       owner, name, link,
//     });
//     res.send(card);
//   } catch (err) {
//     if (err.name === 'CastError') {
//       res.status(ERROR_CODE_USER).send({ message: message400 });
//     } else if (err.name === 'ValidationError') {
//       res.status(ERROR_CODE_USER).send({ message: err.message });
//     } else {
//       res.status(ERROR_CODE_SERVER).send({ message: message500 });
//     }
//   }
// };

//Old verison
// const deleteCard = async (req, res) => {
//   try {
//     const card = await Card.findByIdAndRemove(req.params.id);
//     if (!card) {
//       res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Нет карточки с таким id' });
//     } else {
//       res.send(card);
//     }
//   } catch (err) {
//     if (err.name === 'CastError') {
//       res.status(ERROR_CODE_USER).send({ message: message400 });
//     } else {
//       res.status(ERROR_CODE_SERVER).send({ message: message500 });
//     }
//   }
// };

//Old verison
// const likeCard = async (req, res) => {
//   try {
//     const card = await Card.findByIdAndUpdate(
//       req.params.id,
//       { $addToSet: { likes: req.user._id } },
//       { new: true },
//     );
//     if (!card) {
//       res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Нет карточки с таким id' });
//     } else {
//       res.send(card);
//     }
//   } catch (err) {
//     if (err.name === 'CastError') {
//       res.status(ERROR_CODE_USER).send({ message: message400 });
//     } else {
//       res.status(ERROR_CODE_SERVER).send({ message: message500 });
//     }
//   }
// };

//Old verison
// const disLikeCard = async (req, res) => {
//   try {
//     const card = await Card.findByIdAndUpdate(
//       req.params.id,
//       { $pull: { likes: req.user._id } },
//       { new: true },
//     );
//     if (!card) {
//       res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Нет карточки с таким id' });
//     } else {
//       res.send(card);
//     }
//   } catch (err) {
//     if (err.name === 'CastError') {
//       res.status(ERROR_CODE_USER).send({ message: message400 });
//     } else {
//       res.status(ERROR_CODE_SERVER).send({ message: message500 });
//     }
//   }
// };

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
