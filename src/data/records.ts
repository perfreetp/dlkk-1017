import type { FirstVisitRecord, ExamResult } from '../types';

export const mockFirstVisitRecords: FirstVisitRecord[] = [
  {
    id: 'R001',
    patientId: 'P001',
    visitDate: '2024-06-01',
    symptoms: '患者于2小时前无明显诱因出现持续性胸骨后压榨样疼痛，向左肩背部放射，伴大汗淋漓、恶心呕吐，含服硝酸甘油无效。',
    presentIllness: '患者既往有高血压病史10年，糖尿病病史8年，规律服药控制。本次发病前无明显劳累、情绪激动等诱因。胸痛持续不缓解，遂急诊入院。',
    pastHistory: ['高血压病10年', '2型糖尿病8年', '高脂血症5年', '吸烟史30年', '饮酒史20年'],
    familyHistory: ['父亲冠心病史', '母亲高血压病史'],
    medications: [
      { name: '苯磺酸氨氯地平片', dose: '5mg', frequency: 'qd', route: '口服' },
      { name: '二甲双胍缓释片', dose: '0.5g', frequency: 'bid', route: '口服' },
      { name: '阿托伐他汀钙片', dose: '20mg', frequency: 'qn', route: '口服' }
    ],
    allergies: ['青霉素过敏'],
    personalHistory: '吸烟30年，每日约20支；饮酒20年，每日白酒约2两。适龄结婚，育有1子1女。',
    doctor: '李主任',
    department: '心血管内科'
  },
  {
    id: 'R002',
    patientId: 'P002',
    visitDate: '2024-05-28',
    symptoms: '患者1周前开始出现活动后胸闷、气短，平地快走约200米即出现，休息后约5分钟可缓解，伴夜间阵发性呼吸困难，不能平卧。',
    presentIllness: '患者既往有扩张型心肌病病史5年，心功能不全病史3年，长期服用利尿剂及ACEI类药物。近1周因受凉后症状加重，伴下肢水肿、食欲减退。',
    pastHistory: ['扩张型心肌病5年', '慢性心功能不全3年', '持续性房颤2年', '甲状腺功能减退症1年'],
    familyHistory: ['无特殊家族史'],
    medications: [
      { name: '呋塞米片', dose: '20mg', frequency: 'qd', route: '口服' },
      { name: '螺内酯片', dose: '25mg', frequency: 'qd', route: '口服' },
      { name: '培哚普利片', dose: '4mg', frequency: 'qd', route: '口服' },
      { name: '地高辛片', dose: '0.125mg', frequency: 'qd', route: '口服' },
      { name: '华法林钠片', dose: '2.5mg', frequency: 'qd', route: '口服' }
    ],
    allergies: [],
    personalHistory: '无烟酒嗜好。绝经18年。',
    doctor: '王医生',
    department: '心血管内科'
  },
  {
    id: 'R003',
    patientId: 'P003',
    visitDate: '2024-06-05',
    symptoms: '患者3天前开始出现反复心前区闷痛，位于胸骨后，范围约手掌大小，每次持续5-10分钟，休息或含服硝酸甘油可缓解，每日发作2-3次。昨晚睡前再次发作，程度较前加重，持续约15分钟缓解。',
    presentIllness: '患者既往有高血脂病史6年，未规律服药。3天前劳累后出现胸痛，逐渐加重，发作频率增加。',
    pastHistory: ['高脂血症6年', '糖耐量异常2年'],
    familyHistory: ['哥哥50岁患心肌梗死'],
    medications: [
      { name: '瑞舒伐他汀钙片', dose: '10mg', frequency: 'qn', route: '口服' }
    ],
    allergies: [],
    personalHistory: '吸烟20年，每日15支；偶尔饮酒。',
    doctor: '李主任',
    department: '心血管内科'
  }
];

export const mockExamResults: ExamResult[] = [
  {
    id: 'E001',
    patientId: 'P001',
    examDate: '2024-06-10 08:30',
    vitalSigns: {
      systolicBP: 156,
      diastolicBP: 92,
      heartRate: 88,
      respiratoryRate: 18,
      temperature: 36.8,
      oxygenSaturation: 96,
      measureTime: '2024-06-10 08:30'
    },
    ecg: {
      type: '12导联心电图',
      conclusion: '窦性心律，V1-V4导联ST段弓背向上抬高0.2-0.4mV，考虑急性前壁心肌梗死图形',
      heartRate: 88,
      rhythm: '窦性心律，偶发房早',
      remark: '与入院时心电图比较，ST段较前回落，考虑再灌注治疗有效'
    },
    labTests: [
      { name: '肌钙蛋白I(cTnI)', value: '15.6', unit: 'ng/mL', referenceRange: '0-0.04', isAbnormal: true, trend: 'up' },
      { name: '肌酸激酶同工酶(CK-MB)', value: '86', unit: 'U/L', referenceRange: '0-25', isAbnormal: true, trend: 'down' },
      { name: 'B型钠尿肽(BNP)', value: '1250', unit: 'pg/mL', referenceRange: '0-100', isAbnormal: true, trend: 'up' },
      { name: '空腹血糖', value: '8.6', unit: 'mmol/L', referenceRange: '3.9-6.1', isAbnormal: true, trend: 'normal' },
      { name: '总胆固醇', value: '5.8', unit: 'mmol/L', referenceRange: '<5.2', isAbnormal: true, trend: 'down' },
      { name: '低密度脂蛋白', value: '3.6', unit: 'mmol/L', referenceRange: '<3.4', isAbnormal: true, trend: 'down' },
      { name: '血钾', value: '4.2', unit: 'mmol/L', referenceRange: '3.5-5.3', isAbnormal: false, trend: 'normal' },
      { name: '肌酐', value: '88', unit: 'μmol/L', referenceRange: '57-97', isAbnormal: false, trend: 'normal' }
    ],
    imaging: [
      {
        type: '心脏超声',
        part: '心脏',
        conclusion: '左室前壁节段性运动异常，左室射血分数(LVEF)48%，左室舒张功能减退',
        reportDate: '2024-06-02'
      },
      {
        type: '冠状动脉造影',
        part: '冠状动脉',
        conclusion: '前降支近段100%闭塞，已行PCI术，植入支架1枚；右冠中段50%狭窄',
        reportDate: '2024-06-01'
      }
    ],
    doctor: '李主任'
  },
  {
    id: 'E002',
    patientId: 'P002',
    examDate: '2024-06-10 09:00',
    vitalSigns: {
      systolicBP: 108,
      diastolicBP: 66,
      heartRate: 92,
      respiratoryRate: 20,
      temperature: 36.5,
      oxygenSaturation: 94,
      measureTime: '2024-06-10 09:00'
    },
    ecg: {
      type: '12导联心电图',
      conclusion: '房颤心律，心室率约90次/分，肢体导联低电压',
      heartRate: 92,
      rhythm: '心房颤动',
      remark: '心室率较前控制可'
    },
    labTests: [
      { name: 'B型钠尿肽(BNP)', value: '3200', unit: 'pg/mL', referenceRange: '0-100', isAbnormal: true, trend: 'up' },
      { name: 'INR', value: '2.3', unit: '', referenceRange: '2.0-3.0', isAbnormal: false, trend: 'normal' },
      { name: '血钾', value: '3.4', unit: 'mmol/L', referenceRange: '3.5-5.3', isAbnormal: true, trend: 'down' },
      { name: '肌酐', value: '128', unit: 'μmol/L', referenceRange: '41-73', isAbnormal: true, trend: 'normal' },
      { name: '地高辛浓度', value: '0.9', unit: 'ng/mL', referenceRange: '0.5-2.0', isAbnormal: false, trend: 'normal' }
    ],
    imaging: [
      {
        type: '心脏超声',
        part: '心脏',
        conclusion: '全心增大，以左室为著，左室射血分数(LVEF)30%，左室壁弥漫性运动减弱，二尖瓣中量返流',
        reportDate: '2024-05-29'
      }
    ],
    doctor: '王医生'
  }
];
