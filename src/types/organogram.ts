/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EmployeeBand = 
  | 'GM Band' 
  | 'Manager Band' 
  | 'Executive Band' 
  | 'Officer Band' 
  | 'Operator Band';

export type UserRole = 'admin' | 'manager' | 'public_viewer';

export interface UserAccount {
  id: string;
  userId: string; // login identifier e.g. admin or mgr_sewing
  name: string;
  role: UserRole;
  password: string; // Plaintext for library view/editing strictly by admin
  department?: string; // e.g. 'All' or 'Sewing'
  isActive: boolean;
  createdDate: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface OrgNodeData {
  id: string;
  name?: string; // Optional name of the person (e.g., Md. Arif Hossain)
  title: string; // Designation / Role (e.g. Sr. Manager, Sr. Executive, Quality Inspector)
  department: string; // e.g. Sewing, Cutting, Quality Control, Utility, Admin & HR
  subDepartment?: string; // e.g. Pre-Cutting, Cutting Execution, Sewing Operation
  brand?: string; // e.g. Turag Activewear, Turag Knit, AFWL Unit, ATC Operations, All Brands
  reportsTo: string | null; // ID of parent manager node
  band: EmployeeBand;
  levelNumber: number; // 0 for BOD, 1 for DGM/GM, 2 for Manager, 3 for Executive, 4 for Officer/Operator
  headcount?: string; // e.g. "1", "1-8", "231", "100"
  phone?: string; // e.g. 01712915967
  email?: string;
  location?: string;
  notes?: string;
  isCollapsed?: boolean;
}

export interface HierarchyNode extends OrgNodeData {
  children: HierarchyNode[];
  directReportsCount: number;
  totalTeamCount: number;
  depth: number;
  x?: number;
  y?: number;
}

export interface OrgDataset {
  id: string;
  name: string;
  code: string;
  version: string;
  date: string;
  approvedBy: string;
  instructionalDesign: string;
  pdfPath?: string;
  nodes: OrgNodeData[];
}

export interface ManpowerAreaSummary {
  department: string;
  rolesCount: number;
  totalHeadcountMin: number;
  totalHeadcountMax: number;
  gmCount: number;
  managerCount: number;
  execCount: number;
  officerCount: number;
  operatorCount: number;
  keyLeader?: string;
  phone?: string;
  subDepartments: string[];
}

export interface GoogleDriveFileItem {
  id: string;
  name: string;
  fileId: string;
  shareUrl: string;
  format: 'PDF' | 'CSV' | 'VISIO' | 'JSON';
  lastModified: string;
  status: 'synced' | 'available' | 'error';
  description: string;
  nodeCountEstimate?: number;
}

export type AuditActionType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'UNAUTHORIZED_ATTEMPT'
  | 'PASSWORD_CHANGE'
  | 'USER_MANAGEMENT'
  | 'JD_UPLOAD'
  | 'JD_ASSIGN'
  | 'JD_UPDATE'
  | 'JD_DELETE';

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  timestampMs: number;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditActionType;
  details: string;
  entityType?: 'AUTH' | 'NODE' | 'MANPOWER' | 'USER_ACCOUNT' | 'DATASET' | 'JOB_DESCRIPTION';
  entityId?: string;
}

// -------------------------------------------------------------
// JOB DESCRIPTION (JD) MANAGEMENT & DISTRIBUTION SYSTEM TYPES
// -------------------------------------------------------------

export type JDScopeType = 
  | 'INDIVIDUAL'                  // Priority 1: Individual Employee-Specific JD (Highest Priority)
  | 'BRAND_DEPT_DESIGNATION'     // Priority 2: Brand + Department + Designation-Specific JD
  | 'DEPT_DESIGNATION'           // Priority 3: Department + Designation-Specific JD
  | 'BRAND'                      // Priority 4: Brand-Specific JD
  | 'DEPARTMENT'                 // Priority 5: Department-Specific JD
  | 'DESIGNATION'                // Priority 6: Designation-Specific JD
  | 'GENERAL';                   // Priority 7: General / Default JD (Lowest Priority)

export type JDStatus = 'active' | 'inactive' | 'pending_approval';

export interface JDVersion {
  version: string;          // e.g. "v1.0", "v1.1", "v2.0"
  uploadedAt: string;       // Formatted date & time
  uploadedBy: string;       // e.g. "Chief Administrator"
  approvedBy?: string;      // e.g. "Head of Operations"
  effectiveDate: string;    // e.g. "2026-01-01"
  changelog?: string;       // Revision notes
  fileName: string;         // e.g. "JD_Sewing_Senior_Manager_v1.0.pdf"
  fileSize?: string;        // e.g. "245 KB"
  pdfUrl?: string;          // Direct PDF link or Blob URL
  customPdfBase64?: string; // Optional stored base64 or generated data
}

export interface JobDescription {
  id: string;
  title: string;                 // Position title e.g. "Senior Manager - Sewing Operations"
  code: string;                  // e.g. "JD-TURAG-SEW-001"
  scopeType: JDScopeType;
  
  // Assignment Criteria
  brand?: string;                // e.g. "Turag Activewear" or "All Brands"
  department?: string;           // e.g. "Sewing"
  subDepartment?: string;        // e.g. "Line Balancing & Execution"
  designation?: string;          // e.g. "Sr. Manager"
  employeeId?: string;           // e.g. "dept-sewing" (for Individual Specific JD)
  employeeName?: string;         // e.g. "Md. Arif Hossain"

  // Operational Context
  location?: string;             // e.g. "Turag Complex, Unit-2, Gazipur"
  shiftType?: string;            // e.g. "General Shift (8:00 AM - 5:00 PM)"
  sopCode?: string;              // e.g. "HR-SOP-JD-2026/V4"

  // Core JD Content (for formal PDF rendering & viewing)
  summary: string;
  keyResponsibilities: string[];
  keyCompetencies: string[];
  kpiTargets?: string[];
  educationalRequirements?: string;
  experienceRequirements?: string;
  reportingToTitle?: string;

  // Formal Governance Approval Matrix
  approvalMatrix?: {
    preparedByName?: string;
    preparedByTitle?: string;
    reviewedByName?: string;
    reviewedByTitle?: string;
    approvedByName?: string;
    approvedByTitle?: string;
  };

  // Status & Version Tracking
  status: JDStatus;
  currentVersion: string;        // e.g. "v1.0"
  versions: JDVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface JDResolutionResult {
  assignedJD: JobDescription | null;
  priorityLevel: number;         // 1 to 7 (1 is highest)
  priorityLabel: string;
  ruleDescription: string;
  isConflict: boolean;
  conflictingJDs?: JobDescription[];
}
