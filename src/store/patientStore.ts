import { create } from 'zustand';
import type {
  Patient,
  PatientGroup,
  FirstVisitRecord,
  ExamResult,
  RiskAssessment,
  DoctorAdvice,
  FollowUp,
  Template,
  Phrase,
  MedicationItem,
  LabTestItem
} from '../types';
import { mockPatients } from '../data/patients';
import { mockFirstVisitRecords, mockExamResults } from '../data/records';
import { mockRiskAssessments, mockDoctorAdvices } from '../data/assessments';
import { mockFollowUps, mockTemplates, mockPhrases } from '../data/followups';

interface PatientState {
  patients: Patient[];
  firstVisitRecords: FirstVisitRecord[];
  examResults: ExamResult[];
  riskAssessments: RiskAssessment[];
  doctorAdvices: DoctorAdvice[];
  followUps: FollowUp[];
  templates: Template[];
  phrases: Phrase[];

  searchKeyword: string;
  currentGroup: PatientGroup;
  selectedPatientId: string | null;

  setSearchKeyword: (keyword: string) => void;
  setCurrentGroup: (group: PatientGroup) => void;
  setSelectedPatient: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  toggleCritical: (id: string) => void;
  getFilteredPatients: () => Patient[];
  getPatientById: (id: string) => Patient | undefined;

  getFirstVisitRecordsByPatientId: (pid: string) => FirstVisitRecord[];
  addFirstVisitRecord: (record: Omit<FirstVisitRecord, 'id' | 'visitDate' | 'doctor'> & { symptoms: string; presentIllness: string; pastHistory: string[]; medications: MedicationItem[]; allergies: string[] }) => FirstVisitRecord;

  getExamResultsByPatientId: (pid: string) => ExamResult[];
  getLatestExamByPatientId: (pid: string) => ExamResult | undefined;
  addExamResult: (
    pid: string,
    data: {
      vitalSigns?: ExamResult['vitalSigns'];
      ecg?: ExamResult['ecg'];
      labTests?: LabTestItem[];
    }
  ) => ExamResult;

  getRiskAssessmentsByPatientId: (pid: string) => RiskAssessment[];
  getDoctorAdviceByPatientId: (pid: string) => DoctorAdvice | undefined;

  getAllFollowUps: () => FollowUp[];
  getFollowUpsByPatientId: (pid: string) => FollowUp[];
  getFollowUpById: (fid: string) => FollowUp | undefined;
  getLatestOrNewFollowUp: (pid: string, fid?: string) => FollowUp | undefined;
  addFollowUp: (data: Omit<FollowUp, 'id' | 'status' | 'createDate'> & { patientId: string }) => FollowUp;
  updateFollowUpStatus: (fid: string, status: FollowUp['status'], feedback?: string) => FollowUp | undefined;

  getAllTemplates: () => Template[];

  getAllPhrases: () => Phrase[];
  getPhrasesByCategory: (cat: string) => Phrase[];
  searchPhrases: (kw: string) => Phrase[];
  incrementPhraseUsage: (pid: string) => void;
}

const genId = (prefix: string) => `${prefix}${Date.now().toString(36).slice(-6).toUpperCase()}`;
const todayStr = () => new Date().toISOString().slice(0, 10);

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: mockPatients,
  firstVisitRecords: mockFirstVisitRecords,
  examResults: mockExamResults,
  riskAssessments: mockRiskAssessments,
  doctorAdvices: mockDoctorAdvices,
  followUps: mockFollowUps,
  templates: mockTemplates,
  phrases: mockPhrases,

  searchKeyword: '',
  currentGroup: 'all',
  selectedPatientId: null,

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setCurrentGroup: (group) => set({ currentGroup: group }),
  setSelectedPatient: (id) => set({ selectedPatientId: id }),

  toggleFavorite: (id) =>
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      )
    })),

  toggleCritical: (id) =>
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id === id ? { ...p, isCritical: !p.isCritical } : p
      )
    })),

  getFilteredPatients: () => {
    const { patients, searchKeyword, currentGroup } = get();
    let result = [...patients];

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.patientNo.includes(kw) ||
          p.diagnosis.toLowerCase().includes(kw) ||
          p.bedNo?.toLowerCase().includes(kw) ||
          p.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }

    switch (currentGroup) {
      case 'favorites':
        result = result.filter((p) => p.isFavorite);
        break;
      case 'critical':
        result = result.filter((p) => p.isCritical);
        break;
      case 'ward_a':
        result = result.filter((p) => p.ward === 'A区');
        break;
      case 'ward_b':
        result = result.filter((p) => p.ward === 'B区');
        break;
      case 'outpatient':
        result = result.filter((p) => !p.ward);
        break;
    }

    result.sort((a, b) => {
      if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
      const levelOrder = { critical: 0, warning: 1, stable: 2, normal: 3 } as const;
      return levelOrder[a.riskLevel] - levelOrder[b.riskLevel];
    });

    return result;
  },

  getPatientById: (id) => get().patients.find((p) => p.id === id),

  getFirstVisitRecordsByPatientId: (pid) =>
    get()
      .firstVisitRecords.filter((r) => r.patientId === pid)
      .sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1)),

  addFirstVisitRecord: (record) => {
    const newRecord: FirstVisitRecord = {
      id: genId('FV'),
      patientId: record.patientId || '',
      visitDate: todayStr(),
      doctor: '李医生',
      department: '心内科',
      familyHistory: [],
      personalHistory: '',
      symptoms: record.symptoms,
      presentIllness: record.presentIllness,
      pastHistory: record.pastHistory,
      medications: record.medications,
      allergies: record.allergies
    };
    set((state) => ({
      firstVisitRecords: [newRecord, ...state.firstVisitRecords]
    }));
    return newRecord;
  },

  getExamResultsByPatientId: (pid) =>
    get()
      .examResults.filter((e) => e.patientId === pid)
      .sort((a, b) => (a.examDate < b.examDate ? 1 : -1)),

  getLatestExamByPatientId: (pid) => get().getExamResultsByPatientId(pid)[0],

  addExamResult: (pid, data) => {
    const prev = get().getLatestExamByPatientId(pid);

    const mergedVitals = {
      ...(prev?.vitalSigns || {
        systolicBP: 130,
        diastolicBP: 80,
        heartRate: 75,
        measureTime: new Date().toISOString().slice(0, 16)
      }),
      ...(data.vitalSigns && Object.fromEntries(
        Object.entries(data.vitalSigns).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 0)
      ))
    } as ExamResult['vitalSigns'];

    const mergedEcg = data.ecg?.conclusion?.trim() ? data.ecg : prev?.ecg;

    const newResult: ExamResult = {
      id: genId('EX'),
      patientId: pid,
      examDate: todayStr(),
      doctor: '李医生',
      vitalSigns: {
        ...mergedVitals,
        measureTime: new Date().toISOString().slice(0, 16)
      },
      ecg: mergedEcg,
      labTests: (data.labTests && data.labTests.length > 0) ? data.labTests : prev?.labTests,
      imaging: prev?.imaging
    };

    set((state) => ({
      examResults: [newResult, ...state.examResults]
    }));
    return newResult;
  },

  getRiskAssessmentsByPatientId: (pid) =>
    get()
      .riskAssessments.filter((a) => a.patientId === pid)
      .sort((a, b) => (a.assessmentDate < b.assessmentDate ? 1 : -1)),

  getDoctorAdviceByPatientId: (pid) =>
    get().doctorAdvices.find((a) => a.patientId === pid),

  getAllFollowUps: () =>
    [...get().followUps].sort((a, b) => {
      const statusOrder = { pending: 0, missed: 1, completed: 2, cancelled: 3 } as const;
      if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
      return a.scheduleDate < b.scheduleDate ? -1 : 1;
    }),

  getFollowUpsByPatientId: (pid) =>
    get()
      .followUps.filter((f) => f.patientId === pid)
      .sort((a, b) => (a.scheduleDate < b.scheduleDate ? 1 : -1)),

  getFollowUpById: (fid) => get().followUps.find((f) => f.id === fid),

  getLatestOrNewFollowUp: (pid, fid) => {
    if (fid) return get().getFollowUpById(fid);
    return get().getFollowUpsByPatientId(pid)[0];
  },

  addFollowUp: (data) => {
    const newF: FollowUp = {
      id: genId('FU'),
      status: 'pending',
      createDate: todayStr(),
      ...data
    };
    set((state) => ({
      followUps: [newF, ...state.followUps]
    }));
    return newF;
  },

  updateFollowUpStatus: (fid, status, feedback) => {
    let updated: FollowUp | undefined;
    set((state) => ({
      followUps: state.followUps.map((f) => {
        if (f.id === fid) {
          updated = {
            ...f,
            status,
            feedback: feedback || f.feedback,
            completedDate: status === 'completed' ? todayStr() : f.completedDate
          };
          return updated;
        }
        return f;
      })
    }));
    return updated;
  },

  getAllTemplates: () => [...get().templates],

  getAllPhrases: () => [...get().phrases],

  getPhrasesByCategory: (cat) => get().phrases.filter((p) => p.category === cat),

  searchPhrases: (kw) => {
    if (!kw.trim()) return get().getAllPhrases();
    const k = kw.trim().toLowerCase();
    return get().phrases.filter(
      (p) => p.text.toLowerCase().includes(k) || p.category.toLowerCase().includes(k)
    );
  },

  incrementPhraseUsage: (pid) =>
    set((state) => ({
      phrases: state.phrases.map((p) =>
        p.id === pid ? { ...p, usageCount: p.usageCount + 1 } : p
      )
    }))
}));
