const authenticate = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else {
        return res.send("<h4>Not authenticated</ha>");
    }
}
export default authenticate;