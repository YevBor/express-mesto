const Card = require('../models/card');
const {
  ERROR_CODE_USER, ERROR_CODE_BAD_REQUEST, ERROR_CODE_SERVER, message400, message500,
} = require('../utils/error_codes.js');

const getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    res.send(cards);
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(ERROR_CODE_USER).send({ message: message400 });
    } else {
      res.status(ERROR_CODE_SERVER).send({ message: message500 });
    }
  }
};

const createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    const card = await Card.create({
      owner, name, link,
    });
    res.send(card);
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(ERROR_CODE_USER).send({ message: message400 });
    } else if (err.name === 'ValidationError') {
      res.status(ERROR_CODE_USER).send({ message: err.message });
    } else {
      res.status(ERROR_CODE_SERVER).send({ message: message500 });
    }
  }
};

const deleteCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndRemove(req.params.id);
    if (!card) {
      res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Нет карточки с таким id' });
    } else {
      res.send(card);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(ERROR_CODE_USER).send({ message: message400 });
    } else {
      res.status(ERROR_CODE_SERVER).send({ message: message500 });
    }
  }
};

const likeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (!card) {
      res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Нет карточки с таким id' });
    } else {
      res.send(card);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(ERROR_CODE_USER).send({ message: message400 });
    } else {
      res.status(ERROR_CODE_SERVER).send({ message: message500 });
    }
  }
};

const disLikeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (!card) {
      res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Нет карточки с таким id' });
    } else {
      res.send(card);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(ERROR_CODE_USER).send({ message: message400 });
    } else {
      res.status(ERROR_CODE_SERVER).send({ message: message500 });
    }
  }
};

module.exports = {
  getCards, createCard, deleteCard, likeCard, disLikeCard,
};
