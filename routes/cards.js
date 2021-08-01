const router = require('express').Router();
const {
  getCards, createCard, deleteCard, likeCard, disLikeCard,
} = require('../controllers/cards.js');

router.get('/', getCards);
router.post('/', createCard);
router.delete('/:id', deleteCard);
router.put('/:id/likes', likeCard);
router.delete('/:id/likes', disLikeCard);

module.exports = router;


