function logger(req,res,next){
    const logData={
        time: new Date().toISOString(),
        method: req.method,
        url: req.url,
        ip: req.ip,

    };
    console.log(logData);

    next();

}

module.exports=logger;