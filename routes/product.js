const express = require('express');
const router = express.Router();

const { create, productById, read, remove} = require('../controllers/product');
const { userById } = require('../controllers/user');
const { requireSignin, isAdmin, isAuth } = require('../controllers/auth');

router.get('/product/:productId', read);
router.post('/product/create/:userId', requireSignin, isAdmin, isAuth, create);
router.delete('/product/:productId/:userId', requireSignin, isAuth, isAdmin, remove);

router.param('productId', productById);
router.param('userId', userById);

module.exports = router;