const express = require('express');
const { Product } = require('../models/product')
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');     // use for we can handle request like we can use .then function...
const multer = require('multer')

const FILE_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type')
        if(isValid){
            uploadError=null    
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        //   const fileName = file.originalname.replace(' ','-')
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res) => {           //    ****************video number 14 inside folder 4
    // for filtering catogory....
    // localhost:300/api/v1/products?categories=234676,23453
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }



    // for filtering catogory....   6119474b78c8350fa41a8ec8   ,  6121324e6ef1c800f0252608
    // fromat for URL http://localhost:3000/api/v1/products?categories=6121324e6ef1c800f0252608,6119474b78c8350fa41a8ec8

    // we can use both method ([])  or  (space in bettween name)  
    //  const productList = await Product.find().select(['name','image']);    // if we need to find only name of give table then we use .select(what you want)
    //   const productList = await Product.find().select('image name');    //for finding spacific data from collection
    // const productList = await Product.find().select('image name -_id');    if we want to remove _id then put -_id

    const productList = await Product.find(filter).populate('category');
    if (!productList) {
        res.status(500).json({ success: false })
    }
    res.send(productList);
})

router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({ success: false })
    }
    await res.send(product);
})


router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')
    const file = req.file;
    if(!file) return res.status(400).send('No image in the request')
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: `${basePath}${fileName}`,  // http://localhost:3000/public/uploads/image-2323232
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })
    console.log('product-->',product)
    product1 = await product.save();   // i have wirte product1 vaiable name becaouse becouse its conflic with product

    if (!product1) {
        return res.status(500).send("The product cannot be created");
    }
    else {
        res.send(product1);
    }

})

router.put('/:id',uploadOptions.single('image'),async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product ID')
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')

    const product = await Product.findById(req.params.id);
    if(!product) return res.status(400).send('Invalid Product');

    const file = req.file;
    let imagepath;

    if(file){
        const fileName = file.fieldname;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads`
        imagepath = `${basePath}${fileName}`
    }else{
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true },
    )
    if (!updatedProduct) {
        res.status(500).json({ message: 'The product with the given ID was not found' })
    }
    res.status(200).send(updatedProduct);
})


router.delete(`/:id`, (req, res) => {
    Product.findByIdAndDelete(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: 'product deleted Successfully..' })
        }
        else {
            return res.status(404).json({ success: false, message: 'product not found...' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

//   count the proctuct
router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count)

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount
    });
})

// Finding featured produdct from featured collections

router.get(`/get/featured`, async (req, res) => {
    const products = await Product.find({ isFeatured: true })
    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send(products);
})

// Finding same limited product (for eg. 100 of featured  product we need only 3 freatured product so we can use this.. )

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({ isFeatured: true }).limit(+count);  // + plus sign is use for making string to number. 
    if (!products) {
        res.status(500).json({ success: false })
    }
    res.send(products);
})

router.put(`/gallery-images/:id`, uploadOptions.array('images',10), async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid product Id')
    }
    const files = req.files;
    let imagePaths = []
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    if(files){
        files.map(file=>{
            imagePaths.push(`${basePath}${file.filename}`)
        })
    }
    const product = await Product.findByIdAndUpdate(
        req.params.id,{
            images:imagePaths
        },
        {new:true}
    )

    if(!product)return res.status(500).send('the product cannot be updated!!');
    res.send(product)
})

module.exports = router;