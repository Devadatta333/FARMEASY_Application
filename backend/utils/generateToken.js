import jwt from "jsonwebtoken";

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || process.env.AuthSecret || "farmeasy_jwt_secret";
  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

export default generateToken;
