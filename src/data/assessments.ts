import type { RiskAssessment, DoctorAdvice } from '../types';

export const mockRiskAssessments: RiskAssessment[] = [
  {
    id: 'A001',
    patientId: 'P001',
    assessmentDate: '2024-06-10',
    overallRisk: 'critical',
    score: 185,
    graceScore: 185,
    timiScore: 5,
    riskFactors: [
      { name: '年龄>75岁', weight: 30, description: '患者68岁，接近高龄阈值', level: 'warning' },
      { name: '心率>100bpm', weight: 20, description: '当前心率88次/分，需密切监测', level: 'warning' },
      { name: '收缩压升高', weight: 25, description: '入院时SBP 156mmHg', level: 'warning' },
      { name: '心肌损伤标志物升高', weight: 45, description: 'cTnI 15.6ng/mL，显著升高', level: 'critical' },
      { name: 'Killip分级II级以上', weight: 35, description: '双肺底可闻及湿啰音', level: 'warning' },
      { name: 'ST段改变', weight: 30, description: '心电图ST段显著抬高', level: 'critical' }
    ],
    recommendations: [
      '持续心电监护，密切监测生命体征',
      '维持双重抗血小板治疗（阿司匹林+替格瑞洛）',
      '加用他汀类强化降脂治疗（阿托伐他汀40mg qn）',
      '继续β受体阻滞剂控制心率',
      'ACEI/ARB改善心室重构',
      '严格控制血糖，目标糖化血红蛋白<7%'
    ],
    warnings: [
      '高出血风险：需监测HAS-BLED评分=3',
      '注意监测肾功能，避免造影剂肾病',
      '警惕支架内血栓形成风险',
      '糖尿病患者注意低血糖发作'
    ]
  },
  {
    id: 'A002',
    patientId: 'P002',
    assessmentDate: '2024-06-10',
    overallRisk: 'warning',
    score: 142,
    hasBledScore: 4,
    riskFactors: [
      { name: 'LVEF<35%', weight: 40, description: 'LVEF仅30%，重度心功能不全', level: 'critical' },
      { name: 'BNP显著升高', weight: 35, description: 'BNP 3200pg/mL，提示心衰严重', level: 'critical' },
      { name: '肾功能不全', weight: 25, description: '肌酐128μmol/L，eGFR降低', level: 'warning' },
      { name: '华法林抗凝', weight: 20, description: 'INR 2.3，治疗范围内', level: 'stable' },
      { name: '低钾血症风险', weight: 22, description: '血钾3.4mmol/L，利尿剂使用中', level: 'warning' }
    ],
    recommendations: [
      '优化利尿剂方案，减轻容量负荷',
      '监测并纠正低钾血症，维持K+>4.0mmol/L',
      '调整β受体阻滞剂剂量至靶剂量',
      '评估加用SGLT2抑制剂适应症',
      'INR维持2.0-3.0，每周监测1次',
      '限制液体入量<1500mL/天，低钠饮食'
    ],
    warnings: [
      'HAS-BLED评分4分，高出血风险',
      '地高辛浓度处于治疗窗低值，注意中毒征象',
      '肾功能持续下降需调整药物剂量',
      '警惕血栓栓塞事件（房颤+低EF）'
    ]
  },
  {
    id: 'A003',
    patientId: 'P003',
    assessmentDate: '2024-06-10',
    overallRisk: 'warning',
    score: 98,
    graceScore: 110,
    timiScore: 3,
    riskFactors: [
      { name: '家族早发冠心病史', weight: 15, description: '兄弟50岁心梗', level: 'warning' },
      { name: '吸烟史', weight: 20, description: '吸烟20年，每日15支', level: 'warning' },
      { name: '高脂血症未控制', weight: 25, description: 'LDL-C 3.6mmol/L，未达标', level: 'warning' },
      { name: '心绞痛反复发作', weight: 30, description: 'CCS分级II-III级', level: 'warning' },
      { name: '糖耐量异常', weight: 15, description: 'IGT状态，糖尿病前期', level: 'stable' }
    ],
    recommendations: [
      '建议择期冠脉造影明确病变',
      '强化降脂治疗，LDL-C目标<1.8mmol/L',
      '严格戒烟，评估戒烟药物辅助',
      '启动β受体阻滞剂+CCB抗缺血治疗',
      '生活方式干预，控制体重',
      '定期监测血糖变化'
    ],
    warnings: [
      '警惕斑块不稳定进展为急性心梗',
      '戒烟初期可能出现戒断症状和应激',
      '他汀类注意肌痛和肝功能监测'
    ]
  }
];

export const mockDoctorAdvices: DoctorAdvice[] = [
  {
    id: 'AD001',
    patientId: 'P001',
    createDate: '2024-06-10',
    medications: [
      { name: '阿司匹林肠溶片', dose: '100mg', frequency: 'qd', route: '口服', duration: '长期' },
      { name: '替格瑞洛片', dose: '90mg', frequency: 'bid', route: '口服', duration: '12个月' },
      { name: '阿托伐他汀钙片', dose: '40mg', frequency: 'qn', route: '口服', duration: '长期' },
      { name: '美托洛尔缓释片', dose: '47.5mg', frequency: 'qd', route: '口服', duration: '长期' },
      { name: '贝那普利片', dose: '10mg', frequency: 'qd', route: '口服', duration: '长期' },
      { name: '门冬胰岛素30注射液', dose: '12U/10U', frequency: '早晚餐前', route: '皮下注射' }
    ],
    medicationChecks: [
      { medication: '阿司匹林+替格瑞洛', status: 'warning', message: '双重抗血小板，高出血风险，需监测便隐血、皮肤瘀斑' },
      { medication: '阿托伐他汀40mg', status: 'pass', message: '强化降脂方案，目标LDL-C<1.8mmol/L' },
      { medication: '贝那普利+二甲双胍', status: 'warning', message: '可能增加肾功能损伤风险，定期监测肌酐' }
    ],
    examRecommendations: [
      { examType: '床旁心电图', reason: '每日动态监测ST-T变化', urgency: 'daily' },
      { examType: '心肌酶谱+BNP', reason: '评估心梗后恢复及心功能', urgency: 'qod' },
      { examType: '超声心动图', reason: '评估LVEF及室壁运动', urgency: 'routine' },
      { examType: '便隐血', reason: 'DAPT治疗期间出血监测', urgency: 'weekly' }
    ],
    contraindications: [
      '绝对禁忌：禁用NSAIDs类解热镇痛药（与DAPT冲突）',
      '相对禁忌：避免使用可能延长QT间期的药物',
      '饮食：严格限盐（<3g/天）、低脂低糖饮食',
      '活动：急性期绝对卧床，恢复期循序渐进康复训练'
    ],
    lifestyleAdvice: [
      '戒烟限酒，避免二手烟暴露',
      '糖尿病饮食，规律监测血糖',
      '保持情绪稳定，避免过度劳累和情绪激动',
      '保持大便通畅，避免用力排便',
      '充足睡眠，作息规律'
    ],
    notes: '患者急性前壁心梗PCI术后第9天，目前生命体征尚平稳。继续当前药物治疗方案，本周再次评估后可考虑出院。注意监测血糖控制情况，内分泌会诊已建议调整胰岛素方案。'
  }
];
