const allowedOrigins = require("./allowedOrigins");
const coreOption = {
    origin:(origin,callback)=>{
        if(allowedOrigins.indexOf(origin) !==-1){
            callback(null,true)
        }else{
            callback(new Error("not allowed by cors"))
        }
    },
    credentials : true,
    optionSuccessStatus:200
};
module.exports = coreOption;