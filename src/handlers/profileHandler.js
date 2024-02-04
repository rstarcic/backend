import db from "../db/connection.js";
import { ObjectId } from "mongodb";
async function updateUserProfile(userData) {
  const updatedId = new ObjectId(userData._id);
  const { _id, ...updateData } = userData;
  const userProfile = await db
    .collection("users")
    .findOneAndUpdate({ _id: updatedId }, { $set: updateData }, { new: true });
  console.log("Backend user profile: ", userProfile);
  console.log("userId, userData: ", updatedId, updateData);
  return userProfile;
}

async function updateOrCreateNestedDocuments(
  userId,
  documentData,
  documentName
) {
  try {
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error("User not found");
    }
    const dataToAdd = Array.isArray(documentData)
      ? documentData
          : [documentData];
      
    const documentExists = user[documentName];
    if (!documentExists) {
      user[documentName] = dataToAdd;
      console.log("user[documentName]: ", user[documentName]);
    } else {
      user[documentName].push(...dataToAdd);
      console.log("user[documentName] pushed: ", user[documentName]);
    }
    console.log("DOcument name: ", documentName);
    console.log("DOcument VALUE: ", user[documentName]);
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { [documentName]: user[documentName] } }
      );
    console.log(`${documentName} created/updated successfully`);
    return {
      success: true,
      message: `${documentName} created/updated successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Greška prilikom ažuriranja subkolekcije ${documentName}`,
      error: error.message,
    };
  }
}

export { updateUserProfile, updateOrCreateNestedDocuments };
