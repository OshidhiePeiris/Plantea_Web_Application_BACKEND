import passport from "passport"
const routesInit =(app) =>{
    app.get('/auth/google',passport.authenticate("google",{
        scope:["profile" , "email"]
    }));
    app.get("/auth/google/callback", passport.authenticate("google",{
        failureRedirect :"/login"
    }),
    (req,res)=>{
        console.log("User authenticated");
    }
    );
};
export {routesInit}

import express from 'express';

