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
};

exports.remove = (req, res) => {
    let product = req.product;
    product.remove((err, deletedProduct) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: "Product deleted successfully"
        });
    });
};

exports.update = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: "Product could not be uploaded"
            });
        };

        //validation
        const { name, description, price, category, quantity, shipping } = fields;
        
        if (!name || !description || !price || !category || !quantity || !shipping) {
            return res.status(400).json({
                error: "All fields must be filled in"
            });
        };

        //same as create but overwrite current object instead
        let product = req.product
        //lodash extend method
        product = _.extend(product, fields);

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
};

// New and Popular products
// New -> sort by arrival /products?sortBy=sold&order=desc&limit=4
// Popular -> sort by sold /products?sortBy=createdAt&order=desc&limit=4

// default query if no query is given

exports.list = (req, res) => {
    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find()
    .select("-photo") //remove photo from search for quicker results
    .populate('category')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
        if(err) {
            return res.status(400).json({
                error: 'Products not found'
            });
        };
        res.json(products);
    })
};

//find similar products by category
exports.listRelated = (req, res) => {
    //same as regular default limit
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;
    
    Product.find({_id: {$ne: req.product}, category: req.product.category})
    .limit(limit)
    .populate('category', '_id name')
    .exec((err, products) => {
        if(err) {
            return res.status(400).json({
                error: 'Products not found'
            });
        };
        res.json(products);
    });
};

exports.listCategories = (req, res) => {
    Product.distinct("category", {}, (err, categories) => {
        if(err) {
            return res.status(400).json({
                error: 'Categories not found'
            });
        };
        res.json(categories);
    });
};



exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    };
 
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            };
            res.json({
                size: data.length,
                data
            });
        });
};

exports.photo = (req, res, next) => {
    if (req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType); //we send the image in whichever format it is saved in
        return res.send(req.product.photo.data); //respond with the photo data
    };
    next();
};