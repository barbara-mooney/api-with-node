const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const ProductsController = require('../controllers/products');
const storage = multer.diskStorage({
    //we pass a req, a file and a callback function.
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    }, 
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:|\./g,'') + ' - ' + file.originalname);
    }
});

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


router.get('/', ProductsController.products_get_all);
 
router.post('/', checkAuth, upload.single('productImage'), ProductsController.products_create_product);

router.get('/:productId', ProductsController.products_get_product);

router.patch('/:productId', checkAuth, ProductsController.products_update_product);

router.delete('/:productId', checkAuth, ProductsController.products_delete_product);

module.exports = router;