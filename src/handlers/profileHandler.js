import db from '../db/connection.js';
import { ObjectId } from 'mongodb';
async function updateUserProfile(userData) {
    const updatedId = new ObjectId(userData._id);
    const { _id, ...updateData } = userData;
    const userProfile = await db.collection("users").findOneAndUpdate(
        { _id: updatedId }, { $set: updateData },  { new: true })
    console.log("Backend user profile: ", userProfile);
    console.log("userId, userData: ", updatedId, updateData );
    return userProfile;
}

export {updateUserProfile}