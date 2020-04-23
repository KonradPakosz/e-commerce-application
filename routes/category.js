const express = require('express');
const router = express.Router();

const { create, categoryById, read } = require('../controllers/category');
const { userById } = require('../controllers/user');
const { requireSignin, isAdmin, isAuth } = require('../controllers/auth');

router.get('/category/:categoryId', read)
router.post('/category/create/:userId', requireSignin, isAdmin, isAuth, create);

router.param('userId', userById)
router.param('categoryId', categoryById);

module.exports = router;