import { db } from "../config/db.js";
import { users } from "../models/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responseHandler.js";

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;
  try {
    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (userExists.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    return sendSuccessResponse(
      res,
      201,
      "User registered successfully",
      newUser[0]
    );
  } catch (error) {
    return sendErrorResponse(
      res,
      500,
      "User registration failed",
      error.message
    );
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, "Validation Error", errors.array());
  }

  const { email, password } = req.body;
  try {
    const userFound = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userFound.length === 0)
      return sendErrorResponse(res, 404, "User not found"); 

    const isMatch = await bcrypt.compare(password, userFound[0].password);
    if (!isMatch)
      return sendErrorResponse(res, 400, "Invalid credentials"); 

    const token = jwt.sign(
      { id: userFound[0].id, role: userFound[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return sendSuccessResponse(res, 200, "Login successful", {
      token,
      id: userFound[0].id,
      name: userFound[0].name,
      role: userFound[0].role,
    });
  } catch (error) {
    return sendErrorResponse(res, 500, "Login failed", error.message);
  }
};