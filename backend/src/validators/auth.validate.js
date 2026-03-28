import {body,validationResult} from 'express-validator'

const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export function validate(err,req,res,next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const err = new Error(errors.array()[0].msg);
        err.status = 400;
        return next(err)
    }
    next();
}


export const registerValidator = [
    body("username")
        .notEmpty().withMessage("Username is required")
        .isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email")
        .matches(emailRegex)
        .withMessage("Enter Valid email"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
        .matches(passwordRegex)
        .withMessage("Password must be 6 chars, include uppercase, lowercase, number & special character"),

    body("role")
        .optional()
        .isIn(["candidate", "recruiter"])
        .withMessage("Role must be candidate or recruiter"),
    
    validate
];


export const loginValidation = [

    body("email")
        .optional()
        .trim()
        .matches(emailRegex)
        .withMessage("Invalid Email Format"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    validate
];
