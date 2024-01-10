import db from "../db/connection.js";
import bcrypt from "bcrypt";

async function _hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

function _excludeProperties(obj, excludedProps) {
    const { [excludedProps]: _, ...result } = obj;
    return result;
}

async function registerUser(userData) {
    try {
        userData.password = await _hashPassword(userData.password);
        const createdUser = await db.collection("users").insertOne(userData);
        if (createdUser.insertedId) {
            const user = await db.collection("users").findOne({ _id: createdUser.insertedId })
            return _excludeProperties(user, "password" )
        }
        else {
            throw new Error("User not created.")
       }
    } catch (error) {
        throw new Error("Error in user registration: " + error.message);
    }
}

export { registerUser };