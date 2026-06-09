export type RiskLevel = 'critical' | 'warning' | 'stable' | 'normal';

export type PatientGroup = 'all' | 'favorites' | 'critical' | 'ward_a' | 'ward_b' | 'outpatient';

export interface Patient {
  id: string;
  name: string;
  gender: '男' | '女';
  age: number;
  bedNo?: string;
  ward?: string;
  patientNo: string;
  diagnosis: string;
  chiefComplaint: string;
  riskLevel: RiskLevel;
  isFavorite: boolean;
  isCritical: boolean;
  admissionDate: string;
  lastVisitDate: string;
  phone: string;
  idCardNo: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  tags: string[];
}

export interface VitalSigns {
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  measureTime: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  spo2?: number;
  temperatureC?: number;
}

export interface FirstVisitRecord {
  id: string;
  patientId: string;
  visitDate: string;
  symptoms: string;
  presentIllness: string;
  pastHistory: string[];
  medicalHistory?: string[];
  familyHistory: string[];
  medications: MedicationItem[];
  allergies: string[];
  personalHistory: string;
  doctor: string;
  department: string;
}

export interface MedicationItem {
  name: string;
  dose: string;
  frequency: string;
  route: string;
  duration?: string;
}

export interface ExamResult {
  id: string;
  patientId: string;
  examDate: string;
  vitalSigns?: VitalSigns;
  ecg?: {
    type: string;
    conclusion: string;
    heartRate: number;
    rhythm: string;
    remark?: string;
    description?: string;
    ecgType?: string;
  };
  labTests?: LabTestItem[];
  imaging?: ImagingItem[];
  doctor: string;
}

export interface LabTestItem {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  refRange?: string;
  isAbnormal: boolean;
  abnormal?: boolean;
  trend?: 'up' | 'down' | 'normal';
}

export interface ImagingItem {
  type: string;
  part: string;
  conclusion: string;
  reportDate: string;
}

export interface RiskAssessment {
  id: string;
  patientId: string;
  assessmentDate: string;
  overallRisk: RiskLevel;
  score: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
  warnings: string[];
  graceScore?: number;
  hasBledScore?: number;
  timiScore?: number;
}

export interface RiskFactor {
  name: string;
  weight: number;
  description: string;
  level: RiskLevel;
}

export interface DoctorAdvice {
  id: string;
  patientId: string;
  createDate: string;
  medications: MedicationItem[];
  medicationChecks: MedicationCheck[];
  examRecommendations: ExamRecommendation[];
  contraindications: string[];
  lifestyleAdvice: string[];
  notes: string;
}

export interface MedicationCheck {
  medication: string;
  status: 'pass' | 'warning' | 'conflict';
  message: string;
}

export interface ExamRecommendation {
  examType: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergent';
}

export interface FollowUp {
  id: string;
  patientId: string;
  scheduleDate: string;
  scheduleTime?: string;
  type: 'checkup' | 'medication' | 'reexamination' | 'phone';
  status: 'pending' | 'completed' | 'missed' | 'cancelled';
  feedback?: string;
  notes?: string;
  reminder: boolean;
  reminderDate?: string;
  createDate: string;
  completedDate?: string;
}

export interface Template {
  id: string;
  name: string;
  category: 'symptom' | 'diagnosis' | 'prescription' | 'advice';
  content: string;
  usageCount: number;
  createTime: string;
  isDefault?: boolean;
}

export interface Phrase {
  id: string;
  text: string;
  category: string;
  usageCount: number;
}

export interface DoctorProfile {
  name: string;
  title: string;
  department: string;
  hospital: string;
  licenseNo: string;
  phone: string;
  email?: string;
}
