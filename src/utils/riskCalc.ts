import type { RiskLevel, Patient, ExamResult, VitalSigns } from '../types';

export const getRiskLevelColor = (level: RiskLevel): string => {
  const colorMap: Record<RiskLevel, string> = {
    critical: '#EF4444',
    warning: '#F59E0B',
    stable: '#10B981',
    normal: '#6B7280'
  };
  return colorMap[level];
};

export const getRiskLevelBg = (level: RiskLevel): string => {
  const bgMap: Record<RiskLevel, string> = {
    critical: 'rgba(239, 68, 68, 0.12)',
    warning: 'rgba(245, 158, 11, 0.12)',
    stable: 'rgba(16, 185, 129, 0.12)',
    normal: 'rgba(107, 114, 128, 0.12)'
  };
  return bgMap[level];
};

export const getRiskLevelText = (level: RiskLevel): string => {
  const textMap: Record<RiskLevel, string> = {
    critical: '急危',
    warning: '关注',
    stable: '稳定',
    normal: '常规'
  };
  return textMap[level];
};

export const calculateGraceScore = (patient: Patient, vitals?: VitalSigns): number => {
  let score = 0;
  const age = patient.age;

  if (age >= 80) score += 100;
  else if (age >= 70) score += 80;
  else if (age >= 60) score += 60;
  else if (age >= 50) score += 40;
  else if (age >= 40) score += 20;

  if (vitals) {
    const hr = vitals.heartRate;
    const sbp = vitals.systolicBP;

    if (hr >= 140) score += 46;
    else if (hr >= 120) score += 36;
    else if (hr >= 100) score += 26;
    else if (hr >= 80) score += 16;
    else if (hr < 60) score += 10;

    if (sbp < 80) score += 58;
    else if (sbp < 100) score += 43;
    else if (sbp < 120) score += 23;
    else if (sbp < 140) score += 11;
  }

  if (patient.riskLevel === 'critical') score += 50;
  if (patient.isCritical) score += 30;

  return score;
};

export const calculateTimiScore = (patient: Patient): number => {
  let score = 0;
  const tags = patient.tags.join(',');

  if (patient.age >= 65) score++;
  if (tags.includes('高血压')) score++;
  if (tags.includes('糖尿病')) score++;
  if (tags.includes('高血脂')) score++;
  if (tags.includes('吸烟')) score++;
  if (tags.includes('冠心病') || tags.includes('心梗') || tags.includes('心绞痛')) score++;
  if (patient.riskLevel === 'critical' || patient.riskLevel === 'warning') score++;

  return score;
};

export const calculateHasBledScore = (patient: Patient): number => {
  let score = 0;
  const tags = patient.tags.join(',');

  if (patient.age >= 65) score++;
  if (tags.includes('高血压')) score++;
  if (tags.includes('肝功能异常') || tags.includes('肾功能') || tags.includes('肌酐')) score++;
  if (tags.includes('脑卒中') || tags.includes('脑梗') || tags.includes('中风')) score++;
  if (tags.includes('出血')) score++;
  if (tags.includes('INR') || tags.includes('华法林') || tags.includes('抗凝')) score++;
  if (tags.includes('阿司匹林') || tags.includes('抗血小板') || tags.includes('DAPT')) score++;
  if (tags.includes('酗酒') || tags.includes('饮酒')) score++;
  if (tags.includes('药物相互作用') || tags.includes('NSAIDs')) score++;

  return score;
};

export const getBPRiskLevel = (systolic: number, diastolic: number): RiskLevel => {
  if (systolic >= 180 || diastolic >= 110) return 'critical';
  if (systolic >= 160 || diastolic >= 100) return 'warning';
  if (systolic >= 140 || diastolic >= 90) return 'stable';
  return 'normal';
};

export const getHeartRateRiskLevel = (hr: number): RiskLevel => {
  if (hr >= 130 || hr < 40) return 'critical';
  if (hr >= 110 || hr < 50) return 'warning';
  if (hr >= 100 || hr < 60) return 'stable';
  return 'normal';
};
