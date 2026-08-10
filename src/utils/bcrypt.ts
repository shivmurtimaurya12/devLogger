import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
const SECRET_PASSWORD = (process.env.SECRET_PASSWORD as string) || 8;
export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, SECRET_PASSWORD);
};

export const comparePassword = (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
