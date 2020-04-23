const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs")
const Product = require("../models/product");
const { errorHandler } = require('../helpers/dbErrorHandler')

exports.productById = (req, res, next, id) => {
    Product.findById(id).exec((err, product) => {
        if(err || !product) {
            return res.status(400).json({
                error: "Product not found"
            });
        }
        req.product = product
        next();
    });
};

exports.read = (req, res) => {
    //don't include the image to make it faster -> done separately
    req.product.photo = undefined;
    return res.json(req.product);
};

exports.create = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: "Product could not be uploaded"
            });
        }

        //validation
        const { name, description, price, category, quantity, shipping } = fields;
        
        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: "All fields must be filled in"
            });
        }

        let product = new Product(fields)

        if(files.photo) {
            console.log(files.photo);
            if(files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "File size cannot exceed 1MB"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            product.photo.contentType = files.photo.type
        }

        product.save((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }
            res.json(result)
        });
    });
    
}

exports.remove = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            deletedProduct,
            message: "Product deleted successfully"
        });
    });
};