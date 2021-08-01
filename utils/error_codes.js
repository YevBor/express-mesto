const ERROR_CODE_USER = 400;
const ERROR_CODE_BAD_REQUEST = 404;
const ERROR_CODE_SERVER = 500;

const message400 = 'Переданы некорректные данные';
const message500 = 'Произошла ошибка сервера';

module.exports = {
  ERROR_CODE_USER, ERROR_CODE_BAD_REQUEST, ERROR_CODE_SERVER, message400, message500,
};
