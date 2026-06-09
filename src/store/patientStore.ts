import { create } from 'zustand';
import type { Patient, PatientGroup } from '../types';
import { mockPatients } from '../data/patients';

interface PatientState {
  patients: Patient[];
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
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: mockPatients,
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
      const levelOrder = { critical: 0, warning: 1, stable: 2, normal: 3 };
      return levelOrder[a.riskLevel] - levelOrder[b.riskLevel];
    });

    return result;
  },

  getPatientById: (id) => get().patients.find((p) => p.id === id)
}));
