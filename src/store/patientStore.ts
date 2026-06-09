import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  addFirstVisitRecord: (record: Omit<FirstVisitRecord, 'id' | 'visitDate' | 'doctor'> & {
    symptoms: string;
    presentIllness: string;
    pastHistory?: string[];
    medicalHistory?: string[];
    medications: MedicationItem[];
    allergies?: string | string[];
  }) => FirstVisitRecord;

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
  getRiskAssessmentByPatientId: (pid: string) => RiskAssessment | undefined;
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

const isValidValue = (v: any): boolean =>
  v !== undefined && v !== null && v !== '' && v !== 0;

const buildStore = (): PatientState => ({
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

  setSearchKeyword: (keyword) => (state) => ({ searchKeyword: keyword }),
  setCurrentGroup: (group) => (state) => ({ currentGroup: group }),
  setSelectedPatient: (id) => (state) => ({ selectedPatientId: id }),

  toggleFavorite: (id) =>
    (state) => ({
      patients: state.patients.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      )
    }),

  toggleCritical: (id) =>
    (state) => ({
      patients: state.patients.map((p) =>
        p.id === id ? { ...p, isCritical: !p.isCritical } : p
      )
    }),

  getFilteredPatients: function (this: PatientState) {
    const { patients, searchKeyword, currentGroup } = this;
    let result = [...patients];

    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.patientNo.includes(kw) ||
          p.diagnosis.toLowerCase().includes(kw) ||
          (p.bedNo && p.bedNo.toLowerCase().includes(kw)) ||
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

  getPatientById: function (this: PatientState, id) {
    return this.patients.find((p) => p.id === id);
  },

  getFirstVisitRecordsByPatientId: function (this: PatientState, pid) {
    return [...this.firstVisitRecords]
      .filter((r) => r.patientId === pid)
      .sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1));
  },

  addFirstVisitRecord: function (this: PatientState, record) {
    const historyArr = record.pastHistory && record.pastHistory.length > 0
      ? record.pastHistory
      : (record.medicalHistory && record.medicalHistory.length > 0 ? record.medicalHistory : []);

    let allergiesArr: string[] = [];
    if (Array.isArray(record.allergies)) {
      allergiesArr = record.allergies;
    } else if (typeof record.allergies === 'string' && record.allergies.trim()) {
      allergiesArr = record.allergies
        .split(/[,、，\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const newRecord: FirstVisitRecord = {
      id: genId('FV'),
      patientId: record.patientId || '',
      visitDate: todayStr(),
      doctor: '李医生',
      department: '心内科',
      familyHistory: record.familyHistory || [],
      personalHistory: record.personalHistory || '',
      symptoms: record.symptoms,
      presentIllness: record.presentIllness,
      pastHistory: historyArr,
      medicalHistory: historyArr,
      medications: record.medications || [],
      allergies: allergiesArr
    };
    this.firstVisitRecords = [newRecord, ...this.firstVisitRecords];
    return newRecord;
  },

  getExamResultsByPatientId: function (this: PatientState, pid) {
    return [...this.examResults]
      .filter((e) => e.patientId === pid)
      .sort((a, b) => (a.examDate < b.examDate ? 1 : -1));
  },

  getLatestExamByPatientId: function (this: PatientState, pid) {
    return this.getExamResultsByPatientId(pid)[0];
  },

  addExamResult: function (this: PatientState, pid, data) {
    const prev = this.getLatestExamByPatientId(pid);

    // ========== 1. 生命体征：只合并有效值，prev不存在时不注入默认值 ==========
    const normVitals = data.vitalSigns ? (() => {
      const s = data.vitalSigns as any;
      const raw: any = {
        systolicBP: s.bpSystolic || s.systolicBP,
        diastolicBP: s.bpDiastolic || s.diastolicBP,
        heartRate: s.heartRate,
        respiratoryRate: s.respiratoryRate,
        temperature: s.temperature || s.temperatureC,
        oxygenSaturation: s.spo2 || s.oxygenSaturation,
        bpSystolic: s.bpSystolic || s.systolicBP,
        bpDiastolic: s.bpDiastolic || s.diastolicBP,
        spo2: s.spo2 || s.oxygenSaturation,
        temperatureC: s.temperature || s.temperatureC
      };
      return Object.fromEntries(
        Object.entries(raw).filter(([, v]) => isValidValue(v))
      );
    })() : {};

    // prev存在则从prev继承，不存在则不用默认值（{}），保持"空"
    const prevVitalsClean = prev?.vitalSigns
      ? Object.fromEntries(
          Object.entries(prev.vitalSigns as any).filter(([, v]) => isValidValue(v))
        )
      : {};

    const mergedVitalsEntries = { ...prevVitalsClean, ...normVitals };
    const hasAnyVital = Object.keys(mergedVitalsEntries).length > 0;
    const finalVitalSigns = hasAnyVital
      ? ({
          ...mergedVitalsEntries,
          measureTime: new Date().toISOString().slice(0, 16)
        } as ExamResult['vitalSigns'])
      : undefined;

    // ========== 2. ECG：结论非空才合并 ==========
    const normEcg = data.ecg ? (() => {
      const e = data.ecg as any;
      return {
        type: e.ecgType || e.type || '12导联心电图',
        ecgType: e.ecgType || e.type || '12导联心电图',
        conclusion: e.conclusion || '',
        heartRate: isValidValue(e.heartRate) ? e.heartRate : undefined,
        rhythm: e.rhythm || '窦性心律',
        remark: e.description || e.remark || '',
        description: e.description || e.remark || ''
      };
    })() : undefined;

    const mergedEcg = (normEcg && normEcg.conclusion.trim())
      ? (() => {
          // 填充prev里的heartRate如果本次没填
          if (!isValidValue(normEcg.heartRate) && prev?.ecg && isValidValue(prev.ecg.heartRate)) {
            normEcg.heartRate = prev.ecg.heartRate;
          }
          return normEcg as ExamResult['ecg'];
        })()
      : prev?.ecg;

    // ========== 3. 化验：本次有化验项则用本次，否则沿用prev ==========
    const normLabs: LabTestItem[] = (data.labTests || [])
      .filter((l: any) => isValidValue(l.value))
      .map((l: any) => ({
        name: l.name,
        value: l.value,
        unit: l.unit,
        referenceRange: l.refRange || l.referenceRange || '',
        refRange: l.refRange || l.referenceRange || '',
        isAbnormal: l.abnormal !== undefined ? l.abnormal : (l.isAbnormal || false),
        abnormal: l.abnormal !== undefined ? l.abnormal : (l.isAbnormal || false),
        trend: l.trend || 'normal'
      }));

    const finalLabs = normLabs.length > 0 ? normLabs : prev?.labTests;

    const newResult: ExamResult = {
      id: genId('EX'),
      patientId: pid,
      examDate: todayStr(),
      doctor: '李医生',
      vitalSigns: finalVitalSigns,
      ecg: mergedEcg,
      labTests: finalLabs,
      imaging: prev?.imaging
    };

    this.examResults = [newResult, ...this.examResults];
    return newResult;
  },

  getRiskAssessmentsByPatientId: function (this: PatientState, pid) {
    return [...this.riskAssessments]
      .filter((a) => a.patientId === pid)
      .sort((a, b) => (a.assessmentDate < b.assessmentDate ? 1 : -1));
  },

  getRiskAssessmentByPatientId: function (this: PatientState, pid) {
    return this.getRiskAssessmentsByPatientId(pid)[0];
  },

  getDoctorAdviceByPatientId: function (this: PatientState, pid) {
    return this.doctorAdvices.find((a) => a.patientId === pid);
  },

  getAllFollowUps: function (this: PatientState) {
    return [...this.followUps].sort((a, b) => {
      const statusOrder = { pending: 0, missed: 1, completed: 2, cancelled: 3 } as const;
      if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
      return a.scheduleDate < b.scheduleDate ? -1 : 1;
    });
  },

  getFollowUpsByPatientId: function (this: PatientState, pid) {
    return [...this.followUps]
      .filter((f) => f.patientId === pid)
      .sort((a, b) => (a.scheduleDate < b.scheduleDate ? 1 : -1));
  },

  getFollowUpById: function (this: PatientState, fid) {
    return this.followUps.find((f) => f.id === fid);
  },

  getLatestOrNewFollowUp: function (this: PatientState, pid, fid) {
    if (fid) return this.getFollowUpById(fid);
    return this.getFollowUpsByPatientId(pid)[0];
  },

  addFollowUp: function (this: PatientState, data) {
    const newF: FollowUp = {
      id: genId('FU'),
      status: 'pending',
      createDate: todayStr(),
      ...data
    };
    this.followUps = [newF, ...this.followUps];
    return newF;
  },

  updateFollowUpStatus: function (this: PatientState, fid, status, feedback) {
    let updated: FollowUp | undefined;
    this.followUps = this.followUps.map((f) => {
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
    });
    return updated;
  },

  getAllTemplates: function (this: PatientState) {
    return [...this.templates];
  },

  getAllPhrases: function (this: PatientState) {
    return [...this.phrases];
  },

  getPhrasesByCategory: function (this: PatientState, cat) {
    return this.phrases.filter((p) => p.category === cat);
  },

  searchPhrases: function (this: PatientState, kw) {
    if (!kw.trim()) return this.getAllPhrases();
    const k = kw.trim().toLowerCase();
    return this.phrases.filter(
      (p) => p.text.toLowerCase().includes(k) || p.category.toLowerCase().includes(k)
    );
  },

  incrementPhraseUsage: function (this: PatientState, pid) {
    this.phrases = this.phrases.map((p) =>
      p.id === pid ? { ...p, usageCount: p.usageCount + 1 } : p
    );
  }
});

const bind = (store: any): any => {
  const keys = Object.keys(store);
  for (const k of keys) {
    const val = store[k];
    if (typeof val === 'function' && val.toString().includes('this.')) {
      store[k] = val.bind(store);
    }
  }
  return store;
};

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => {
      const store = buildStore() as any;

      const wrappedSet: any = (partial: any) => {
        if (typeof partial === 'function') {
          const updated = partial(get());
          Object.assign(store, updated);
          set(updated);
        } else {
          Object.assign(store, partial);
          set(partial);
        }
      };

      // 把setter和getter注入store（this方式）
      Object.assign(store, { set: wrappedSet, get });

      // 将所有this函数绑定到store实例
      const bound = bind({ ...store });

      // 暴露给外部（store方法里的this修改会直接修改state对象）
      Object.keys(bound).forEach((k) => {
        if (typeof bound[k] === 'function') {
          store[k] = (...args: any[]) => {
            const result = bound[k](...args);
            // 手动同步到zustand：检测8个数据集变化
            wrappedSet({
              patients: store.patients,
              firstVisitRecords: store.firstVisitRecords,
              examResults: store.examResults,
              riskAssessments: store.riskAssessments,
              doctorAdvices: store.doctorAdvices,
              followUps: store.followUps,
              templates: store.templates,
              phrases: store.phrases,
              searchKeyword: store.searchKeyword,
              currentGroup: store.currentGroup,
              selectedPatientId: store.selectedPatientId
            });
            return result;
          };
        }
      });

      // 返回给zustand的方法（用箭头函数包装get/set）
      const r: any = { ...bound };

      // 把纯函数方法/属性（非this依赖的）保留下来
      r.searchKeyword = store.searchKeyword;
      r.currentGroup = store.currentGroup;
      r.selectedPatientId = store.selectedPatientId;
      r.patients = store.patients;
      r.firstVisitRecords = store.firstVisitRecords;
      r.examResults = store.examResults;
      r.riskAssessments = store.riskAssessments;
      r.doctorAdvices = store.doctorAdvices;
      r.followUps = store.followUps;
      r.templates = store.templates;
      r.phrases = store.phrases;

      // 纯函数（用get()替代this）
      r.setSearchKeyword = (keyword: string) => wrappedSet({ searchKeyword: keyword });
      r.setCurrentGroup = (group: PatientGroup) => wrappedSet({ currentGroup: group });
      r.setSelectedPatient = (id: string | null) => wrappedSet({ selectedPatientId: id });
      r.toggleFavorite = (id: string) => wrappedSet((state: any) => ({
        patients: state.patients.map((p: Patient) => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
      }));
      r.toggleCritical = (id: string) => wrappedSet((state: any) => ({
        patients: state.patients.map((p: Patient) => p.id === id ? { ...p, isCritical: !p.isCritical } : p)
      }));

      r.getFilteredPatients = () => {
        const s: any = get();
        let result = [...s.patients];
        if (s.searchKeyword.trim()) {
          const kw = s.searchKeyword.trim().toLowerCase();
          result = result.filter((p: any) =>
            p.name.toLowerCase().includes(kw) ||
            p.patientNo.includes(kw) ||
            p.diagnosis.toLowerCase().includes(kw) ||
            (p.bedNo && p.bedNo.toLowerCase().includes(kw)) ||
            p.tags.some((t: string) => t.toLowerCase().includes(kw))
          );
        }
        switch (s.currentGroup) {
          case 'favorites': result = result.filter((p: any) => p.isFavorite); break;
          case 'critical': result = result.filter((p: any) => p.isCritical); break;
          case 'ward_a': result = result.filter((p: any) => p.ward === 'A区'); break;
          case 'ward_b': result = result.filter((p: any) => p.ward === 'B区'); break;
          case 'outpatient': result = result.filter((p: any) => !p.ward); break;
        }
        result.sort((a: any, b: any) => {
          if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
          const levelOrder = { critical: 0, warning: 1, stable: 2, normal: 3 } as const;
          return levelOrder[a.riskLevel] - levelOrder[b.riskLevel];
        });
        return result;
      };
      r.getPatientById = (id: string) => get().patients.find((p: Patient) => p.id === id);
      r.getFirstVisitRecordsByPatientId = (pid: string) =>
        [...get().firstVisitRecords].filter((r: FirstVisitRecord) => r.patientId === pid).sort((a: any, b: any) => a.visitDate < b.visitDate ? 1 : -1);
      r.getExamResultsByPatientId = (pid: string) =>
        [...get().examResults].filter((e: ExamResult) => e.patientId === pid).sort((a: any, b: any) => a.examDate < b.examDate ? 1 : -1);
      r.getLatestExamByPatientId = (pid: string) => r.getExamResultsByPatientId(pid)[0];
      r.getRiskAssessmentsByPatientId = (pid: string) =>
        [...get().riskAssessments].filter((a: RiskAssessment) => a.patientId === pid).sort((a: any, b: any) => a.assessmentDate < b.assessmentDate ? 1 : -1);
      r.getRiskAssessmentByPatientId = (pid: string) => r.getRiskAssessmentsByPatientId(pid)[0];
      r.getDoctorAdviceByPatientId = (pid: string) => get().doctorAdvices.find((a: DoctorAdvice) => a.patientId === pid);
      r.getAllFollowUps = () =>
        [...get().followUps].sort((a: any, b: any) => {
          const o = { pending: 0, missed: 1, completed: 2, cancelled: 3 } as const;
          if (o[a.status] !== o[b.status]) return o[a.status] - o[b.status];
          return a.scheduleDate < b.scheduleDate ? -1 : 1;
        });
      r.getFollowUpsByPatientId = (pid: string) =>
        [...get().followUps].filter((f: FollowUp) => f.patientId === pid).sort((a: any, b: any) => a.scheduleDate < b.scheduleDate ? 1 : -1);
      r.getFollowUpById = (fid: string) => get().followUps.find((f: FollowUp) => f.id === fid);
      r.getLatestOrNewFollowUp = (pid: string, fid?: string) => fid ? r.getFollowUpById(fid) : r.getFollowUpsByPatientId(pid)[0];
      r.getAllTemplates = () => [...get().templates];
      r.getAllPhrases = () => [...get().phrases];
      r.getPhrasesByCategory = (cat: string) => get().phrases.filter((p: Phrase) => p.category === cat);
      r.searchPhrases = (kw: string) => {
        if (!kw.trim()) return r.getAllPhrases();
        const k = kw.trim().toLowerCase();
        return get().phrases.filter((p: Phrase) => p.text.toLowerCase().includes(k) || p.category.toLowerCase().includes(k));
      };

      return r;
    },
    {
      name: 'cardio-app-storage',
      partialize: (state: any) => ({
        firstVisitRecords: state.firstVisitRecords,
        examResults: state.examResults,
        followUps: state.followUps,
        searchKeyword: state.searchKeyword,
        currentGroup: state.currentGroup,
        selectedPatientId: state.selectedPatientId,
        favoriteMap: state.patients.filter((p: Patient) => p.isFavorite).map((p: Patient) => p.id),
        criticalMap: state.patients.filter((p: Patient) => p.isCritical).map((p: Patient) => p.id)
      }),
      merge: (persistedState: any, currentState: any) => {
        const merged: any = { ...currentState, ...persistedState };
        // 同步收藏/急重症标记到patients
        if (persistedState?.favoriteMap || persistedState?.criticalMap) {
          merged.patients = merged.patients.map((p: Patient) => ({
            ...p,
            isFavorite: persistedState?.favoriteMap?.includes(p.id) ?? p.isFavorite,
            isCritical: persistedState?.criticalMap?.includes(p.id) ?? p.isCritical
          }));
        }
        return merged;
      },
      onRehydrateStorage: () => (state: any) => {
        console.log('[Zustand persist] 从localStorage恢复数据', state ? '成功' : '无缓存');
      },
      version: 1
    }
  )
);
