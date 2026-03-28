import { body , validationResult } from "express-validator";


export function validate(err,req,res,next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const err = new Error(errors.array()[0].msg);
        err.status = 400;
        return next(err)
    }
    next();
}

export const jobValidator = [
    body("title")
        .notEmpty().withMessage("Job title is required"),

    body("company")
        .notEmpty().withMessage("Company name is required"),

    body("description")
        .notEmpty().withMessage("Job description is required"),

    body("skillsRequired")
        .isArray({ min: 1 }).withMessage("At least one skill is required"),

    body("experienceRequired")
        .isNumeric().withMessage("Experience must be a number"),

    validate
];