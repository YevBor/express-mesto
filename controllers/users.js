const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

// const {
//   ERROR_CODE_USER, ERROR_CODE_BAD_REQUEST, ERROR_CODE_SERVER, message400, message500,
// } = require('../utils/error_codes');

const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');
const ConflictError = require('../errors/conflict-err');
const UnauthorizedError = require('../errors/unauthorized-err');


//New verison
const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

//Old version
// const getUsers = async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.send(users);
//   } catch (err) {
//     if (err.name === 'CastError') {
//       res.status(ERROR_CODE_USER).send({ message: message400 });
//     } else {
//       res.status(ERROR_CODE_SERVER).send({ message: message500 });
//     }
//   }
// };

//New verison
const getProfile = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Невалидный id');
      }
      throw err;
    })
    .catch(next);
};


//Old version
// const getUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Нет пользователя с таким id' });
//     } else {
//       res.send(user);
//     }
//   } catch (err) {
//     if (err.name === 'CastError') {
//       res.status(ERROR_CODE_USER).send({ message: message400 });
//     } else {
//       res.status(ERROR_CODE_SERVER).send({ message: message500 });
//     }
//   }
// };

//New verison
const getMe = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Нет доступа' });
  }

  const token = authorization.replace('Bearer ', '');

  const isAuthorized = () => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return false;
    }
  };

  if (!isAuthorized(token)) {
    throw new ForbiddenError('Доступ запрещен');
  }

  return User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Нет пользователя с таким id'));
      }
      return res.status(200).send({ data: user });
    })
    .catch(next);
};

//New verison
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.status(200).send({ mail: user.email }))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Данные не прошли валидацию');
      }
      if (err.name === 'MongoError' || err.code === '11000') {
        throw new ConflictError('Такой емейл уже зарегистрирован');
      }
    })
    .catch(next);
};

//Old version
// const createUser = async (req, res) => {
//   try {
//     const id = User.countDocuments();
//     const {
//       name, about, avatar, email, password,
//     } = req.body;
//     // const hash = bcrypt.hash(password, 10);
//     const user = await User.create({
//       id,
//       name,
//       about,
//       avatar,
//       email,
//       password: bcrypt.hash(password, 10),
//     });
//     res.status(200).send({ mail: user.email })
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

//New verison
const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      return res.send({ jwt: token });
    })
    .catch(() => {
      throw new UnauthorizedError('Не удалось авторизироваться');
    })
    .catch(next);
};

//Old version
// const updateUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.user._id, {
//       name: req.body.name,
//       about: req.body.about,
//     }, { runValidators: true, new: true })
//       .orFail(new Error('NotValidId'));
//     res.send(user);
//   } catch (err) {
//     if (err.message === 'NotValidId') {
//       res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Пользавателя нет в базе данных' });
//     } else if (err.name === 'ValidationError') {
//       res.status(ERROR_CODE_USER).send({ message: err.message });
//     } else {
//       res.status(ERROR_CODE_SERVER).send({ message: message500 });
//     }
//   }
// };

//Old version
// const updateAvatarUser = async (req, res) => {
//   try {
//     const avatar = await User.findByIdAndUpdate(req.user._id, {
//       avatar: req.body.avatar,
//     }, { runValidators: true, new: true })
//       .orFail(new Error('NotValidId'));
//     res.send(avatar);
//   } catch (err) {
//     if (err.message === 'NotValidId') {
//       res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Пользавателя нет в базе данных' });
//     } else if (err.name === 'ValidationError') {
//       res.status(ERROR_CODE_USER).send({ message: err.message });
//     } else {
//       res.status(ERROR_CODE_SERVER).send({ message: message500 });
//     }
//   }
// };

//New verison
const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const owner = req.user._id;
  return User.findByIdAndUpdate(owner, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Нет пользователя с таким id'));
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Невалидные данные');
      }
    })
    .catch(next);
};

//New verison
const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const owner = req.user._id;

  return User.findByIdAndUpdate(owner, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Нет пользователя с таким id'));
      }
      res.send(user);
    })
    .catch(next);
};

module.exports = {
  getUsers,
  getProfile,
  createUser,
  updateProfile,
  login,
  getMe,
  updateAvatar,
};
