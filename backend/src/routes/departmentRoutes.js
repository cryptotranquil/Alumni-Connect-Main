const express = require("express");
const departmentController = require("../controllers/departmentController");

const router = express.Router();

// Public — no auth. This is what the registration form's dropdown calls.
router.get("/", departmentController.getPublicDepartments);

module.exports = router;