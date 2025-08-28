import bcrypt from "bcryptjs";
import User from "../models/user.js";

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      isMfaActive: false,
    });

    await newUser.save();

    res.status(201).json({ 
      message: "User registered successfully", 
      user: { id: newUser._id, username: newUser.username }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Error registering user", message: error.message });
  }
};


export const login = async (req, res) => {
   console.log("The authenticate user is : ", req.user);
   res.status(200).json({
    message: "User logged in successfully",
    isMfaActive: req.user.isMfaActive,
   });
};


export const authStatus = async (req, res) => {
  if(req.user){
    res.status(200).json({
      message: "User logged in successfully",
      username: req.user.username,
      isMfaActive: req.user.isMfaActive,
    });
  }else{
    res.status(401).json({ message: "Unauthorized user"});
  }
};
export const logout = async (req, res) => {
  if(!req.user) res.status(401).json({ message: "Unauthorized user"});
  req.logout((err) => {
    if (err) res.status(400).json({ message: "User not logged in"});
    res.status(200).json({message: "Logout is successful"});
  });
};
export const setup2FA = async (req, res) => {};
export const verify2FA = async (req, res) => {};
export const reset2FA = async (req, res) => {};
