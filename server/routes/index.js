import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { audit } from "../middleware/audit.js";
import { validate } from "../middleware/validate.js";
import { applicationSchema, extensionSchema, loginSchema } from "../validation/applicationSchema.js";

import { login, register, bootstrapAdmin } from "../controllers/auth.js";
import { createApplication, getAgentApplications, getAgentRepayments } from "../controllers/application.js";
import { getBorrowerRepayments, getBorrowerNotifications, getBorrowerApplications, getBorrowerExtensions, createBorrowerApplication } from "../controllers/borrower.js";
import { requestExtension, approveExtension, declineExtension } from "../controllers/extensions.js";
import { sign, getSignatures } from "../controllers/signature.js";
import { getAllApplications, getExtensions, getAuditLogs, getAnalytics, controlNotifications, listAgents, listCustomers, createAgent } from "../controllers/admin.js";
import { getDocument } from "../controllers/documents.js";

const router = express.Router();

// Auth
router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/register", register);
router.post("/auth/bootstrap-admin", bootstrapAdmin);

// Borrower
router.get("/borrower/repayments", authenticate, authorize(["borrower"]), getBorrowerRepayments);
router.get("/borrower/applications", authenticate, authorize(["borrower"]), getBorrowerApplications);
router.get("/borrower/extensions", authenticate, authorize(["borrower"]), getBorrowerExtensions);
router.post("/borrower/applications", authenticate, authorize(["borrower"]), createBorrowerApplication);
router.get("/notifications", authenticate, getBorrowerNotifications);

// Agent
router.get("/agent/applications", authenticate, authorize(["agent"]), getAgentApplications);
router.get("/agent/repayments", authenticate, authorize(["agent"]), getAgentRepayments);

// Applications
router.post(
  "/applications",
  authenticate,
  authorize(["borrower"]),
  validate(applicationSchema),
  audit("CREATED_APPLICATION", "applications"),
  createApplication
);

// Signatures
router.post("/sign", authenticate, sign);
router.get("/signatures/:id", authenticate, getSignatures);

// Extensions
router.post(
  "/extensions",
  authenticate,
  validate(extensionSchema),
  audit("REQUESTED_EXTENSION", "extensions"),
  requestExtension
);

// Documents
router.get("/documents/:id", authenticate, getDocument);

// Admin
router.get("/admin/applications", authenticate, authorize(["admin"]), getAllApplications);
router.get("/admin/extensions", authenticate, authorize(["admin"]), getExtensions);
router.post(
  "/admin/extensions/:id/approve",
  authenticate,
  authorize(["admin"]),
  audit("APPROVED_EXTENSION", "extensions"),
  approveExtension
);
router.post(
  "/admin/extensions/:id/decline",
  authenticate,
  authorize(["admin"]),
  audit("DECLINED_EXTENSION", "extensions"),
  declineExtension
);
router.get("/admin/analytics", authenticate, authorize(["admin"]), getAnalytics);
router.get("/admin/agents", authenticate, authorize(["admin"]), listAgents);
router.post("/admin/agents", authenticate, authorize(["admin"]), createAgent);
router.get("/admin/customers", authenticate, authorize(["admin"]), listCustomers);
router.post("/admin/notifications/control", authenticate, authorize(["admin"]), controlNotifications);
router.get("/audit", authenticate, authorize(["admin"]), getAuditLogs);

export default router;
