import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { registerUser } from "./handlers/registrationHandler.js";
import { checkCredentials } from "./handlers/loginHandler.js";
import {
  updateUserProfile,
  updateOrCreateNestedDocuments,
} from "./handlers/profileHandler.js";
import { checkCurrentAndupdateNewPassword } from "./handlers/passwordHandler.js";
import {
  createAJob,
  getJobsByEmployerId,
  getJobDetailsData,
  getJobDetailsWithApplicantsData,
  updateJobDetailsData,
  deleteJob,
  getAllJobs,
  addJobApplication,
  getJobsByJobSeekerId
} from "./handlers/jobHandler.js";
import { authenticateToken } from "./middlewares/authMiddleware.js";
import { checkRole } from "./middlewares/userAccessMiddleware.js";
const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;
const secret_token = process.env.JWT_SECRET_KEY;

app.use(cors({ exposedHeaders: ["authorization"] }));
app.use(express.json());
app.use("/api", router);
app.use(authenticateToken);
app.use(checkRole);

// Home page
router.route("/").get((req, res) => {
  res.send("Welcome to the Jobify home page!");
});


// Login
router.route("/auth/login").post(async (req, res) => {
  try {
    const userLoginData = req.body;
    const loggedInUser = await checkCredentials(
      userLoginData.email,
      userLoginData.password
    );
    if (loggedInUser) {
      const token = jwt.sign(
        { userId: loggedInUser._id, role: loggedInUser.role },
        secret_token,
        {
          expiresIn: "1h",
        }
      );
      res.setHeader("authorization", `Bearer ${token}`);
      res
        .status(200)
        .json({ message: "Successfully logged in", token, user: loggedInUser });
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Registration
router.route("/auth/signup/employer").post(async (req, res) => {
  try {
    const userData = req.body;
    userData.role = "employer";
    const employer = await registerUser(userData);
    if (employer) {
      const token = jwt.sign(
        { userId: employer._id, role: employer.role },
        secret_token,
        {
          expiresIn: "1h",
        }
      );
      res.setHeader("authorization", `Bearer ${token}`);
      res.status(201).json({
        message: "Employer registered successfully",
        token,
        user: employer,
      });
    }
    res.status(400).json({ message: "Employer registration failed", user });
  } catch (error) {
    res.status(500).send("Error registering employer " + error.message);
  }
});

router.route("/auth/signup/job-seeker").post(async (req, res) => {
  try {
    const userData = req.body;
    userData.role = "job seeker";
    const jobSeeker = await registerUser(userData);
    if (jobSeeker) {
      const token = jwt.sign(
        { userId: jobSeeker._id, role: jobSeeker.role },
        secret_token,
        {
          expiresIn: "1h",
        }
      );
      res.setHeader("authorization", `Bearer ${token}`);
      res.status(201).json({
        message: "Employer registered successfully",
        token,
        user: jobSeeker,
      });
    }
    res.status(400).json({ message: "Job seeker registration failed", user });
  } catch (error) {
    res.status(500).send("Error registering job seeker" + error.message);
  }
});

// Employer
router.route("/employer").get((req, res) => {
  res.send("Employer page");
});

router
  .route("/employer/jobs")
  .get(authenticateToken, checkRole("employer"), async (req, res) => {
    try {
      const employerId = req.query.employerId;
      const jobList = await getJobsByEmployerId(employerId);

      if (!jobList) {
        return res
          .status(404)
          .json({ error: "No jobs found for this employer" });
      } else {
        return res.status(200).json(jobList);
      }
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });
router
  .route("/employer/jobs/create")
  .post(authenticateToken, checkRole("employer"), async (req, res) => {
    try {
      const { employerId, ...jobData } = req.body;
      const jobCreated = await createAJob(employerId, jobData);
      if (jobCreated.success) {
        return res.status(201).json({
          success: true,
          message: jobCreated.message,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: jobCreated.message,
        });
      }
    } catch (error) {
      console.error("Error while creating job:", error.message);
      res.status(500).json({
        success: false,
        message: "Internal server error. Job creation failed.",
      });
    }
  });

router
  .route("/employer/jobs/:id")
  .get(authenticateToken, checkRole("employer"), async (req, res) => {
    try {
      const id = req.params.id;
      const jobDetails = await getJobDetailsWithApplicantsData(id);
      console.log(jobDetails)
      if (!jobDetails) {
        return res
          .status(404)
          .json({ error: "No job details found for this job ID." });
      } else {
        return res.status(200).json({ success: true, jobDetails });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  })
  .put(authenticateToken, checkRole("employer"), async (req, res) => {
    try {
      const id = req.params.id;
      const dataToUpdate = req.body;
      const updatedJobDetails = await updateJobDetailsData(id, dataToUpdate);
      if (!updatedJobDetails) {
        return res
          .status(404)
          .json({ error: "No job details found for this job ID." });
      } else {
        return res.status(200).json({ success: true, updatedJobDetails });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const id = req.params.id;
      const jobDeleted = await deleteJob(id);
      if (!jobDeleted) {
        return res
          .status(404)
          .json({ error: "No job details found for this job ID." });
      } else {
        return res
          .status(200)
          .json({ success: true, message: "Job successfully deleted" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  });

router.route("/employer/jobs/:id/contract").post((req, res) => {
  res.send(`Generate contract for job with ID: ${req.params.id}`);
});

router.route("/employer/jobs/:id/contract/send").post((req, res) => {
  res.send(`Send contract notification for job with ID: ${req.params.id}`);
});

// Job seeker
router
  .route("/job-seeker")
  .get(authenticateToken, checkRole("job seeker"), (req, res) => {
    res.send("Job seeker page");
  });

router
  .route("/job-seeker/jobs")
  .get(authenticateToken, checkRole("job seeker"), async (req, res) => {
    try {
      const { category, location } = req.query;
      const allJobs = await getAllJobs(category, location);

      if (allJobs.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "No jobs found for this job seeker" });
      } else {
        return res.status(200).json({ success: true, allJobs });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  });

  
router.route("/job-seeker/jobs/applied").get( async (req, res) => {
  try {
    const jobSeekerId = req.query.jobSeekerId;
    const jobList = await getJobsByJobSeekerId(jobSeekerId);
    if (!jobList) {
      return res
        .status(404)
        .json({ error: "No jobs found for this job seeeker" });
    } else {
      return res.status(200).json(jobList);
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router
  .route("/job-seeker/jobs/:id")
  .get(authenticateToken, checkRole("job seeker"), async (req, res) => {
    try {
      const id = req.params.id;
      const jobDetails = await getJobDetailsData(id);
      if (!jobDetails) {
        return res
          .status(404)
          .json({ error: "No job details found for this job ID." });
      } else {
        return res.status(200).json({ success: true, jobDetails });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  })
  .patch(authenticateToken, checkRole("job seeker"), async (req, res) => {
    try {
      const id = req.params.id;
      const jobSeekerId = req.body.jobSeekerId;
      console.log("Id backend: ", id);
      console.log("Job seekerId backend: ", jobSeekerId);
      const jobSeekerApplied = await addJobApplication(id, jobSeekerId);
      if (jobSeekerApplied.success) {
        return res.status(201).json({
          success: true,
          message: "Job application successful",
          updatedJob: jobSeekerApplied.updatedJob,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Job application failed",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to process job application: " + error.message,
      });
    }
  });

// Profiles
router
  .route("/employer/profile")
  .get(authenticateToken, checkRole("employer"), (req, res) => {
    res.send("Employer profile retrieval");
  })
  .patch(authenticateToken, checkRole("employer"), async (req, res) => {
    try {
      console.log("Request body:", req.body);
      const userData = req.body;

      console.log("Updating profile for userId:", userData._id);
      console.log("Data for update:", userData);
      const profileUpdated = await updateUserProfile(userData);
      if (profileUpdated) {
        res
          .status(202)
          .json({ message: "Job seeker profile successfully updated" });
      } else {
        res.status(400).json({ message: "Job seeker update failed" });
      }
    } catch (error) {
      res.status(500).send("Error updating job seeker profile" + error.message);
    }
  });

router
  .route("/employer/profile/settings")
  .put(authenticateToken, checkRole("employer"), async (req, res) => {
    try {
      const { id, currentPassword, newPassword } = req.body;
      const userPasswordUpdated = await checkCurrentAndupdateNewPassword(
        id,
        currentPassword,
        newPassword
      );
      if (userPasswordUpdated) {
        console.log("Password successfully updated.");
        res
          .status(200)
          .json({ success: true, message: "Password updated successfully." });
      } else {
        console.log(
          "Failed to update password. Current password is incorrect."
        );
        res.status(400).json({
          success: false,
          message: "Failed to update password. Current password is incorrect.",
        });
      }
    } catch (error) {
      console.error("Error while updating password:", error.message);
      res.status(500).json({
        success: false,
        message: "Internal server error. Password update failed.",
      });
    }
  });

router
  .route("/job-seeker/profile")
  .get(authenticateToken, checkRole("job seeker"), (req, res) => {
    res.send("Job seeker profile retrieval");
  })
  .patch(authenticateToken, checkRole("job seeker"), async (req, res) => {
    try {
      console.log("Request body:", req.body);
      const userData = req.body;

      console.log("Updating profile for userId:", userData._id);
      console.log("Data for update:", userData);
      const profileUpdated = await updateUserProfile(userData);
      if (profileUpdated) {
        res
          .status(202)
          .json({ message: "Job seeker profile successfully updated" });
      } else {
        res.status(400).json({ message: "Job seeker update failed" });
      }
    } catch (error) {
      res.status(500).send("Error updating job seeker profile" + error.message);
    }
  });

router
  .route("/job-seeker/profile/edit")
  .post(authenticateToken, checkRole("job seeker"), async (req, res) => {
    try {
      const {
        _id,
        aboutMe,
        education,
        workExperience,
        languages,
        hobbiesAndInterests,
        skills,
      } = req.body;
      console.log("Body:", req.body);
      const updatedAboutMeResult = await updateOrCreateNestedDocuments(
        _id,
        aboutMe,
        "Biography"
      );
      const updatedEducationResult = await updateOrCreateNestedDocuments(
        _id,
        education,
        "Education"
      );
      const updatedWorkExperienceResult = await updateOrCreateNestedDocuments(
        _id,
        workExperience,
        "WorkExperience"
      );
      const updatedLanguagesResult = await updateOrCreateNestedDocuments(
        _id,
        languages,
        "Languages"
      );
      const updatedhobbiesAndInterestsResult =
        await updateOrCreateNestedDocuments(
          _id,
          hobbiesAndInterests,
          "HobbiesAndInterests"
        );
      const updatedSkillsResult = await updateOrCreateNestedDocuments(
        _id,
        skills,
        "Skills"
      );
      if (
        updatedAboutMeResult &&
        updatedEducationResult &&
        updatedWorkExperienceResult &&
        updatedLanguagesResult &&
        updatedhobbiesAndInterestsResult &&
        updatedSkillsResult
      ) {
        res.status(200).json({
          success: true,
          message: "All data successfully updated or created",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Some data could not be updated or created",
        });
      }
    } catch (error) {
      res.status(500).send("Error updating job seeker profile" + error.message);
    }
  });

router
  .route("/job-seeker/profile/settings")
  .put(authenticateToken, checkRole("job seeker"), async (req, res) => {
    try {
      const { id, currentPassword, newPassword } = req.body;
      const userPasswordUpdated = await checkCurrentAndupdateNewPassword(
        id,
        currentPassword,
        newPassword
      );
      if (userPasswordUpdated) {
        console.log("Password successfully updated.");
        res
          .status(200)
          .json({ success: true, message: "Password updated successfully." });
      } else {
        console.log(
          "Failed to update password. Current password is incorrect."
        );
        res.status(400).json({
          success: false,
          message: "Failed to update password. Current password is incorrect.",
        });
      }
    } catch (error) {
      console.error("Error while updating password:", error.message);
      res.status(500).json({
        success: false,
        message: "Internal server error. Password update failed.",
      });
    }
  });
// Payment
router.route("/payment").post((req, res) => {
  res.send("Processing payment.");
});

app.listen(port, () => {
  console.log(`Service running on http://localhost:${port}`);
});
