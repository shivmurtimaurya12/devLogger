import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
const SECRET_PASSWORD = (process.env.SECRET_PASSWORD as string) || 11;
export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, parseInt(SECRET_PASSWORD as string));
};

export const comparePassword = (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
