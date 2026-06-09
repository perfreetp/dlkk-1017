import type { FollowUp, Template, Phrase, DoctorProfile } from '../types';

export const mockFollowUps: FollowUp[] = [
  {
    id: 'F001',
    patientId: 'P001',
    scheduleDate: '2024-06-17',
    scheduleTime: '09:00',
    type: 'reexamination',
    status: 'pending',
    notes: '心梗术后2周复查，评估恢复情况，调药',
    reminder: true,
    reminderDate: '2024-06-16',
    createDate: '2024-06-10'
  },
  {
    id: 'F002',
    patientId: 'P002',
    scheduleDate: '2024-06-12',
    scheduleTime: '14:30',
    type: 'medication',
    status: 'pending',
    notes: '复查电解质、INR、肾功能，调整利尿剂',
    reminder: true,
    reminderDate: '2024-06-11',
    createDate: '2024-06-10'
  },
  {
    id: 'F003',
    patientId: 'P003',
    scheduleDate: '2024-06-14',
    scheduleTime: '10:00',
    type: 'checkup',
    status: 'pending',
    notes: '冠脉造影术前评估',
    reminder: true,
    reminderDate: '2024-06-13',
    createDate: '2024-06-10'
  },
  {
    id: 'F004',
    patientId: 'P001',
    scheduleDate: '2024-06-03',
    type: 'reexamination',
    status: 'completed',
    feedback: '患者术后恢复良好，胸痛症状消失，生命体征平稳。心电图ST段较前回落。继续当前药物治疗方案。',
    completedDate: '2024-06-03',
    reminder: false,
    createDate: '2024-05-28'
  },
  {
    id: 'F005',
    patientId: 'P004',
    scheduleDate: '2024-06-24',
    scheduleTime: '15:00',
    type: 'phone',
    status: 'pending',
    notes: '电话随访血压控制情况',
    reminder: true,
    reminderDate: '2024-06-24',
    createDate: '2024-06-09'
  },
  {
    id: 'F006',
    patientId: 'P005',
    scheduleDate: '2024-06-08',
    type: 'checkup',
    status: 'missed',
    notes: '房颤复律后复查Holter',
    reminder: false,
    createDate: '2024-06-01'
  },
  {
    id: 'F007',
    patientId: 'P010',
    scheduleDate: '2024-06-20',
    scheduleTime: '08:30',
    type: 'reexamination',
    status: 'pending',
    notes: 'PCI术后1月复查，评估支架通畅情况',
    reminder: true,
    reminderDate: '2024-06-19',
    createDate: '2024-06-10'
  },
  {
    id: 'F008',
    patientId: 'P007',
    scheduleDate: '2024-06-11',
    scheduleTime: '11:00',
    type: 'medication',
    status: 'pending',
    notes: '心衰重症患者，密切观察液体负荷情况，BNP复查',
    reminder: true,
    reminderDate: '2024-06-11',
    createDate: '2024-06-10'
  }
];

export const mockTemplates: Template[] = [
  {
    id: 'T001',
    name: '急性心梗标准首诊',
    category: 'diagnosis',
    content: '主诉：持续性胸痛X小时，伴大汗、恶心、呕吐。\n现病史：患者于X小时前无明显诱因出现胸骨后压榨样疼痛，向左肩背部放射，持续不缓解，含服硝酸甘油无效。\n既往史：高血压病史X年，糖尿病X年，高血脂X年，吸烟X年。\n查体：BP X/Y mmHg，HR X次/分，心肺腹查体。\n辅助检查：心电图示ST段改变，心肌酶升高。\n初步诊断：急性ST段抬高型心肌梗死。\n处理：急诊PCI，DAPT，抗凝，他汀，β受体阻滞剂等。',
    usageCount: 128,
    createTime: '2024-01-15',
    isDefault: true
  },
  {
    id: 'T002',
    name: '心衰随访模板',
    category: 'advice',
    content: '患者本次随访一般情况：精神、食欲、睡眠（好/一般/差）。\n主诉：有无胸闷、气短、夜间阵发性呼吸困难。\n查体：血压 mmHg，心率 次/分，体重 kg，下肢水肿（无/轻/中/重）。\n辅助检查：BNP/NT-proBNP：pg/mL，电解质，肾功能，心电图。\n评估：心功能NYHA分级 I/II/III/IV级。\n治疗调整：利尿剂/ACEI/β受体阻滞剂/MRA/SGLT2i调整。\n下次随访：1周/2周/1月后。',
    usageCount: 86,
    createTime: '2024-02-20',
    isDefault: true
  },
  {
    id: 'T003',
    name: '高血压初诊模板',
    category: 'symptom',
    content: '主诉：发现血压升高（时间），伴（头晕/头痛/心悸/无明显症状）。\n现病史：最高血压 mmHg，有无规律服药，服药种类及剂量。\n既往史：糖尿病/高血脂/冠心病/脑卒中。\n家族史：父母有无高血压病史。\n个人史：吸烟 年，饮酒 年，盐摄入（多/中/少），运动情况。\n查体：BP mmHg（双上肢），HR 次/分，身高 cm，体重 kg，BMI kg/m²，腰围 cm。\n辅助检查：血常规、生化、尿常规、心电图、心脏超声。\n危险分层：低危/中危/高危/很高危。\n治疗方案：生活方式干预+药物治疗。',
    usageCount: 72,
    createTime: '2024-03-05'
  },
  {
    id: 'T004',
    name: '心绞痛标准问诊',
    category: 'symptom',
    content: '胸痛特点：\n- 部位：胸骨后/心前区/其他\n- 性质：压榨样/紧缩样/烧灼样/针刺样\n- 诱因：劳累/情绪激动/饱餐/寒冷/休息时\n- 持续时间：分钟\n- 缓解方式：休息/硝酸甘油XX分钟缓解\n- 放射：左肩/左臂/下颌/背部\n伴随症状：出汗/恶心/呕吐/心悸/呼吸困难/晕厥\n发作频率：次/日，次/周\n发作程度：CCS分级 I/II/III/IV级\n既往用药：硝酸甘油使用效果',
    usageCount: 54,
    createTime: '2024-03-18'
  },
  {
    id: 'T005',
    name: '冠脉介入术后用药',
    category: 'prescription',
    content: '1. 阿司匹林肠溶片 100mg qd 口服 长期\n2. 替格瑞洛片 90mg bid 口服 12个月（或氯吡格雷75mg qd）\n3. 阿托伐他汀钙片 40mg qn 口服 长期（LDL目标<1.8mmol/L）\n4. 美托洛尔缓释片 47.5mg qd 口服 长期（根据心率调整）\n5. 贝那普利片 10mg qd 口服 长期（根据血压调整）\n6. 泮托拉唑肠溶片 40mg qd 口服 1-3个月（胃黏膜保护）\n注意事项：\n- 观察有无出血倾向（黑便、牙龈出血、皮肤瘀斑）\n- 监测肝功能、肌酶（他汀类）\n- 定期复查心电图、心肌酶、血脂\n- 若出现胸痛再发立即就诊',
    usageCount: 95,
    createTime: '2024-01-10',
    isDefault: true
  }
];

export const mockPhrases: Phrase[] = [
  { id: 'PH001', text: '患者一般情况可，生命体征平稳', category: '通用描述', usageCount: 156 },
  { id: 'PH002', text: '心肺查体未见明显异常', category: '查体', usageCount: 142 },
  { id: 'PH003', text: '双肺呼吸音清，未闻及干湿啰音', category: '查体', usageCount: 128 },
  { id: 'PH004', text: '心律齐，各瓣膜区未闻及病理性杂音', category: '查体', usageCount: 118 },
  { id: 'PH005', text: '腹软，无压痛反跳痛，肝脾未触及', category: '查体', usageCount: 96 },
  { id: 'PH006', text: '双下肢无水肿', category: '查体', usageCount: 88 },
  { id: 'PH007', text: '建议完善相关检查明确诊断', category: '处置', usageCount: 76 },
  { id: 'PH008', text: '继续当前治疗方案，观察病情变化', category: '处置', usageCount: 72 },
  { id: 'PH009', text: '定期复诊，不适随诊', category: '处置', usageCount: 98 },
  { id: 'PH010', text: '心电图窦性心律，大致正常心电图', category: '辅助检查', usageCount: 65 },
  { id: 'PH011', text: '心肌酶、肌钙蛋白未见明显异常', category: '辅助检查', usageCount: 52 },
  { id: 'PH012', text: '心脏超声：各房室腔大小正常，LVEF约XX%', category: '辅助检查', usageCount: 45 },
  { id: 'PH013', text: '注意休息，避免劳累和情绪激动', category: '健康指导', usageCount: 82 },
  { id: 'PH014', text: '低盐低脂饮食，戒烟限酒', category: '健康指导', usageCount: 78 },
  { id: 'PH015', text: '规律服药，切忌自行停药或换药', category: '健康指导', usageCount: 70 }
];

export const mockDoctorProfile: DoctorProfile = {
  name: '李明华',
  title: '主任医师',
  department: '心血管内科',
  hospital: '上海交通大学附属第一人民医院',
  licenseNo: '11031000000XXXX',
  phone: '138****8888',
  email: 'liminghua@hospital.sh.cn'
};
