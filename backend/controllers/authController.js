import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
export const register = async (req,res)=>{
    const {name,email,password,role} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password,10);
        const result = await query(
            'INSERT INTO Users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role]
        );
        res.status(201).json({message: 'User registered successfully', user: result.rows[0]});
    } catch (error) {
        res.status(500).json({error: 'Registration failed', details: error.message});
    }
}