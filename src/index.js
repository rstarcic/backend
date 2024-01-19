import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { registerUser } from "./handlers/registrationHandler.js";
import { checkCredentials } from "./handlers/loginHandler.js";
import { updateUserProfile } from "./handlers/profileHandler.js";
import { authenticateToken } from "./middlewares/authMiddleware.js";
import { checkRole } from "./middlewares/userAccessMiddleware.js";
const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;
const secret_token = process.env.JWT_SECRET_KEY;

app.use(cors({ exposedHeaders: ['authorization'] }))
app.use(express.json());
app.use("/api", router);
app.use(authenticateToken);
app.use(checkRole);

// Home page
router.route("/").get((req, res) => {
  res.send("Welcome to the Jobify home page!");
});

// About page
router.route("/about").get((req, res) => {
  res.send("Learn more about Jobify on our About page");
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
      const token = jwt.sign({ userId: loggedInUser._id, role: loggedInUser.role }, secret_token, {
        expiresIn: "1h",
      });
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
      const token = jwt.sign({ userId: employer._id, role: employer.role }, secret_token, {
        expiresIn: "1h",
      });
      res.setHeader("authorization", `Bearer ${token}`);
      res
        .status(201)
        .json({ message: "Employer registered successfully", token, user: employer });
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
      const token = jwt.sign({ userId: jobSeeker._id, role: jobSeeker.role }, secret_token, {
        expiresIn: "1h",
      });
      res.setHeader("authorization", `Bearer ${token}`);
      res
        .status(201)
        .json({ message: "Employer registered successfully", token, user: jobSeeker });
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
  .get((req, res) => {
    res.send("List of jobs");
  })
  .post((req, res) => {
    res.send("Create new job");
  });

router
  .route("/employer/jobs/:id")
  .get((req, res) => {
    res.send(`Job details with ID: ${req.params.id}`);
  })
  .put((req, res) => {
    res.send(`Update job with ID: ${req.params.id}`);
  })
  .delete((req, res) => {
    res.send(`Delete job with ID: ${req.params.id}`);
  });

router.route("/employer/jobs/:id/contract").post((req, res) => {
  res.send(`Generate contract for job with ID: ${req.params.id}`);
});

router.route("/employer/jobs/:id/contract/send").post((req, res) => {
  res.send(`Send contract notification for job with ID: ${req.params.id}`);
});

// Job seeker
router.route("/job-seeker").get((req, res) => {
  res.send("Job seeker page");
});

router.route("/job-seeker/jobs").get((req, res) => {
  res.send("List of jobs");
});

router.route("/job-seeker/jobs/:id").get((req, res) => {
  res.send(`Job details with ID: ${req.params.id}`);
});

router.route("/job-seeker/jobs/:id/apply").put((req, res) => {
  res.send(`Apply for job with ID: ${req.params.id}`);
});

router.route("/job-seeker/applied").get((req, res) => {
  res.send("List of jobs the job seeker has applied for");
});

// Profiles
router
  .route("/employer/profile")
  .get(authenticateToken, checkRole("employer"), (req, res) => {
    res.send("Employer profile retrieval");
  })
  .put(authenticateToken, checkRole("employer"), (req, res) => {
    res.send("Employer profile update");
  });

router
  .route("/job-seeker/profile")
  .get(authenticateToken, checkRole("job seeker"), (req, res) => {
    res.send("Job seeker profile retrieval");
  })
  .post(authenticateToken, checkRole("job seeker"), async (req, res) => {
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
      }
      else {
        res
        .status(400)
        .json({ message: "Job seeker update failed" });
      }
    } catch (error) {
      res.status(500).send("Error updating job seeker profile" + error.message);
    }
  
  });

// Payment
router.route("/payment").post((req, res) => {
  res.send("Processing payment.");
});

app.listen(port, () => {
  console.log(`Service running on http://localhost:${port}`);
});
