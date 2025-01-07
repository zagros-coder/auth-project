const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper function to create tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    {
      userInfo: {
        id: userId,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // 1 minute
  );

  const refreshToken = jwt.sign(
    {
      userInfo: {
        id: userId,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  const { last_name, first_name, password, email } = req.body;

  if (!first_name || !last_name || !password || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ email }).exec();
  if (foundUser) {
    return res.status(401).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    first_name,
    last_name,
    password: hashedPassword,
    email,
  });

  const { accessToken, refreshToken } = generateTokens(newUser._id);

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    accessToken,
    email: newUser.email,
    first_name: newUser.first_name,
    last_name: newUser.last_name,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const foundUser = await User.findOne({ email }).exec();
  if (!foundUser) {
    return res.status(401).json({ message: "User does not exist" });
  }

  const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
  if (!isPasswordMatch) {
    return res.status(401).json({ message: "Wrong password" });
  }

  const { accessToken, refreshToken } = generateTokens(foundUser._id);

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ accessToken, email: foundUser.email });
};

const refresh = async (req, res) => {
  console.log("Cookies:", req.cookies);

  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: false, // Set to true in production
      });
      return res.status(403).json({ message: "Forbidden" });
    }

    const foundUser = await User.findById(decoded.userInfo.id).exec();
    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: false, // Set to true in production
      });
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { accessToken } = generateTokens(foundUser._id);

    res.json({ accessToken });
  });
};

const logout = (req,res)=>{
    const cookies = req.cookies
    if(!cookies?.jwt) return res.status(203).json({message:"no content"});
    res.clearCookie("jwt",{
        httpOnly:true,
        sameSite:"None",
        secure:true
    });
    res.json({message:"loged out"})
}

module.exports = {
  register,
  login,
  refresh,
  logout
};
