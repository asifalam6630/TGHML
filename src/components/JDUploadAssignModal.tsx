/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  JobDescription, 
  JDScopeType, 
  JDStatus, 
  OrgNodeData, 
  UserAccount 
} from '../types/organogram';
import { SAMPLE_EVERY_AREA_JD } from '../data/jobDescriptions';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Users, 
  Building, 
  Briefcase, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  Info,
  MapPin,
  Clock,
  Award,
  FileCheck2,
  FileSignature,
  Eye,
  Edit,
  RotateCcw,
  Check
} from 'lucide-react';
import turagLogo from '../assets/images/turag_logo.png';

interface JDUploadAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJD: (jd: JobDescription, isNew: boolean) => void;
  existingJD?: JobDescription | null;
  allNodes: OrgNodeData[];
  currentUser: UserAccount;
}

export const JDUploadAssignModal: React.FC<JDUploadAssignModalProps> = ({
  isOpen,
  onClose,
  onSaveJD,
  existingJD,
  allNodes,
  currentUser
}) => {
  const isEditing = Boolean(existingJD);

  // Tab: Form Entry vs Live PDF Format Preview
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  // Area 1: Identification & Document Control
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [effectiveDate, setEffectiveDate] = useState('2026-02-01');
  const [sopCode, setSopCode] = useState('TURAG-HR-SOP-JD-2026/V4');

  // Area 2: Scope & Hierarchy Assignment (7 Tiers)
  const [scopeType, setScopeType] = useState<JDScopeType>('DEPT_DESIGNATION');
  const [brand, setBrand] = useState('Turag Activewear');
  const [department, setDepartment] = useState('Sewing');
  const [subDepartment, setSubDepartment] = useState('Line Balancing & Automation');
  const [designation, setDesignation] = useState('Sr. Manager');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [reportingToTitle, setReportingToTitle] = useState('Deputy General Manager (DGM)');

  // Area 3: Operational Context & Location
  const [location, setLocation] = useState('Turag Complex, Plant-1 (Kashimpur, Gazipur)');
  const [shiftType, setShiftType] = useState('Day Shift (8:00 AM - 5:00 PM) + Operational On-Call');

  // Area 4: Executive Summary & Objective
  const [summary, setSummary] = useState('');

  // Area 5: Key Responsibilities (Daily, Weekly, Periodic)
  const [responsibilitiesText, setResponsibilitiesText] = useState('');

  // Area 6: Target KPIs
  const [kpisText, setKpisText] = useState('');

  // Area 7: Competencies
  const [competenciesText, setCompetenciesText] = useState('');

  // Area 8: Education & Experience
  const [education, setEducation] = useState('B.Sc in Textile / Garments Engineering or relevant discipline');
  const [experience, setExperience] = useState('5+ years manufacturing experience in export apparel');

  // Area 9: Governance & Multi-Tier Approval Matrix
  const [preparedByName, setPreparedByName] = useState('Md. Kamrul Hasan');
  const [preparedByTitle, setPreparedByTitle] = useState('HR & Compliance Operations Lead');
  const [reviewedByName, setReviewedByName] = useState('Alomgir Hossain');
  const [reviewedByTitle, setReviewedByTitle] = useState('Deputy General Manager (Operations)');
  const [approvedByName, setApprovedByName] = useState('Syed Tanvir Ahmed');
  const [approvedByTitle, setApprovedByTitle] = useState('Managing Director & CEO');
  const [changelog, setChangelog] = useState('');

  // Area 10: Official PDF Upload Attachment
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string>('320 KB');
  const [status, setStatus] = useState<JDStatus>('active');

  // Derive unique options from current organogram nodes
  const availableBrands = useMemo(() => {
    const set = new Set<string>(['Turag Activewear', 'Turag Knit', 'AFWL Unit', 'All Brands']);
    allNodes.forEach((n) => {
      if (n.brand) set.add(n.brand);
    });
    return Array.from(set);
  }, [allNodes]);

  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    allNodes.forEach((n) => {
      if (n.department) set.add(n.department);
    });
    return Array.from(set).sort();
  }, [allNodes]);

  const availableDesignations = useMemo(() => {
    const set = new Set<string>();
    allNodes.forEach((n) => {
      if (n.title) set.add(n.title);
    });
    return Array.from(set).sort();
  }, [allNodes]);

  // Load Complete Sample Data covering EVERY area
  const handleLoadEveryAreaSample = () => {
    setTitle(SAMPLE_EVERY_AREA_JD.title);
    setCode(SAMPLE_EVERY_AREA_JD.code);
    setScopeType(SAMPLE_EVERY_AREA_JD.scopeType);
    setBrand(SAMPLE_EVERY_AREA_JD.brand || 'Turag Activewear');
    setDepartment(SAMPLE_EVERY_AREA_JD.department || 'General Operations');
    setSubDepartment(SAMPLE_EVERY_AREA_JD.subDepartment || 'Executive Plant Directorate & Advanced Automation');
    setDesignation(SAMPLE_EVERY_AREA_JD.designation || 'Deputy General Manager (DGM)');
    setSelectedEmployeeId('');
    setLocation(SAMPLE_EVERY_AREA_JD.location || 'Turag Complex, Plant-1 (Kashimpur, Gazipur)');
    setShiftType(SAMPLE_EVERY_AREA_JD.shiftType || 'Executive Shift (08:00 - 17:00) + Operational On-Call');
    setSopCode(SAMPLE_EVERY_AREA_JD.sopCode || 'TURAG-HR-SOP-JD-2026/V4-REV2');
    setReportingToTitle(SAMPLE_EVERY_AREA_JD.reportingToTitle || 'Managing Director & Board of Directors');
    setSummary(SAMPLE_EVERY_AREA_JD.summary);
    setResponsibilitiesText(SAMPLE_EVERY_AREA_JD.keyResponsibilities.join('\n'));
    setKpisText((SAMPLE_EVERY_AREA_JD.kpiTargets || []).join('\n'));
    setCompetenciesText(SAMPLE_EVERY_AREA_JD.keyCompetencies.join('\n'));
    setEducation(SAMPLE_EVERY_AREA_JD.educationalRequirements || '');
    setExperience(SAMPLE_EVERY_AREA_JD.experienceRequirements || '');
    setPreparedByName(SAMPLE_EVERY_AREA_JD.approvalMatrix?.preparedByName || 'Md. Kamrul Hasan');
    setPreparedByTitle(SAMPLE_EVERY_AREA_JD.approvalMatrix?.preparedByTitle || 'Senior Manager - HR & Compliance');
    setReviewedByName(SAMPLE_EVERY_AREA_JD.approvalMatrix?.reviewedByName || 'Alomgir Hossain');
    setReviewedByTitle(SAMPLE_EVERY_AREA_JD.approvalMatrix?.reviewedByTitle || 'Deputy General Manager');
    setApprovedByName(SAMPLE_EVERY_AREA_JD.approvalMatrix?.approvedByName || 'Syed Tanvir Ahmed');
    setApprovedByTitle(SAMPLE_EVERY_AREA_JD.approvalMatrix?.approvedByTitle || 'Managing Director & CEO');
    setVersion('v1.0');
    setEffectiveDate('2026-02-01');
    setChangelog('Comprehensive operational charter populated with complete area entries.');
    setUploadedFileName('TURAG_JD_Operations_Director_Master_v1.0.pdf');
    setFileSize('468 KB');
    setStatus('active');
  };

  // Populate when editing existing JD
  useEffect(() => {
    if (existingJD) {
      setScopeType(existingJD.scopeType);
      setTitle(existingJD.title);
      setCode(existingJD.code);
      setBrand(existingJD.brand || 'Turag Activewear');
      setDepartment(existingJD.department || 'Sewing');
      setSubDepartment(existingJD.subDepartment || '');
      setDesignation(existingJD.designation || 'Sr. Manager');
      setSelectedEmployeeId(existingJD.employeeId || '');
      setLocation(existingJD.location || 'Turag Complex, Plant-1 (Kashimpur, Gazipur)');
      setShiftType(existingJD.shiftType || 'Day Shift (8:00 AM - 5:00 PM)');
      setSopCode(existingJD.sopCode || 'TURAG-HR-SOP-JD-2026/V4');
      setSummary(existingJD.summary);
      setResponsibilitiesText(existingJD.keyResponsibilities.join('\n'));
      setCompetenciesText(existingJD.keyCompetencies.join('\n'));
      setKpisText((existingJD.kpiTargets || []).join('\n'));
      setEducation(existingJD.educationalRequirements || '');
      setExperience(existingJD.experienceRequirements || '');
      setReportingToTitle(existingJD.reportingToTitle || 'Deputy General Manager (DGM)');
      
      if (existingJD.approvalMatrix) {
        setPreparedByName(existingJD.approvalMatrix.preparedByName || 'HR Directorate');
        setPreparedByTitle(existingJD.approvalMatrix.preparedByTitle || 'HR Operations');
        setReviewedByName(existingJD.approvalMatrix.reviewedByName || 'Alomgir Hossain');
        setReviewedByTitle(existingJD.approvalMatrix.reviewedByTitle || 'DGM');
        setApprovedByName(existingJD.approvalMatrix.approvedByName || 'Executive Board');
        setApprovedByTitle(existingJD.approvalMatrix.approvedByTitle || 'Board of Directors');
      }

      const lastVer = existingJD.currentVersion || 'v1.0';
      const verNum = parseFloat(lastVer.replace('v', '')) || 1.0;
      setVersion(`v${(verNum + 0.1).toFixed(1)}`);
      setChangelog('Updated specifications for expanded operational responsibilities.');
      setStatus(existingJD.status);
      setUploadedFileName(existingJD.versions?.[0]?.fileName || `${existingJD.code}.pdf`);
    } else {
      // Default initial state
      handleLoadEveryAreaSample();
    }
  }, [existingJD, isOpen]);

  // Auto-generate code
  const handleAutoGenerateCode = () => {
    const deptPrefix = (department || 'GEN').substring(0, 3).toUpperCase();
    const desigPrefix = (designation || 'ROLE').substring(0, 3).toUpperCase();
    const rand = Math.floor(100 + Math.random() * 900);
    setCode(`JD-TURAG-${deptPrefix}-${desigPrefix}-${rand}`);
  };

  // PDF Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Validation Notice: All Job Descriptions must be uploaded in PDF format only.');
        return;
      }
      setUploadedFileName(file.name);
      const kb = Math.round(file.size / 1024);
      setFileSize(`${kb} KB`);
      if (!title || title.includes('Sample')) {
        const cleanName = file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  // Live preview of affected employees
  const affectedEmployees = useMemo(() => {
    return allNodes.filter((node) => {
      if (scopeType === 'INDIVIDUAL') {
        return node.id === selectedEmployeeId;
      }
      if (scopeType === 'BRAND_DEPT_DESIGNATION') {
        const matchB = (node.brand || 'Turag Activewear').toLowerCase() === brand.toLowerCase() || brand === 'All Brands';
        const matchD = node.department.toLowerCase() === department.toLowerCase();
        const matchDesig = node.title.toLowerCase() === designation.toLowerCase();
        return matchB && matchD && matchDesig;
      }
      if (scopeType === 'DEPT_DESIGNATION') {
        const matchD = node.department.toLowerCase() === department.toLowerCase();
        const matchDesig = node.title.toLowerCase() === designation.toLowerCase();
        return matchD && matchDesig;
      }
      if (scopeType === 'BRAND') {
        return (node.brand || 'Turag Activewear').toLowerCase() === brand.toLowerCase() || brand === 'All Brands';
      }
      if (scopeType === 'DEPARTMENT') {
        return node.department.toLowerCase() === department.toLowerCase();
      }
      if (scopeType === 'DESIGNATION') {
        return node.title.toLowerCase() === designation.toLowerCase();
      }
      if (scopeType === 'GENERAL') {
        return true;
      }
      return false;
    });
  }, [allNodes, scopeType, selectedEmployeeId, brand, department, designation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a Job Description Title.');
      return;
    }
    if (!code.trim()) {
      alert('Please provide a unique Job Code.');
      return;
    }
    if (scopeType === 'INDIVIDUAL' && !selectedEmployeeId) {
      alert('Please select an individual employee for this Override JD.');
      return;
    }

    const respList = responsibilitiesText
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const compList = competenciesText
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const kpiList = kpisText
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const selectedEmp = allNodes.find((n) => n.id === selectedEmployeeId);

    const newVersionEntry = {
      version,
      uploadedAt: new Date().toLocaleString(),
      uploadedBy: currentUser.name || 'Chief Administrator',
      approvedBy: approvedByName || 'Executive Management',
      effectiveDate,
      changelog: changelog || 'Baseline version with all area parameters.',
      fileName: uploadedFileName || `${code}_${version}.pdf`,
      fileSize
    };

    const finalJD: JobDescription = {
      id: existingJD ? existingJD.id : `jd-${Date.now()}`,
      title,
      code,
      scopeType,
      brand: (scopeType === 'BRAND' || scopeType === 'BRAND_DEPT_DESIGNATION') ? brand : (brand || 'Turag Activewear'),
      department: (scopeType === 'DEPARTMENT' || scopeType === 'DEPT_DESIGNATION' || scopeType === 'BRAND_DEPT_DESIGNATION') ? department : department,
      subDepartment: subDepartment || undefined,
      designation: (scopeType === 'DESIGNATION' || scopeType === 'DEPT_DESIGNATION' || scopeType === 'BRAND_DEPT_DESIGNATION') ? designation : designation,
      employeeId: scopeType === 'INDIVIDUAL' ? selectedEmployeeId : undefined,
      employeeName: scopeType === 'INDIVIDUAL' ? (selectedEmp?.name || selectedEmp?.title) : undefined,
      location,
      shiftType,
      sopCode,
      summary,
      keyResponsibilities: respList,
      keyCompetencies: compList,
      kpiTargets: kpiList,
      educationalRequirements: education,
      experienceRequirements: experience,
      reportingToTitle,
      approvalMatrix: {
        preparedByName,
        preparedByTitle,
        reviewedByName,
        reviewedByTitle,
        approvedByName,
        approvedByTitle
      },
      status,
      currentVersion: version,
      versions: existingJD ? [newVersionEntry, ...existingJD.versions] : [newVersionEntry],
      createdAt: existingJD ? existingJD.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveJD(finalJD, !existingJD);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-5xl h-[94vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Top Header with Sample Loader Button */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-red-600/30 text-red-400 border border-red-500/30 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {isEditing ? 'Edit Job Description Specification' : 'Upload & Enter Job Description (Every Area Data)'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-mono uppercase tracking-wider shrink-0">
                  Admin Control
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Centralized entry for all organizational, operational, KPI, and approval parameters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Sample Button: Loads Every Single Area */}
            <button
              type="button"
              onClick={handleLoadEveryAreaSample}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Instantly pre-fill every area with complete production-grade RMG sample data"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Load Full Sample Data</span>
              <span className="sm:hidden">Sample</span>
            </button>

            {/* Mode Toggle: Form vs PDF Live Preview */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  activeTab === 'form'
                    ? 'bg-red-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit className="w-3 h-3" />
                <span>Form Entry</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-red-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Live Format Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'form' ? (
          /* FORM ENTRY TAB (ALL AREAS ORGANIZED LOGICALLY) */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs text-slate-800 dark:text-slate-200">
            
            {/* AREA 1: PDF Document File Attachment */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-lg shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Area 1: Official PDF Document File Attachment
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {uploadedFileName ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Attached PDF: {uploadedFileName} ({fileSize})
                        </span>
                      ) : (
                        'All Job Descriptions are backed by PDF format. Select a .pdf file or use the system auto-generated PDF.'
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-semibold text-xs cursor-pointer inline-flex items-center gap-2 shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadedFileName ? 'Replace PDF File' : 'Select PDF File'}</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* AREA 2: 7-Tier Hierarchy Priority Scope */}
            <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Area 2: Hierarchy Scope & Assignment Priority Level (1 to 7)</span>
                </label>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  Governs Automated Distribution
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {[
                  { id: 'INDIVIDUAL', title: 'Priority 1: Individual Override', desc: 'Customized scope for a specific employee ID.' },
                  { id: 'BRAND_DEPT_DESIGNATION', title: 'Priority 2: Brand + Dept + Role', desc: 'Exact triple match criteria.' },
                  { id: 'DEPT_DESIGNATION', title: 'Priority 3: Dept + Designation Standard', desc: 'Factory standard for role in department.' },
                  { id: 'BRAND', title: 'Priority 4: Brand Charter', desc: 'Applies to all employees under this brand.' },
                  { id: 'DEPARTMENT', title: 'Priority 5: Department Charter', desc: 'Universal department-wide operational charter.' },
                  { id: 'DESIGNATION', title: 'Priority 6: Designation Wide', desc: 'Cross-department standard for this title.' },
                  { id: 'GENERAL', title: 'Priority 7: Factory General Default', desc: 'Baseline RMG factory conduct & expectations.' },
                ].map((tier) => (
                  <label
                    key={tier.id}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${
                      scopeType === tier.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scopeType"
                      value={tier.id}
                      checked={scopeType === tier.id}
                      onChange={() => setScopeType(tier.id as JDScopeType)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-xs">{tier.title}</div>
                      <div className={`text-[10px] leading-snug mt-0.5 ${scopeType === tier.id ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {tier.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* AREA 3: Classification & Organizational Assignment */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-500" />
                <span>Area 3: Organizational Classification & Targeting</span>
              </div>

              {scopeType === 'INDIVIDUAL' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Target Employee (Special Override Scope) *
                  </label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => {
                      setSelectedEmployeeId(e.target.value);
                      const emp = allNodes.find((n) => n.id === e.target.value);
                      if (emp) {
                        setDepartment(emp.department);
                        setDesignation(emp.title);
                        if (emp.brand) setBrand(emp.brand);
                        setTitle(`Special JD - ${emp.name || emp.title} (${emp.department})`);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Employee from Organogram Tree --</option>
                    {allNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name ? `${n.name} · ` : ''}{n.title} ({n.department} - ID: {n.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Brand / Business Unit
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-hidden"
                  >
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-hidden"
                  >
                    {availableDepartments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sub-Department / Section
                  </label>
                  <input
                    type="text"
                    value={subDepartment}
                    onChange={(e) => setSubDepartment(e.target.value)}
                    placeholder="e.g. Line Balancing & Automation"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Designation Grade / Role
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-hidden"
                  >
                    {availableDesignations.map((desig) => (
                      <option key={desig} value={desig}>{desig}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Impact Counter */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-950 dark:text-emerald-200">
                    Live Organogram Impact: <strong>{affectedEmployees.length} matching positions</strong> will receive this JD automatically.
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                  {affectedEmployees.length} Mapped
                </span>
              </div>
            </div>

            {/* AREA 4: Document Header, SOP & Facility Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Official Position Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Operations Manager - High-Performance Apparel"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Document Job Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateCode}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Plant / Facility Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Turag Complex, Plant-1 (Gazipur)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Shift Schedule Pattern
                </label>
                <input
                  type="text"
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value)}
                  placeholder="e.g. Day Shift (8:00 AM - 5:00 PM)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ISO Standard Operating Procedure (SOP) Code
                </label>
                <input
                  type="text"
                  value={sopCode}
                  onChange={(e) => setSopCode(e.target.value)}
                  placeholder="e.g. TURAG-HR-SOP-JD-2026/V4"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reports Directly To
                </label>
                <input
                  type="text"
                  value={reportingToTitle}
                  onChange={(e) => setReportingToTitle(e.target.value)}
                  placeholder="e.g. Deputy General Manager (DGM)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Version Release
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Effective Date
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono focus:outline-hidden"
                />
              </div>
            </div>

            {/* AREA 5: Executive Summary & Job Purpose */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Area 5: Executive Summary & Primary Objective *
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                placeholder="Executive overview of the operational responsibility..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            {/* AREA 6: Key Responsibilities */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Area 6: Key Responsibilities & Core Accountabilities (One per line) *
                </label>
                <span className="text-[10px] text-slate-400">
                  {responsibilitiesText.split('\n').filter((l) => l.trim()).length} Items Entered
                </span>
              </div>
              <textarea
                value={responsibilitiesText}
                onChange={(e) => setResponsibilitiesText(e.target.value)}
                rows={5}
                placeholder="Direct daily strategic production schedules across Cutting, Sewing, Finishing...&#10;Enforce 100% adherence to RSC, Sedex, WRAP protocols...&#10;Lead monthly line balancing and SMV optimization..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            {/* AREA 7: Quantifiable KPIs & Competencies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Area 7A: Target KPIs & Quantifiable Benchmarks (One per line)
                </label>
                <textarea
                  value={kpisText}
                  onChange={(e) => setKpisText(e.target.value)}
                  rows={4}
                  placeholder="Factory-Wide SMV Efficiency >= 68.5%&#10;On-Time In-Full (OTIF) Shipment >= 98.8%&#10;Final Quality Audit First-Time Pass >= 99%"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Area 7B: Required Competency Framework (One per line)
                </label>
                <textarea
                  value={competenciesText}
                  onChange={(e) => setCompetenciesText(e.target.value)}
                  rows={4}
                  placeholder="Lean Manufacturing & Six Sigma methodology&#10;FastReact & Production Planning Systems&#10;Labor law & social compliance codes"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono focus:outline-hidden"
                />
              </div>
            </div>

            {/* AREA 8: Education & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Area 8A: Academic Qualification Benchmark
                </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Area 8B: Experience Requirement Benchmark
                </label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-hidden"
                />
              </div>
            </div>

            {/* AREA 9: Document Control & Approval Matrix Sign-Off Block */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-slate-500" />
                <span>Area 9: Multi-Tier Governance & Approval Matrix Sign-Off</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">1. Prepared By (HR Ops)</span>
                  <input
                    type="text"
                    value={preparedByName}
                    onChange={(e) => setPreparedByName(e.target.value)}
                    placeholder="Name: Md. Kamrul Hasan"
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold mb-1"
                  />
                  <input
                    type="text"
                    value={preparedByTitle}
                    onChange={(e) => setPreparedByTitle(e.target.value)}
                    placeholder="Title: HR Operations Lead"
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-slate-500"
                  />
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">2. Reviewed By (Dept Head)</span>
                  <input
                    type="text"
                    value={reviewedByName}
                    onChange={(e) => setReviewedByName(e.target.value)}
                    placeholder="Name: Alomgir Hossain"
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold mb-1"
                  />
                  <input
                    type="text"
                    value={reviewedByTitle}
                    onChange={(e) => setReviewedByTitle(e.target.value)}
                    placeholder="Title: Deputy General Manager"
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-slate-500"
                  />
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">3. Approved By (Executive)</span>
                  <input
                    type="text"
                    value={approvedByName}
                    onChange={(e) => setApprovedByName(e.target.value)}
                    placeholder="Name: Syed Tanvir Ahmed"
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold mb-1"
                  />
                  <input
                    type="text"
                    value={approvedByTitle}
                    onChange={(e) => setApprovedByTitle(e.target.value)}
                    placeholder="Title: Managing Director & CEO"
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[11px] text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Changelog & Revision Notes
                </label>
                <input
                  type="text"
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="e.g. Official comprehensive specification covering all area parameters."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs focus:outline-hidden"
                />
              </div>
            </div>

            {/* Publication Status & Action Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Status:
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                  />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active (Published)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="pending_approval"
                    checked={status === 'pending_approval'}
                    onChange={() => setStatus('pending_approval')}
                  />
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Pending Review</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4 text-slate-300" />
                  <span>Preview PDF Format</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs shadow-md flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Save & Reassign JD' : 'Upload & Deploy JD'}</span>
                </button>
              </div>
            </div>

          </form>
        ) : (
          /* LIVE PDF FORMAT PREVIEW TAB (WHAT WILL BE RENDERED IN THE FORMAL PDF) */
          <div className="flex-1 overflow-y-auto bg-slate-950 p-6 flex flex-col items-center">
            <div className="mb-4 flex items-center justify-between w-full max-w-[850px] text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>Live Document Preview (Generated from your entries)</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Back to Form Entry</span>
              </button>
            </div>

            {/* Rendered Formal PDF Layout */}
            <div className="w-full max-w-[850px] bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 font-sans border border-slate-300 text-xs leading-relaxed">
              {/* Formal Header */}
              <div className="border-b-2 border-red-900 pb-4 mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-auto flex items-center justify-center p-1 border border-slate-200 bg-white">
                      <img 
                        src={turagLogo} 
                        alt="Turag Garments Logo" 
                        className="h-10 w-auto max-w-[140px] object-contain block"
                      />
                    </div>
                    <div>
                      <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                        Turag Garments And Hosiery Limited
                      </h1>
                      <p className="text-[10px] text-slate-600 font-semibold">
                        Human Resources & Industrial Relations Directorate · ISO 9001:2015 Compliant
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono">
                        Standard Operating Procedure: {sopCode}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[10px]">
                    <div className="font-mono font-bold text-red-900 text-xs">
                      {code}
                    </div>
                    <div className="text-slate-600">
                      Version: <strong>{version}</strong>
                    </div>
                    <div className="text-slate-500">
                      Effective: {effectiveDate}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                  <h2 className="text-sm font-black tracking-widest text-slate-900 uppercase">
                    Job Description & Key Responsibilities Specification
                  </h2>
                  <div className="inline-block mt-1 px-3 py-0.5 bg-slate-100 border border-slate-300 text-[10px] font-bold text-slate-700 uppercase tracking-wider rounded">
                    Scope: {scopeType.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {/* Comprehensive Metadata Table */}
              <div className="border border-slate-300 mb-6 rounded overflow-hidden">
                <table className="w-full border-collapse text-[11px]">
                  <tbody>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <td className="p-2 font-bold text-slate-700 w-1/4 border-r border-slate-200">
                        Position Title
                      </td>
                      <td className="p-2 font-bold text-slate-900 w-1/4 border-r border-slate-200">
                        {title}
                      </td>
                      <td className="p-2 font-bold text-slate-700 w-1/4 border-r border-slate-200">
                        Job Code
                      </td>
                      <td className="p-2 font-mono font-bold text-slate-900 w-1/4">
                        {code}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold text-slate-700 border-r border-slate-200">
                        Department
                      </td>
                      <td className="p-2 text-slate-900 border-r border-slate-200">
                        {department}
                      </td>
                      <td className="p-2 font-bold text-slate-700 border-r border-slate-200">
                        Sub-Department
                      </td>
                      <td className="p-2 text-slate-900">
                        {subDepartment || 'General Operations'}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <td className="p-2 font-bold text-slate-700 border-r border-slate-200">
                        Brand / Division
                      </td>
                      <td className="p-2 text-slate-900 border-r border-slate-200">
                        {brand}
                      </td>
                      <td className="p-2 font-bold text-slate-700 border-r border-slate-200">
                        Facility Location
                      </td>
                      <td className="p-2 text-slate-900">
                        {location}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold text-slate-700 border-r border-slate-200">
                        Designation Grade
                      </td>
                      <td className="p-2 text-slate-900 border-r border-slate-200">
                        {designation}
                      </td>
                      <td className="p-2 font-bold text-slate-700 border-r border-slate-200">
                        Reports Directly To
                      </td>
                      <td className="p-2 font-semibold text-slate-900">
                        {reportingToTitle}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <td className="p-2 font-bold text-slate-700 border-r border-slate-200">
                        Shift Pattern
                      </td>
                      <td colSpan={3} className="p-2 text-slate-900">
                        {shiftType}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 1. Job Summary */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 border-b border-red-200 pb-1 mb-2">
                  1. Primary Job Purpose & Executive Summary
                </h3>
                <p className="text-slate-800 text-justify text-[11px] leading-relaxed bg-slate-50/50 p-3 rounded border border-slate-200">
                  {summary}
                </p>
              </div>

              {/* 2. Key Responsibilities */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 border-b border-red-200 pb-1 mb-2 flex items-center justify-between">
                  <span>2. Key Responsibilities & Daily Operational Accountabilities</span>
                  <span className="text-[10px] font-normal text-slate-500 font-mono">
                    {responsibilitiesText.split('\n').filter((l) => l.trim()).length} Mandatory Deliverables
                  </span>
                </h3>
                <div className="space-y-2 mt-2">
                  {responsibilitiesText.split('\n').filter((l) => l.trim()).map((resp, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[11px] text-slate-800">
                      <span className="font-mono font-bold text-red-800 text-[10px] mt-0.5 w-5 shrink-0 text-right">
                        {i + 1}.
                      </span>
                      <p className="flex-1 leading-snug">{resp}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. KPIs */}
              {kpisText.trim() && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 border-b border-red-200 pb-1 mb-2">
                    3. Target Key Performance Indicators (KPIs)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {kpisText.split('\n').filter((l) => l.trim()).map((kpi, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-start gap-2">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                          {kpi}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Competencies & Qualifications */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-900 border-b border-red-200 pb-1 mb-2">
                  4. Required Professional Competencies & Qualification Framework
                </h3>
                <div className="space-y-3 mt-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Core Technical & Managerial Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {competenciesText.split('\n').filter((l) => l.trim()).map((comp, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-medium text-slate-800">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        Academic Background:
                      </span>
                      <p className="text-[11px] text-slate-800 font-medium">
                        {education}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                        Work Experience Benchmark:
                      </span>
                      <p className="text-[11px] text-slate-800 font-medium">
                        {experience}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Document Control & Approval Matrix Sign-Off Block */}
              <div className="mt-8 pt-6 border-t-2 border-slate-300">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4 text-center">
                  Official Document Sign-off & Revision Governance
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-[10px]">
                  <div className="border border-slate-300 p-3 rounded bg-slate-50">
                    <div className="text-slate-500 font-semibold mb-6">Prepared By (HR Ops)</div>
                    <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                      {preparedByName}
                    </div>
                    <div className="text-slate-500 text-[9px]">{preparedByTitle}</div>
                    <div className="font-mono text-[9px] text-slate-400 mt-0.5">{effectiveDate}</div>
                  </div>

                  <div className="border border-slate-300 p-3 rounded bg-slate-50">
                    <div className="text-slate-500 font-semibold mb-6">Reviewed By (Dept Head)</div>
                    <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                      {reviewedByName}
                    </div>
                    <div className="text-slate-500 text-[9px]">{reviewedByTitle}</div>
                    <div className="font-mono text-[9px] text-slate-400 mt-0.5">{effectiveDate}</div>
                  </div>

                  <div className="border border-slate-300 p-3 rounded bg-slate-50">
                    <div className="text-slate-500 font-semibold mb-6">Approved By (Executive)</div>
                    <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                      {approvedByName}
                    </div>
                    <div className="text-slate-500 text-[9px]">{approvedByTitle}</div>
                    <div className="font-mono text-[9px] text-slate-400 mt-0.5">Turag Garments Ltd.</div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-slate-200">
                  <span>Turag Garments And Hosiery Limited · Confidential Internal Document</span>
                  <span>Page 1 of 1 · System Code: {code}</span>
                </div>
              </div>

            </div>

            {/* Deploy Shortcut Button */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Back to Edit Fields
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs shadow-md flex items-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Deploy Job Description</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
