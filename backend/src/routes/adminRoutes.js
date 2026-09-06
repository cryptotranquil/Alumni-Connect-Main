const express = require("express");
const adminController = require("../controllers/adminController");
const jobController = require("../controllers/jobController");
const eventController = require("../controllers/eventController");
const departmentController = require("../controllers/departmentController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { createDepartmentValidation, validate } = require("../middleware/validation");

const router = express.Router();

router.use(authenticate, authorize("admin"));

// ========== USER MANAGEMENT ==========
router.delete("/users/:id", adminController.deleteUser);
router.post("/invite-admin", adminController.inviteAdmin);
router.put("/approve-alumni/:id", adminController.approveAlumni);
router.get("/users", adminController.getAllUsers); // NEW
router.get("/users/pending-alumni", adminController.getPendingAlumni); // NEW

// ========== DASHBOARD STATISTICS (for Recharts) ==========
router.get("/dashboard/stats", adminController.getDashboardStats); // NEW
router.get(
  "/dashboard/mentorship-analytics",
  adminController.getMentorshipAnalytics,
); // NEW

// ========== DEPARTMENT MANAGEMENT ==========
// NOTE: "/departments/all" and "/departments/stats" must stay registered
// before "/departments/:id" — Express matches routes in registration order.
router.get("/departments/all", departmentController.getAllDepartments);
router.get("/departments/stats", departmentController.getDepartmentStats);
router.post(
  "/departments",
  createDepartmentValidation,
  validate,
  departmentController.createDepartment,
);
router.put("/departments/:id", departmentController.updateDepartment);
router.delete("/departments/:id", departmentController.deleteDepartment);

// ========== JOB MODERATION ==========
router.put("/approve-job/:id", jobController.approveJob);

// ========== EVENT MANAGEMENT ==========
router.delete("/events/:id", eventController.deleteEvent);

module.exports = router;