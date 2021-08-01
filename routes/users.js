const router = require('express').Router();
const {
  getUsers, getUser, createUser, updateUser, updateAvatarUser,
} = require('../controllers/users.js');

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatarUser);

module.exports = router;
