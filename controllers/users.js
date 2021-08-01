const bcrypt = require('bcryptjs');
const User = require('../models/user');
const {
  ERROR_CODE_USER, ERROR_CODE_BAD_REQUEST, ERROR_CODE_SERVER, message400, message500,
} = require('../utils/error_codes');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(ERROR_CODE_USER).send({ message: message400 });
    } else {
      res.status(ERROR_CODE_SERVER).send({ message: message500 });
    }
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Нет пользователя с таким id' });
    } else {
      res.send(user);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(ERROR_CODE_USER).send({ message: message400 });
    } else {
      res.status(ERROR_CODE_SERVER).send({ message: message500 });
    }
  }
};

const createUser = async (req, res) => {
  try {
    const id = User.countDocuments();
    const { name, about, avatar, email, password } = req.body;
    bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))

    const user = await User.create({
      id, name, about, avatar,
    });
    res.send(user);
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

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, {
      name: req.body.name,
      about: req.body.about,
    }, { runValidators: true, new: true })
      .orFail(new Error('NotValidId'));
    res.send(user);
  } catch (err) {
    if (err.message === 'NotValidId') {
      res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Пользавателя нет в базе данных' });
    } else if (err.name === 'ValidationError') {
      res.status(ERROR_CODE_USER).send({ message: err.message });
    } else {
      res.status(ERROR_CODE_SERVER).send({ message: message500 });
    }
  }
};

const updateAvatarUser = async (req, res) => {
  try {
    const avatar = await User.findByIdAndUpdate(req.user._id, {
      avatar: req.body.avatar,
    }, { runValidators: true, new: true })
      .orFail(new Error('NotValidId'));
    res.send(avatar);
  } catch (err) {
    if (err.message === 'NotValidId') {
      res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Пользавателя нет в базе данных' });
    } else if (err.name === 'ValidationError') {
      res.status(ERROR_CODE_USER).send({ message: err.message });
    } else {
      res.status(ERROR_CODE_SERVER).send({ message: message500 });
    }
  }
};

module.exports = {
  getUsers, getUser, createUser, updateUser, updateAvatarUser,
};
