/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  JobDescription, 
  JDResolutionResult, 
  OrgNodeData, 
  JDScopeType 
} from '../types/organogram';

const JD_STORAGE_KEY = 'turag_job_descriptions_v1';

export const SAMPLE_EVERY_AREA_JD: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'> = {
  title: 'Operations Director - Garments Manufacturing & Automation',
  code: 'JD-TURAG-MASTER-FULL-001',
  scopeType: 'DEPT_DESIGNATION',
  brand: 'Turag Activewear',
  department: 'General Operations',
  subDepartment: 'Executive Plant Directorate & Advanced Automation',
  designation: 'Deputy General Manager (DGM)',
  location: 'Turag Complex, Plant-1 (Kashimpur, Gazipur)',
  shiftType: 'Executive Shift (08:00 - 17:00) + Operational On-Call',
  sopCode: 'TURAG-HR-SOP-JD-2026/V4-REV2',
  reportingToTitle: 'Managing Director & Board of Directors',
  summary: 'Supreme executive responsibility for leading all factory manufacturing functions across 15 operational divisions, ensuring monthly output targets of 2.8M garments are met with zero compliance defects, optimal SMV line efficiency, and world-class buyer quality standards.',
  keyResponsibilities: [
    'Direct daily strategic production schedules across Cutting, Sewing, Finishing, Embroidery, and Printing units.',
    'Lead monthly P&L operations, minimizing operational wastage, fabric consumption, and needle downtime.',
    'Supervise and mentor 15 Department Heads, 32 Managers, and over 4,500 total factory employees.',
    'Chair weekly Industrial Engineering (IE) review sessions to improve overall factory efficiency above 68%.',
    'Enforce 100% adherence to RSC, Sedex, Higg FEM/FSLM, WRAP, and buyer code of conduct protocols.',
    'Authorize high-value procurement requests for automated sewing machinery and CAD cutter upgrades.',
    'Coordinate directly with International Merchandising teams for critical path time-and-action (T&A) milestones.',
    'Oversee emergency preparedness, occupational safety, and employee welfare committee resolutions.'
  ],
  keyCompetencies: [
    'Lean Manufacturing & Six Sigma Black Belt methodology',
    'ERP & Real-time digital shop-floor tracking systems',
    'Advanced apparel costing, SMV balancing, and FastReact scheduling',
    'Executive stakeholder leadership & multi-tier labor crisis negotiation',
    'International buyer compliance standards (BSCI, WRAP, SEDEX, OEKO-TEX)',
    'Root cause analysis & Kaizen continuous improvement mindset'
  ],
  kpiTargets: [
    'Factory-Wide SMV Efficiency >= 68.5%',
    'On-Time In-Full (OTIF) Shipment Delivery >= 98.8%',
    'Buyer Final Quality Audit First-Time Pass Rate >= 99.0%',
    'Unannounced Social Compliance Audit score >= 95%'
  ],
  educationalRequirements: 'B.Sc in Textile Engineering / Industrial & Production Engineering (IPE) from BUET/BUTEX or MBA in Operations Management.',
  experienceRequirements: '15+ years comprehensive experience in RMG manufacturing with at least 5 years at Plant Head / DGM level.',
  approvalMatrix: {
    preparedByName: 'Md. Kamrul Hasan',
    preparedByTitle: 'Senior Manager - HR & Compliance',
    reviewedByName: 'Alomgir Hossain',
    reviewedByTitle: 'Deputy General Manager',
    approvedByName: 'Syed Tanvir Ahmed',
    approvedByTitle: 'Managing Director & CEO'
  },
  status: 'active',
  currentVersion: 'v1.0',
  versions: [
    {
      version: 'v1.0',
      uploadedAt: '2026-02-20 09:30 AM',
      uploadedBy: 'Chief Administrator',
      approvedBy: 'Syed Tanvir Ahmed (MD)',
      effectiveDate: '2026-02-01',
      changelog: 'Official comprehensive specification covering every operational area data.',
      fileName: 'JD_Master_Full_Operations_Director_v1.0.pdf',
      fileSize: '468 KB'
    }
  ]
};

export const INITIAL_JOB_DESCRIPTIONS: JobDescription[] = [
  // 0. Complete Flagship Sample (Every Area Data Entry Example)
  {
    id: 'jd-sample-full-spec',
    ...SAMPLE_EVERY_AREA_JD,
    createdAt: '2026-02-20T09:30:00Z',
    updatedAt: '2026-02-20T09:30:00Z'
  },

  // 1. Individual Employee Override (Priority 1) - Special Customized Scope for Sewing Sr. Manager
  {
    id: 'jd-ind-sew-01',
    title: 'Senior Manager - Garments Sewing & Automation Operations',
    code: 'JD-TURAG-IND-SEW-001',
    scopeType: 'INDIVIDUAL',
    brand: 'Turag Activewear',
    department: 'Sewing',
    subDepartment: 'Line Balancing & Automation',
    designation: 'Sr. Manager',
    employeeId: 'dept-sewing',
    employeeName: 'Md. Arif Hossain',
    location: 'Turag Complex, Plant-1 (Gazipur)',
    shiftType: 'Day Shift (8:00 AM - 5:00 PM)',
    sopCode: 'HR-SOP-SEW-2026/V2',
    approvalMatrix: {
      preparedByName: 'HR Directorate',
      preparedByTitle: 'HR Operations Lead',
      reviewedByName: 'Alomgir Hossain',
      reviewedByTitle: 'DGM Operations',
      approvedByName: 'Executive Board',
      approvedByTitle: 'Board of Directors'
    },
    summary: 'Executive leadership over comprehensive garment sewing operations, automated line balancing, multi-brand delivery schedules, and continuous productivity enhancements across 18 sewing production lines.',
    keyResponsibilities: [
      'Lead 18 high-efficiency sewing lines producing activewear and knit polo shirts.',
      'Implement real-time digital line balancing and hourly output tracking metrics.',
      'Authorize daily line allocations, mechanic setups, and preventive needle maintenance.',
      'Oversee SMV (Standard Minute Value) optimization in coordination with Industrial Engineering.',
      'Drive defect rates below 1.2% through in-line and end-line quality enforcement.',
      'Supervise 4 Production Managers, 8 Assistant Managers, and 2,400+ sewing operators.'
    ],
    keyCompetencies: [
      'Expertise in Toyota Production System (TPS) & Lean Sewing Methodologies',
      'Advanced production scheduling (GSD - General Sewing Data certified)',
      'Leadership & multi-tier supervisory conflict resolution',
      'Deep knowledge of ISO 9001 and buyer compliance codes (WRAP, SEDEX, BSCI)'
    ],
    kpiTargets: [
      'Line Efficiency >= 68% across all active lines',
      'Defect Return Rate < 1.0%',
      'On-Time Delivery Performance (OTDP) >= 98.5%',
      'Operator absenteeism rate controlled below 3.5%'
    ],
    educationalRequirements: 'B.Sc in Textile Engineering / Industrial & Production Engineering (IPE) or MBA in Supply Chain.',
    experienceRequirements: 'Minimum 12+ years in apparel manufacturing with at least 5 years at Senior Management level.',
    reportingToTitle: 'Deputy General Manager (DGM)',
    status: 'active',
    currentVersion: 'v2.1',
    versions: [
      {
        version: 'v2.1',
        uploadedAt: '2026-02-15 10:30 AM',
        uploadedBy: 'Chief Administrator',
        approvedBy: 'Director of Manufacturing',
        effectiveDate: '2026-02-01',
        changelog: 'Updated for 2026 automation integration & Lean sewing cell expansions.',
        fileName: 'JD_Special_Arif_Hossain_Sewing_SrMgr_v2.1.pdf',
        fileSize: '412 KB'
      },
      {
        version: 'v2.0',
        uploadedAt: '2025-06-10 09:15 AM',
        uploadedBy: 'HR Operations',
        approvedBy: 'DGM Alomgir Hossain',
        effectiveDate: '2025-06-01',
        changelog: 'Initial individual special assignment charter.',
        fileName: 'JD_Special_Arif_Hossain_v2.0.pdf',
        fileSize: '388 KB'
      }
    ],
    createdAt: '2025-06-10T09:15:00Z',
    updatedAt: '2026-02-15T10:30:00Z'
  },

  // 2. Brand + Department + Designation Specific (Priority 2) - Quality Control Manager for Turag Activewear
  {
    id: 'jd-bdd-qc-01',
    title: 'Manager - Quality Assurance & Buyer Compliance (Turag Activewear)',
    code: 'JD-TURAG-ACT-QC-MGR-002',
    scopeType: 'BRAND_DEPT_DESIGNATION',
    brand: 'Turag Activewear',
    department: 'Quality Control',
    designation: 'Manager',
    summary: 'Direct brand-specific quality assurance protocols for high-stretch activewear textiles, flatlock seam integrity, stretch recovery, and AQL 1.5 buyer audit standards.',
    keyResponsibilities: [
      'Formulate and execute activewear quality control checklists for four-way stretch fabrics.',
      'Oversee fabric shrinkage, skewing, and color fastness lab testing protocols.',
      'Supervise 12 Senior Executives and 48 Quality Inspectors across cutting, sewing, and finishing.',
      'Interface directly with international buyer QA auditors for final commercial pass.'
    ],
    keyCompetencies: [
      'ASTM & AATCC apparel testing standards',
      'AQL 1.0 / 1.5 final audit certifications',
      'Technical fabric performance analysis (Poly-Spandex, Nylon blends)',
      'Root cause analysis (8D / 5-Why methodology)'
    ],
    kpiTargets: [
      'First-Time Right (FTR) Sewing Pass Rate >= 96%',
      'Buyer Final Audit Pass Rate = 100%',
      'Customer Quality Claim deductions = $0.00'
    ],
    educationalRequirements: 'B.Sc in Textile Technology or B.Sc in Garments Engineering.',
    experienceRequirements: '8+ years quality management in activewear/sports performance export garments.',
    reportingToTitle: 'Deputy General Manager (DGM)',
    status: 'active',
    currentVersion: 'v1.2',
    versions: [
      {
        version: 'v1.2',
        uploadedAt: '2026-01-20 03:00 PM',
        uploadedBy: 'Chief Administrator',
        approvedBy: 'DGM Alomgir Hossain',
        effectiveDate: '2026-01-15',
        changelog: 'Added moisture-wicking and flatlock testing standards.',
        fileName: 'JD_Activewear_QC_Manager_v1.2.pdf',
        fileSize: '345 KB'
      }
    ],
    createdAt: '2026-01-20T15:00:00Z',
    updatedAt: '2026-01-20T15:00:00Z'
  },

  // 3. Department + Designation Specific (Priority 3) - Cutting Manager Standard
  {
    id: 'jd-dd-cut-01',
    title: 'Manager - Cutting Operations & CAD Marker Planning',
    code: 'JD-TURAG-CUT-MGR-003',
    scopeType: 'DEPT_DESIGNATION',
    department: 'Cutting',
    designation: 'Manager',
    summary: 'Direct all fabric spreading, automatic CNC cutting, CAD marker ratio efficiency, fabric utilization, and numbered bundling operations for production feeding.',
    keyResponsibilities: [
      'Manage daily cutting schedules matching sewing line requirement targets.',
      'Maintain fabric consumption efficiency with marker utilization averaging above 87.5%.',
      'Inspect cut-piece tolerances (+/- 1mm) and manage ticketing/bundling numbering controls.',
      'Lead 160 cutting technicians, spreaders, and auto-cutter operators.'
    ],
    keyCompetencies: [
      'Gerber / Lectra CAD automatic cutting systems',
      'Fabric relaxation, shade sorting, and shrinkage group planning',
      'Wastage minimization and remnant piece control'
    ],
    kpiTargets: [
      'Marker Efficiency >= 88.0%',
      'Cutting wastage < 1.5% of gross consumption',
      'Zero production line starvation for sewing feeding'
    ],
    educationalRequirements: 'Diploma/Degree in Textile Engineering or Garments Technology.',
    experienceRequirements: '7+ years cutting floor management experience in large-scale export factories.',
    reportingToTitle: 'Deputy General Manager (DGM)',
    status: 'active',
    currentVersion: 'v1.0',
    versions: [
      {
        version: 'v1.0',
        uploadedAt: '2026-01-10 11:00 AM',
        uploadedBy: 'HR Operations',
        approvedBy: 'Head of Operations',
        effectiveDate: '2026-01-01',
        changelog: 'Initial baseline JD release for Cutting Managers.',
        fileName: 'JD_Cutting_Manager_v1.0.pdf',
        fileSize: '298 KB'
      }
    ],
    createdAt: '2026-01-10T11:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z'
  },

  // 4. Department + Designation Specific (Priority 3) - Quality Control - Quality Inspector
  {
    id: 'jd-dd-qc-insp-01',
    title: 'Quality Inspector - In-Line & End-Line Quality Gatekeeper',
    code: 'JD-TURAG-QC-INSP-004',
    scopeType: 'DEPT_DESIGNATION',
    department: 'Quality Control',
    designation: 'Quality Inspector',
    summary: 'Perform rigorous 100% traffic-light inspection on sewing lines, check critical seam specifications, needle punctures, measurement charts, and prevent non-conforming garments from reaching finishing.',
    keyResponsibilities: [
      'Execute hourly in-line roving inspections on 7 key sewing operations.',
      'Verify garment dimensions against approved buyer measurement spec sheets with zero tolerance drift.',
      'Record defect tallies on visual line board and trigger immediate line stop if defect threshold exceeds 3%.',
      'Ensure proper handling of needle breakage protocol and metal detection compliance.'
    ],
    keyCompetencies: [
      'Garment defect taxonomy (skip stitch, puckering, shading, broken stitches)',
      'Accurate tape measurement reading in metric and imperial scales',
      'Traffic light visual quality control systems'
    ],
    kpiTargets: [
      'End-line Defect Capture Rate >= 98%',
      'Hourly inspection audit accuracy >= 99%',
      'Zero needle fragments passed to packaging'
    ],
    educationalRequirements: 'HSC / SSC with vocational training in Garments Quality Inspection.',
    experienceRequirements: '2+ years quality inspection in export garment units.',
    reportingToTitle: 'Quality Officer / Executive',
    status: 'active',
    currentVersion: 'v1.1',
    versions: [
      {
        version: 'v1.1',
        uploadedAt: '2026-01-18 02:40 PM',
        uploadedBy: 'Chief Administrator',
        approvedBy: 'Quality Assurance Manager',
        effectiveDate: '2026-01-15',
        changelog: 'Included mandatory metal detection and needle logbook checkpoints.',
        fileName: 'JD_Quality_Inspector_v1.1.pdf',
        fileSize: '256 KB'
      }
    ],
    createdAt: '2026-01-18T14:40:00Z',
    updatedAt: '2026-01-18T14:40:00Z'
  },

  // 5. Department + Designation Specific (Priority 3) - Sewing Operator Standard
  {
    id: 'jd-dd-sew-op-01',
    title: 'Sewing Operator - High Performance Machine Operation',
    code: 'JD-TURAG-SEW-OP-005',
    scopeType: 'DEPT_DESIGNATION',
    department: 'Sewing',
    designation: 'Sewing Operator',
    summary: 'Execute precision single-needle, overlock, and flatlock machine operations to assemble knit and activewear garments strictly aligned with production SMV and quality tolerances.',
    keyResponsibilities: [
      'Operate industrial sewing machinery (Overlock, Lockstitch, Flatlock, Kansai).',
      'Maintain personal output at or above the designated line target (SMV benchmark).',
      'Self-inspect first 3 assembled pieces after each bundle change.',
      'Promptly report needle breakage and machine tension abnormalities to Line Mechanic.'
    ],
    keyCompetencies: [
      'High-speed garment seam assembly',
      'Safe machinery handling and finger guard adherence',
      'Careful fabric handling without stretching or tension distortion'
    ],
    kpiTargets: [
      'Individual Operator Efficiency >= 70%',
      'Self-inspection error rate < 1.5%',
      'Adherence to personal safety equipment (PPE) = 100%'
    ],
    educationalRequirements: 'Literate / Class 8 pass with certified sewing operator training.',
    experienceRequirements: '1+ years operational experience on knitwear or sports apparel.',
    reportingToTitle: 'Line Supervisor / Production Officer',
    status: 'active',
    currentVersion: 'v1.0',
    versions: [
      {
        version: 'v1.0',
        uploadedAt: '2026-01-05 09:00 AM',
        uploadedBy: 'HR Operations',
        approvedBy: 'Industrial Engineering Head',
        effectiveDate: '2026-01-01',
        changelog: 'Standard factory operator job specification.',
        fileName: 'JD_Sewing_Operator_Standard_v1.0.pdf',
        fileSize: '220 KB'
      }
    ],
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z'
  },

  // 6. Department-Specific (Priority 5) - Admin & HR Department General Scope
  {
    id: 'jd-dept-hr-01',
    title: 'Departmental Charter - Admin, HR & Social Compliance',
    code: 'JD-TURAG-HR-DEPT-006',
    scopeType: 'DEPARTMENT',
    department: 'Admin & HR',
    summary: 'Comprehensive human resources, employee welfare, industrial relations, labor law compliance, security, factory licensing, and occupational health & safety governance.',
    keyResponsibilities: [
      'Administer fair recruitment, payroll disbursal, and workforce attendance systems.',
      'Ensure 100% adherence to Bangladesh Labour Act 2006 and buyer codes of conduct.',
      'Oversee medical clinic, factory daycare, and maternity benefit programs.',
      'Conduct bi-monthly fire safety drills and maintain zero-incident factory security.'
    ],
    keyCompetencies: [
      'Labor law, BLA 2006, ILO international conventions',
      'Social compliance audit preparedness (RSC, Sedex, Higg FEM/FSLM)',
      'Grievance redressal mechanisms and worker participation committee (WPC)'
    ],
    kpiTargets: [
      'Zero social compliance non-conformities during unannounced audits',
      '100% timely salary and OT disbursement by 7th of every calendar month',
      'Employee satisfaction rating >= 85%'
    ],
    educationalRequirements: 'Masters in HRM / PGDHRM or MBA from a recognized university.',
    experienceRequirements: '5+ years in ready-made garment (RMG) HR administration.',
    reportingToTitle: 'Deputy General Manager (DGM)',
    status: 'active',
    currentVersion: 'v1.0',
    versions: [
      {
        version: 'v1.0',
        uploadedAt: '2026-01-08 10:15 AM',
        uploadedBy: 'Chief Administrator',
        approvedBy: 'Managing Director',
        effectiveDate: '2026-01-01',
        changelog: 'Annual HR & Compliance Charter update.',
        fileName: 'JD_HR_Admin_Departmental_Charter_v1.0.pdf',
        fileSize: '315 KB'
      }
    ],
    createdAt: '2026-01-08T10:15:00Z',
    updatedAt: '2026-01-08T10:15:00Z'
  },

  // 7. General / Factory Default (Priority 7) - Default RMG Professional Standard
  {
    id: 'jd-gen-01',
    title: 'General Standard Job Description & Code of Professional Conduct',
    code: 'JD-TURAG-GEN-STD-007',
    scopeType: 'GENERAL',
    summary: 'Universal operational expectations, code of ethics, attendance punctuality, occupational safety protocols, and workplace hygiene applicable across all manufacturing units.',
    keyResponsibilities: [
      'Perform designated daily production duties with strict adherence to factory safety guidelines.',
      'Report on time for shift commencement and respect standardized break timings.',
      'Maintain cleanliness and 5S organization around individual workstation and tooling.',
      'Treat colleagues, supervisors, and subordinates with professional dignity and respect.'
    ],
    keyCompetencies: [
      'Factory safety consciousness & emergency evacuation awareness',
      'Fundamental garment production workflow familiarity',
      'Teamwork and cooperative operational demeanor'
    ],
    kpiTargets: [
      'Monthly Attendance Punctuality >= 96%',
      'Adherence to Factory 5S Standards = 100%',
      'Zero reported disciplinary or workplace misconduct violations'
    ],
    educationalRequirements: 'Standard educational requirement as per assigned employment grade.',
    experienceRequirements: 'Applicable to all factory personnel in absence of specialized role charter.',
    reportingToTitle: 'Designated Section Supervisor',
    status: 'active',
    currentVersion: 'v1.0',
    versions: [
      {
        version: 'v1.0',
        uploadedAt: '2026-01-01 08:00 AM',
        uploadedBy: 'Chief Administrator',
        approvedBy: 'Board of Directors',
        effectiveDate: '2026-01-01',
        changelog: 'Official Turag Garments and Hosiery Ltd. company-wide baseline JD.',
        fileName: 'JD_General_Standard_Turag_v1.0.pdf',
        fileSize: '210 KB'
      }
    ],
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z'
  }
];

export function getStoredJDs(): JobDescription[] {
  try {
    const raw = localStorage.getItem(JD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure flagship sample is always accessible
        const hasFullSample = parsed.some((j: JobDescription) => j.id === 'jd-sample-full-spec');
        if (!hasFullSample) {
          const combined = [INITIAL_JOB_DESCRIPTIONS[0], ...parsed];
          saveJDs(combined);
          return combined;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load stored JDs:', err);
  }
  return INITIAL_JOB_DESCRIPTIONS;
}

export function saveJDs(jds: JobDescription[]): void {
  try {
    localStorage.setItem(JD_STORAGE_KEY, JSON.stringify(jds));
  } catch (err) {
    console.error('Failed to save JDs:', err);
  }
}

/**
 * 7-Tier JD Priority Hierarchy Resolution Engine:
 * 
 * 1. Individual Employee-Specific JD (Highest Priority)
 * 2. Brand + Department + Designation-Specific JD
 * 3. Department + Designation-Specific JD
 * 4. Brand-Specific JD
 * 5. Department-Specific JD
 * 6. Designation-Specific JD
 * 7. General/Default JD (Lowest Priority)
 * 
 * Flags conflict if multiple JDs exist at the same priority level.
 */
export function resolveApplicableJD(
  employee: OrgNodeData, 
  allJDs: JobDescription[]
): JDResolutionResult {
  const activeJDs = allJDs.filter((jd) => jd.status === 'active');
  const employeeBrand = (employee.brand || 'Turag Activewear').trim().toLowerCase();
  const employeeDept = (employee.department || '').trim().toLowerCase();
  const employeeTitle = (employee.title || '').trim().toLowerCase();
  const employeeId = (employee.id || '').trim();

  // Tier 1: Individual Employee-Specific JD
  const tier1Matches = activeJDs.filter((jd) => {
    if (jd.scopeType !== 'INDIVIDUAL') return false;
    if (jd.employeeId && jd.employeeId.trim() === employeeId) return true;
    if (employee.name && jd.employeeName && jd.employeeName.trim().toLowerCase() === employee.name.trim().toLowerCase()) return true;
    return false;
  });

  if (tier1Matches.length > 1) {
    return {
      assignedJD: tier1Matches[0],
      priorityLevel: 1,
      priorityLabel: 'Priority 1: Individual Employee Override',
      ruleDescription: `Conflicting individual JDs detected for Employee ID ${employee.id}. Requires management review.`,
      isConflict: true,
      conflictingJDs: tier1Matches
    };
  } else if (tier1Matches.length === 1) {
    return {
      assignedJD: tier1Matches[0],
      priorityLevel: 1,
      priorityLabel: 'Priority 1: Individual Employee Override',
      ruleDescription: `Assigned specifically to employee ID ${employee.id} (${employee.name || employee.title}) as a customized job scope override.`,
      isConflict: false
    };
  }

  // Tier 2: Brand + Department + Designation-Specific JD
  const tier2Matches = activeJDs.filter((jd) => {
    if (jd.scopeType !== 'BRAND_DEPT_DESIGNATION') return false;
    const matchBrand = jd.brand && (jd.brand.toLowerCase() === employeeBrand || jd.brand.toLowerCase() === 'all brands');
    const matchDept = jd.department && jd.department.toLowerCase() === employeeDept;
    const matchDesig = jd.designation && jd.designation.toLowerCase() === employeeTitle;
    return matchBrand && matchDept && matchDesig;
  });

  if (tier2Matches.length > 1) {
    return {
      assignedJD: tier2Matches[0],
      priorityLevel: 2,
      priorityLabel: 'Priority 2: Brand + Dept + Designation Match',
      ruleDescription: `Multiple JDs match Brand (${employee.brand || 'Turag Activewear'}), Department (${employee.department}), and Designation (${employee.title}). Flagged for review.`,
      isConflict: true,
      conflictingJDs: tier2Matches
    };
  } else if (tier2Matches.length === 1) {
    return {
      assignedJD: tier2Matches[0],
      priorityLevel: 2,
      priorityLabel: 'Priority 2: Brand + Dept + Designation Match',
      ruleDescription: `Applicable to ${employee.brand || 'Turag Activewear'} > ${employee.department} > ${employee.title}.`,
      isConflict: false
    };
  }

  // Tier 3: Department + Designation-Specific JD
  const tier3Matches = activeJDs.filter((jd) => {
    if (jd.scopeType !== 'DEPT_DESIGNATION') return false;
    const matchDept = jd.department && jd.department.toLowerCase() === employeeDept;
    const matchDesig = jd.designation && jd.designation.toLowerCase() === employeeTitle;
    return matchDept && matchDesig;
  });

  if (tier3Matches.length > 1) {
    return {
      assignedJD: tier3Matches[0],
      priorityLevel: 3,
      priorityLabel: 'Priority 3: Department + Designation Match',
      ruleDescription: `Multiple standard JDs found for ${employee.department} - ${employee.title}. Flagged for review.`,
      isConflict: true,
      conflictingJDs: tier3Matches
    };
  } else if (tier3Matches.length === 1) {
    return {
      assignedJD: tier3Matches[0],
      priorityLevel: 3,
      priorityLabel: 'Priority 3: Department + Designation Match',
      ruleDescription: `Standard operational specification for ${employee.department} department holding designation "${employee.title}".`,
      isConflict: false
    };
  }

  // Tier 4: Brand-Specific JD
  const tier4Matches = activeJDs.filter((jd) => {
    if (jd.scopeType !== 'BRAND') return false;
    return jd.brand && (jd.brand.toLowerCase() === employeeBrand || jd.brand.toLowerCase() === 'all brands');
  });

  if (tier4Matches.length > 1) {
    return {
      assignedJD: tier4Matches[0],
      priorityLevel: 4,
      priorityLabel: 'Priority 4: Brand-Specific Charter',
      ruleDescription: `Multiple brand-level JDs found for ${employee.brand || 'Turag Activewear'}.`,
      isConflict: true,
      conflictingJDs: tier4Matches
    };
  } else if (tier4Matches.length === 1) {
    return {
      assignedJD: tier4Matches[0],
      priorityLevel: 4,
      priorityLabel: 'Priority 4: Brand-Specific Charter',
      ruleDescription: `Assigned based on organizational brand membership (${employee.brand || 'Turag Activewear'}).`,
      isConflict: false
    };
  }

  // Tier 5: Department-Specific JD
  const tier5Matches = activeJDs.filter((jd) => {
    if (jd.scopeType !== 'DEPARTMENT') return false;
    return jd.department && jd.department.toLowerCase() === employeeDept;
  });

  if (tier5Matches.length > 1) {
    return {
      assignedJD: tier5Matches[0],
      priorityLevel: 5,
      priorityLabel: 'Priority 5: Departmental Charter',
      ruleDescription: `Multiple department-level JDs found for ${employee.department}.`,
      isConflict: true,
      conflictingJDs: tier5Matches
    };
  } else if (tier5Matches.length === 1) {
    return {
      assignedJD: tier5Matches[0],
      priorityLevel: 5,
      priorityLabel: 'Priority 5: Departmental Charter',
      ruleDescription: `Department-wide operational charter for ${employee.department}.`,
      isConflict: false
    };
  }

  // Tier 6: Designation-Specific JD (cross-department)
  const tier6Matches = activeJDs.filter((jd) => {
    if (jd.scopeType !== 'DESIGNATION') return false;
    return jd.designation && jd.designation.toLowerCase() === employeeTitle;
  });

  if (tier6Matches.length > 1) {
    return {
      assignedJD: tier6Matches[0],
      priorityLevel: 6,
      priorityLabel: 'Priority 6: Designation Match',
      ruleDescription: `Multiple generic designation JDs found for title "${employee.title}".`,
      isConflict: true,
      conflictingJDs: tier6Matches
    };
  } else if (tier6Matches.length === 1) {
    return {
      assignedJD: tier6Matches[0],
      priorityLevel: 6,
      priorityLabel: 'Priority 6: Designation Match',
      ruleDescription: `Generic designation-wide standard for "${employee.title}".`,
      isConflict: false
    };
  }

  // Tier 7: General / Default JD
  const tier7Matches = activeJDs.filter((jd) => jd.scopeType === 'GENERAL');
  if (tier7Matches.length > 0) {
    return {
      assignedJD: tier7Matches[0],
      priorityLevel: 7,
      priorityLabel: 'Priority 7: Factory General Default',
      ruleDescription: 'Baseline factory code of conduct and standard manufacturing job duties.',
      isConflict: tier7Matches.length > 1,
      conflictingJDs: tier7Matches.length > 1 ? tier7Matches : undefined
    };
  }

  // No JD found
  return {
    assignedJD: null,
    priorityLevel: 0,
    priorityLabel: 'No Job Description Assigned',
    ruleDescription: 'No matching job description found across all 7 assignment priority tiers.',
    isConflict: false
  };
}

/**
 * Counts employees affected/covered by a specific Job Description
 */
export function getAffectedEmployeesCount(jd: JobDescription, allNodes: OrgNodeData[]): number {
  return allNodes.filter((node) => {
    const res = resolveApplicableJD(node, [jd]);
    return res.assignedJD?.id === jd.id;
  }).length;
}

/**
 * Calculates 8 central KPI metrics for the JD Management Dashboard
 */
export interface JDSystemStats {
  totalJDs: number;
  activeJDs: number;
  departmentCoveragePercent: number;
  rolesCoveragePercent: number;
  individualOverridesCount: number;
  pendingApprovalCount: number;
  conflictingJDsCount: number;
  totalEmployeesCovered: number;
  coveredDepartmentsCount: number;
  totalDepartmentsCount: number;
}

export function calculateJDStats(allJDs: JobDescription[], allNodes: OrgNodeData[]): JDSystemStats {
  const totalJDs = allJDs.length;
  const activeJDs = allJDs.filter((j) => j.status === 'active').length;
  const pendingApprovalCount = allJDs.filter((j) => j.status === 'pending_approval').length;
  const individualOverridesCount = allJDs.filter((j) => j.scopeType === 'INDIVIDUAL' && j.status === 'active').length;

  // Unique departments in nodes
  const allDepts = Array.from(new Set(allNodes.map((n) => n.department).filter(Boolean)));
  // Unique designations in nodes
  const allRoles = Array.from(new Set(allNodes.map((n) => n.title).filter(Boolean)));

  // Count employees who have an active resolved JD
  let coveredEmployeesCount = 0;
  let conflictCount = 0;
  const coveredDeptsSet = new Set<string>();
  const coveredRolesSet = new Set<string>();

  allNodes.forEach((node) => {
    const res = resolveApplicableJD(node, allJDs);
    if (res.isConflict) {
      conflictCount++;
    }
    if (res.assignedJD) {
      coveredEmployeesCount++;
      if (node.department) coveredDeptsSet.add(node.department);
      if (node.title) coveredRolesSet.add(node.title);
    }
  });

  const departmentCoveragePercent = allDepts.length > 0 
    ? Math.round((coveredDeptsSet.size / allDepts.length) * 100) 
    : 0;

  const rolesCoveragePercent = allRoles.length > 0 
    ? Math.round((coveredRolesSet.size / allRoles.length) * 100) 
    : 0;

  return {
    totalJDs,
    activeJDs,
    departmentCoveragePercent,
    rolesCoveragePercent,
    individualOverridesCount,
    pendingApprovalCount,
    conflictingJDsCount: conflictCount,
    totalEmployeesCovered: coveredEmployeesCount,
    coveredDepartmentsCount: coveredDeptsSet.size,
    totalDepartmentsCount: allDepts.length
  };
}
