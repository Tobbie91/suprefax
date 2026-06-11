import express from "express";
import multer from "multer";
import { authenticate, authorize, requireVerifiedKyc } from "../middleware/auth.js";
import { audit } from "../middleware/audit.js";
import { validate } from "../middleware/validate.js";
import { applicationSchema, extensionSchema, loginSchema } from "../validation/applicationSchema.js";

import { login, register, bootstrapAdmin } from "../controllers/auth.js";
import { createApplication, getAgentApplications, getAgentRepayments, quoteApplication, getLoanBaselines, listVerifiedAgents } from "../controllers/application.js";
import { getBorrowerRepayments, getBorrowerNotifications, getBorrowerApplications, getBorrowerExtensions, createBorrowerApplication, acceptQuote, declineQuote } from "../controllers/borrower.js";
import { requestExtension, approveExtension, declineExtension } from "../controllers/extensions.js";
import { sign, getSignatures } from "../controllers/signature.js";
import { getAllApplications, getExtensions, getAuditLogs, getAnalytics, controlNotifications, listAgents, listCustomers, createAgent, resetNonAdminUsers, manuallyVerifyKyc } from "../controllers/admin.js";
import { getDocument, listApplicationDocuments, uploadApplicationDocument } from "../controllers/documents.js";
import { initiateKyc, getKycStatus, handleProveWebhook } from "../controllers/kyc.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const router = express.Router();

// Auth
router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/register", register);
router.post("/auth/bootstrap-admin", bootstrapAdmin);

// Borrower (requires verified KYC)
router.get("/borrower/repayments", authenticate, authorize(["borrower"]), requireVerifiedKyc, getBorrowerRepayments);
router.get("/borrower/applications", authenticate, authorize(["borrower"]), requireVerifiedKyc, getBorrowerApplications);
router.get("/borrower/extensions", authenticate, authorize(["borrower"]), requireVerifiedKyc, getBorrowerExtensions);
router.post("/borrower/applications", authenticate, authorize(["borrower"]), requireVerifiedKyc, createBorrowerApplication);
router.post("/borrower/applications/:id/accept-quote", authenticate, authorize(["borrower"]), requireVerifiedKyc, acceptQuote);
router.post("/borrower/applications/:id/decline-quote", authenticate, authorize(["borrower"]), requireVerifiedKyc, declineQuote);
router.get("/notifications", authenticate, getBorrowerNotifications);

// Loan reference data (available to all authenticated users)
router.get("/agents/verified", authenticate, listVerifiedAgents);
router.get("/loan-baselines", authenticate, getLoanBaselines);

// Application documents
router.get("/applications/:id/documents", authenticate, listApplicationDocuments);
router.post("/applications/:id/documents", authenticate, authorize(["borrower"]), requireVerifiedKyc, upload.single("file"), uploadApplicationDocument);

// KYC (Mono Prove flow). Initiate is auth-gated; webhook is public.
router.get("/kyc/status", authenticate, getKycStatus);
router.post("/kyc/initiate", authenticate, initiateKyc);
router.post("/webhooks/mono/prove", handleProveWebhook);

// Agent (requires verified KYC)
router.get("/agent/applications", authenticate, authorize(["agent"]), requireVerifiedKyc, getAgentApplications);
router.get("/agent/repayments", authenticate, authorize(["agent"]), requireVerifiedKyc, getAgentRepayments);
router.post("/agent/applications/:id/quote", authenticate, authorize(["agent"]), requireVerifiedKyc, quoteApplication);

// Applications
router.post(
  "/applications",
  authenticate,
  authorize(["borrower"]),
  requireVerifiedKyc,
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
router.post("/admin/reset-non-admin", authenticate, authorize(["admin"]), resetNonAdminUsers);
router.post("/admin/verify-kyc", authenticate, authorize(["admin"]), manuallyVerifyKyc);
router.get("/audit", authenticate, authorize(["admin"]), getAuditLogs);

export default router;
