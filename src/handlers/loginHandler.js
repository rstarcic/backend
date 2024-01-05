import db from "../db/connection.js";
import bcrypt from 'bcrypt';

async function _comparePasswords(password, hashPassword) {
    return bcrypt.compareSync(password, hashPassword)
}

function _excludeProperties(obj, excludedProps) {
    const { [excludedProps]: _, ...result } = obj;
    return result;
}

async function checkCredentials(email, password) {
    const user = await db.collection("users").findOne({ email: email });
    if (!user) {
        return null;
    }
    const isPasswordMatch  = await _comparePasswords(password, user.password);
    if(isPasswordMatch ) {
        return _excludeProperties(user, 'password');
        }
        else {
            return null;
        }
}

export { checkCredentials };
