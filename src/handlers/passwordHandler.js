import db from "../db/connection.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

async function _comparePasswords(password, hashPassword) {
  return bcrypt.compareSync(password, hashPassword);
}

async function _hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function checkCurrentAndupdateNewPassword(
  id,
  currentPassword,
  newPassword
) {
  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });
    if (!user) {
      throw new Error("User not found. Password update failed.");
    }
    const matchedPasswords = _comparePasswords(currentPassword, user.password);
    if (matchedPasswords) {
      newPassword = await _hashPassword(newPassword);
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { password: newPassword } }
        );
      return true;
    }
    throw new Error("Incorrect current password. Password update failed.");
  } catch (error) {
    throw new Error("Error while updating password: " + error.message);
  }
}

export { checkCurrentAndupdateNewPassword };
