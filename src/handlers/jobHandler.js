import db from "../db/connection.js";
import { ObjectId } from "mongodb";

async function createAJob(employerId, jobData) {
    try {
        console.log("Handler job data: ", jobData);
        const user = await db.collection("users").findOne({ _id: new ObjectId(employerId) });
        if (!user) {
            throw new Error("User not found. Job creation failed.");
          }
        else {
            const jobInserted = await db.collection("jobs").insertOne({ employerId: new ObjectId(employerId), ...jobData, createdAt: new Date() })
            return {
                success: true,
                message: `${jobInserted.insertedId} created successfully`,
              };
        }
    }
    catch (error) {return {
        success: false,
        message: "Error during job creation",
        error: error.message,
    };
    }
}

export { createAJob }
