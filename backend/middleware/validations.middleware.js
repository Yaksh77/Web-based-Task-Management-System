import { body } from "express-validator";

export const registerUserValidation = () => {
  return [
    body("name").notEmpty().withMessage("Name should not be empty"),
    body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/\d/)
      .withMessage("Password must contain a number")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain an uppercase letter")
      .matches(/[^\w\s]/)
      .withMessage("Password must contain a special character"),
  ];
};

export const loginUserValidation = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email should not be empty")
      .isEmail()
      .withMessage("Enter a valid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password should not be empty"),
  ];
};

export const createAndUpdateProjectValidation = () => {
  return [
    body("title").notEmpty().withMessage("Name should not be empty"),
    body("description")
      .notEmpty()
      .withMessage("Description should not be empty"),
  ];
};

export const addTaskValidation = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Name should not be empty")
      .isString()
      .withMessage("Title should be a string"),
    body("description")
      .notEmpty()
      .withMessage("Description should not be empty")
      .isString()
      .withMessage("Description should be a string"),
    body("priority")
      .notEmpty()
      .withMessage("Priority should not be empty")
      .isString()
      .withMessage("Priority should be a string"),
    body("dueDate")
      .notEmpty()
      .withMessage("Due Date should not be empty")
      .isDate()
      .withMessage("Enter a valid date"),
    body("createdBy").notEmpty().withMessage("Creator ID should not be empty"),
  ];
};

export const updateTaskValidation = () => {
  return [
    body("title").optional().isString().withMessage("Title should be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description should be a string"),
    body("priority")
      .optional()
      .isString()
      .withMessage("Priority should be a string"),
    body("dueDate").optional().isDate().withMessage("Enter a valid date"),
    body("assignedUserId")
      .optional()
      .isString()
      .withMessage("Assigned User ID should be a string"),
    body("projectId")
      .optional()
      .isString()
      .withMessage("Project ID should be a string"),
  ];
};
