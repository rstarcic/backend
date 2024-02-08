import db from "../db/connection.js";
import { ObjectId } from "mongodb";

async function createAJob(employerId, jobData) {
  try {
    console.log("Handler job data: ", jobData);
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(employerId) });
    if (!user) {
      throw new Error("User not found. Job creation failed.");
    } else {
      const jobInserted = await db.collection("jobs").insertOne({
        employerId: new ObjectId(employerId),
        ...jobData,
        createdAt: new Date(),
      });
      return {
        success: true,
        message: `${jobInserted.insertedId} created successfully`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Error during job creation",
      error: error.message,
    };
  }
}

async function getJobsByEmployerId(employerId) {
  try {
    const jobs = await db
      .collection("jobs")
      .find({ employerId: new ObjectId(employerId) })
      .toArray();
    return jobs;
  } catch (error) {
    throw new Error("Error during job data fetching: " + error.message);
  }
}

async function getJobDetailsData(id) {
  try {
    const jobDetails = await db
      .collection("jobs")
      .findOne({ _id: new ObjectId(id) });
    return jobDetails;
  } catch (error) {
    throw new Error("Error during job details fetching: " + error.message);
  }
}

async function updateJobDetailsData(id, dataToUpdate) {
  try {
    const updatedjobDetails = await db.collection("jobs").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: dataToUpdate.title,
          category: dataToUpdate.category,
          description: dataToUpdate.description,
          location: dataToUpdate.lcoation,
          payment: dataToUpdate.payment,
          jobType: dataToUpdate.jobType,
          location: dataToUpdate.location,
          paymentMethod: dataToUpdate.paymentMethod,
          duration: dataToUpdate.duration,
          qualifications: dataToUpdate.qualifications,
          equipmentNeeded: dataToUpdate.equipmentNeeded,
          contactInfo: dataToUpdate.contactInfo,
          applictionDeadline: dataToUpdate.applictionDeadline,
          workConditions: dataToUpdate.workConditions,
          createdAt: dataToUpdate.createdAt,
          updatedAt: new Date(),
        },
      }
    );
    return updatedjobDetails;
  } catch (error) {
    throw new Error("Error during job details update: " + error.message);
  }
}

async function deleteJob(id) {
  try {
    const jobDetails = await db
      .collection("jobs")
      .deleteOne({ _id: new ObjectId(id) });
    return jobDetails;
  } catch (error) {
    throw new Error("Error during job details fetching: " + error.message);
  }
}

async function getAllJobs(location) {
  try {
    let query = {};

    if (location) {
      query.location = location;
    }

    const jobs = await db.collection("jobs").find(query).toArray();
    return jobs;
  } catch (error) {
    throw new Error("Error during job fetching: " + error.message);
  }
}

async function addJobApplication(id, jobSeekerId) {
  try {
    const application = { jobSeekerId, applicationDate: new Date() };
    const updatedJob = await db
      .collection("jobs")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $push: { applicants: application } },
        { new: true }
      );
    console.log("Updated job", updatedJob);
    if (!updatedJob) {
      return {
        success: false,
        message: "Job application failed",
      };
    }
    return {
      success: true,
      message: "Job application successful",
      updatedJob,
    };
  } catch (error) {
    throw new Error("Failed to add job application: " + error.message);
  }
}

async function getJobsByJobSeekerId(jobSeekerId) {
  try {
   const jobs = await db.collection("jobs").find({
  "applicants": { "$elemMatch": { "jobSeekerId": jobSeekerId } }
}).toArray();
    if (!jobs) {
      console.log("oopsie", jobs)
    }
    else {
      console.log("cooool", jobs)
    }
    return jobs;
  } catch (error) {
    throw new Error("Error during job data fetching: " + error.message);
  }
}
export {
  createAJob,
  getJobsByEmployerId,
  getJobDetailsData,
  updateJobDetailsData,
  deleteJob,
  getAllJobs,
  addJobApplication,
  getJobsByJobSeekerId,
};
