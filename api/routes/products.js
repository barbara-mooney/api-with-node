const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

//set up multer storage.
const storage = multer.diskStorage({
    //we pass a req, a file and a callback function.
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    }, 
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:|\./g,'') + ' - ' + file.originalname);
    }
});

//you can set up own filters to decide what files to filter. it's a function that receives a request, a file, 
//and a cb. 
const fileFilter = (req, file, cb) => {
    //you can reject/accept file by passing a false or true value.
    //when you post a file, mimetype is one of the properties you will see on the console.
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        //this function will accept it and store the file.
        cb(null, true);
    } else {
        //This function will ignore the file and not save it.
        cb(null, false);
    }
};

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const Product = require('../models/products');

router.get('/', (req, res, next) => {
    Product
        .find()
        //select the fields that we want to see in our results
        .select('name price _id productImage')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        product: doc.productImage,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })            
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });    
});

//we can pass as many handlers as we want, each will act as a middleware that will be executed before 
//our main handler  (that handles the request coming in)
//upload.single is one method of upload; single means that we will get one file only. 
//checkAuth middleware will verify that we do have access to this protected route; not every 
//user should be able to access this post route.  
router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price, 
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Object created successfully",
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET', 
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
    
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET', 
                        description: 'Get all products',
                        url: 'http://localhost:3000/products'
                    }
                });
            } else {
                res.status(404).json({message:"Invalid entry"})
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err})
        });
});

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product
        .update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })

    res.status(200).json({
        message: "Updated product", 
    });
});

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product
        .remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products',
                    bodyFormat: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

module.exports = router;