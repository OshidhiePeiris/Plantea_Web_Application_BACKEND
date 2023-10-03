import express from 'express';
import path from 'path';
import colors from 'colors';
// import dotenv from 'dotenv';
import "dotenv/config";
import morgan from 'morgan';
import session from 'express-session';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import cors from "cors";
import {googleAuth} from './config/googleauth.js';
import passport from 'passport';
import config from './config/index.js';
import MongoStore from "connect-mongo";
import authenticate from './middleware/googleauthMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import {routesInit} from "./routes/index.js"
// dotenv.config();
// connectDB();

//initializing express server
const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cors({origin: '*'}));

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave : false,
    saveUninitialized:false,
    store : MongoStore.create({mongoUrl:process.env.MONGO_URI}),
    cookie:{
      secure:false,
      expires:new Date(Date.now() + 10000),
      maxAge:10000
    }
  })
)
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);
app.get('/auth/google',passport.authenticate("google",{
  scope:["profile" , "email"]
}));
app.get('/auth/google/callback', passport.authenticate("google",{
  failureRedirect :"/login",
  successRedirect :"/api/products"
}),
(req,res)=>{
  console.log("User authenticated");
}
);
app.get('/test',authenticate,(req,res)=>{
  res.send("<h3>Authenticated</h3>");
})

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

if (process.env.NODE_ENV === 'production') {
  // app.use(express.static(path.join(__dirname, '/frontend/build')));
  app.get('/', (req, res) =>
    // res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
     res.send("<a href='http://localhost:5000/auth/google'>Login with google</a>")
  );
} else {
  //what to do when someone asks or target homepage or '/' route
  app.get('/', (req, res) => {
    res.send('API is running');
    // res.send("<a href='http://localhost:5000/auth/google'>Login with google</a>");
    // next();
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

//backend server will serve on this port
// app.listen(
//   PORT,
//   console.log(
//     `Server Running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
//   ),
//   connectDB(),
//   routesInit(app,passport),
//   googleAuth(passport)
// );
app.listen(
  PORT, ()=>{
    console.log(
      `Server Running in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
    );
    connectDB();
    googleAuth(passport);
  }
  
);


