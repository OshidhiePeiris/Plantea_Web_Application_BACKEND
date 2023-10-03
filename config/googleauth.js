
import GoogleStrategy from "passport-google-oauth20";
import config from "./index.js";
import GoogleUser from "../models/googleUserModel.js";

const googleAuth = (passport)=>{
    GoogleStrategy.Strategy;
    console.log(config);
    passport.use(
        new GoogleStrategy(
            {
                clientID : config.GOOGLE_CLIENT_ID,
                clientSecret : config.GOOGLE_CLIENT_SECRET,
                callbackURL : config.GOOGLE_REDIRECT_URL,
            }, 
            async(accessToken, refreshToken,profile,callback) =>{
       try {
                const guserObj = {
                    googleId: profile.id,
                    displayName :profile.displayName,
                    gmail : profile.emails[0].value,
                    image: profile.photos[0].value,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                }
                console.log(guserObj)
                let googleuser = await GoogleUser.findOne({
                    googleId:profile.id
                })
                console.log(googleuser)
                if (googleuser){
                    // console.log(guser)
                    return callback(null,googleuser);
                }else
                {
                    console.log("going")
                //     GoogleUser.create(guserObj).then((googleuser)=>{
                //     console.log("done")
                //     return callback(null,googleuser);
                // })
                
                // .catch((err)=>{
                //     return callback(err.message)
                // })
                googleuser = await GoogleUser.create(guserObj);
                return callback(null, googleuser);
            }
            }
            catch (err) {
                return callback(err); // Pass the error to the callback
              }}
        )
    );
    passport.serializeUser((user,callback)=>{
        callback(null,user.id);
    });
    passport.deserializeUser((id,callback)=>{
        GoogleUser.findById(id,(err,user)=>{
            callback(err,user);
        })
        // callback(null,id);
    })
}
export {googleAuth};