import express from "express";

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", router);

// Home page
router.route('/').get((req, res) => {
    res.send('Welcome to the Jobify home page!');
});

// About page
router.route('/about').get((req, res) => {
    res.send('Learn more about Jobify on our About page');
});

// Login and registration
router.route("/auth/login").post((req, res) => {
  res.send("User login");
});
router.route("/auth/signup").post((req, res) => {
  res.send("User registration");
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
  .get((req, res) => {
    res.send("Employer profile retrieval");
  })
  .put((req, res) => {
    res.send("Employer profile update");
  });

router
  .route("/job-seeker/profile")
  .get((req, res) => {
    res.send("Job seeker profile retrieval");
  })
  .put((req, res) => {
    res.send("Job seeker profile update");
  });

// Payment
router.route("/payment").post((req, res) => {
  res.send("Processing payment.");
});

app.listen(port, () => {
  console.log(`Service running on http://localhost:${port}`);
});
