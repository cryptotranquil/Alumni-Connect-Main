const departmentService = require("../services/departmentService");
const adminService = require("../services/adminService");

// GET /api/departments — public, no auth. Powers the registration dropdown.
exports.getPublicDepartments = async (req, res) => {
  const departments = await departmentService.listActive();
  res.json({ success: true, departments });
};

// GET /api/admin/departments/all — admin only, includes inactive departments.
exports.getAllDepartments = async (req, res) => {
  const departments = await departmentService.listAll();
  res.json({ success: true, departments });
};

// POST /api/admin/departments
exports.createDepartment = async (req, res) => {
  const { name, code, description } = req.body;

  const existing = await departmentService.findByName(name);
  if (existing) {
    return res.status(400).json({
      success: false,
      message: `A department named "${name.trim()}" already exists.`,
    });
  }

  const department = await departmentService.create({ name, code, description });
  res.status(201).json({ success: true, department });
};

// PUT /api/admin/departments/:id
exports.updateDepartment = async (req, res) => {
  const existing = await departmentService.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Department not found" });
  }

  const { name, code, description, isActive } = req.body;

  if (name !== undefined && name.trim().toLowerCase() !== existing.name.toLowerCase()) {
    const duplicate = await departmentService.findByName(name);
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `A department named "${name.trim()}" already exists.`,
      });
    }
  }

  const patch = {};
  if (name !== undefined) patch.name = name.trim();
  if (code !== undefined) patch.code = code.trim().toUpperCase();
  if (description !== undefined) patch.description = description.trim();
  if (isActive !== undefined) patch.isActive = !!isActive;

  const department = await departmentService.update(req.params.id, patch);
  res.json({ success: true, department });
};

// DELETE /api/admin/departments/:id
exports.deleteDepartment = async (req, res) => {
  const existing = await departmentService.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "Department not found" });
  }
  await departmentService.remove(req.params.id);
  res.json({ success: true, message: "Department deleted" });
};

// GET /api/admin/departments/stats — students/alumni counts per department, for the admin dashboard.
exports.getDepartmentStats = async (req, res) => {
  const stats = await adminService.getDepartmentStats();
  res.json({ success: true, stats });
};