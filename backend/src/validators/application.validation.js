import { body,validationResult } from "express-validator";


export function validate(err,req,res,next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const err = new Error(errors.array()[0].msg);
        err.status = 400;
        return next(err)
    }
    next();
}

export const applyValidator = [
    body("jobId")
        .notEmpty().withMessage("Job ID is required"),

    body("resumeUrl")
        .notEmpty().withMessage("Resume URL is required"),
    
    validate,
];