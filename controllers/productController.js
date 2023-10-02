import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

//@desc  Fetch All Products
//@route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

//@desc  Fetch Single Product
//@route GET /api/products/:id
// @access Public

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product Not Found!' });
  }
});

//@desc  Delete Single Product
//@route Delete /api/products/:id
// @access Private,Admin

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.remove();
    res.json({ message: 'Product Removed Successfully.' });
  } else {
    res.status(404).json({ message: 'Product Not Found!' });
  }
});

//@desc  Create a Product
//@route POST /api/products
// @access Private,Admin

const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: "Product's Name",
    price: 0,
    user: req.user._id,
    image: '/images/sample.jpg',
    brand: "Product's Brand",
    category: "Product's Category",
    countInStock: 0,
    numReviews: 0,
    description: "Product's Description",
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

//@desc  Update a Product
//@route PUT /api/products/:id
// @access Private,Admin

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, image, brand, category, countInStock, description } =
    req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;
    product.description = description;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product Not Found!');
  }
});
// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

//DELETE A REVIEW
const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  console.log(req.params.id)
  if( product) {
    const reviewid=  req.params.reviewid
    console.log(req.params.reviewid)
 

   
  product.reviews.map(data=>{
    
    if(data._id==reviewid){
      console.log(data._id);
       product.reviews.DELETE(data._id);
  
      res.json({ message: 'Review Removed Successfully.' });

    } else {
          res.status(404).json({ message: 'Review Not Found!' });
        }
  })
  }
  // const productid = req.params.id
  // const reviewid = req.params.reviewid
  // Product.updateOne({
  //   _id:productid

  // },{$pull:{reviews:{$eq:reviewid}}}).then(()=>{
  //   res.json({message:'Review deleted'})
  // })
});


// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);

  res.json(products);
});

const getStockCount = asyncHandler(async (req,res)=>{
  await Product.aggregate([
    {
      $group :{
        _id:'',
        
        total : {$sum :'$countInStock'}
      }
    
    }
  ]).then((prods)=>{
    res.status(200).send(prods)
  }).catch((err)=>{
    console.log(err)
  })

})

const getproductCount =  asyncHandler(async (req,res)=>{
 

  await Product.aggregate([
    {
      $group :{
        _id:'',
        
        total : {$sum :1}
      }
    
    }
  ]).then((prods)=>{
    res.status(200).send(prods)
  }).catch((err)=>{
    console.log(err)
  })

})

const getTotalExpenses = asyncHandler(async(req,res)=>{
  await Product.aggregate([
    {
      $project:{
        _id:{id:'$_id',name:'$name'},
        total:{$multiply:['$price', '$countInStock']}
      }
    }
  ]).then((products)=>{
    res.status(200).send(products)
  }).catch((err)=>{
    console.log(err)
  })
})

const getTotal = asyncHandler(async(req,res)=>{
  await Product.aggregate([
    {
      $group:{
        _id:'',
        total:{$sum:{$multiply:['$price', '$countInStock']}}
      }
    }
  ]).then((prods)=>{
    res.status(200).send(prods)
  }).catch((err)=>{
    console.log(err)
  })
})








export {
 
  getProductById,
  getTopProducts,
  createProductReview,
  deleteReview,
  getProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  getStockCount,
  getproductCount,
  getTotalExpenses,
  getTotal,
};
