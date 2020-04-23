const express = require('express');
const router = express.Router();

const { create, productById, read, remove, update, list, listRelated, listCategories, photo, listBySearch} = require('../controllers/product');
const { userById } = require('../controllers/user');
const { requireSignin, isAdmin, isAuth } = require('../controllers/auth');

router.get('/product/:productId', read);
router.post('/product/create/:userId', requireSignin, isAdmin, isAuth, create);
router.delete('/product/:productId/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/product/:productId/:userId', requireSignin, isAuth, isAdmin, update);
router.get('/products', list);
router.get('/products/related/:productId', listRelated);
router.get('/products/categories', listCategories); //categories that have products assigned to them
router.post("/products/by/search", listBySearch); //search functionality
router.get("/product/photo/:productId", photo);

router.param('productId', productById);
router.param('userId', userById);

module.exports = router;