const express = require('express');
const router = express.Router();

const { create, categoryById, read, update, remove, list} = require('../controllers/category');
const { userById } = require('../controllers/user');
const { requireSignin, isAdmin, isAuth } = require('../controllers/auth');

router.delete('/category/:categoryId/:userId/', requireSignin, isAdmin, isAuth, remove);
router.put('/category/:categoryId/:userId/', requireSignin, isAdmin, isAuth, update);
router.get('/category/:categoryId', read)
router.post('/category/create/:userId', requireSignin, isAdmin, isAuth, create);
router.get('/categories', list);

router.param('userId', userById)
router.param('categoryId', categoryById);

module.exports = router;