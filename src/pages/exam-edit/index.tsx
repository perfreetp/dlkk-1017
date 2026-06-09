import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import TagBadge from '../../components/TagBadge';
import { usePatientStore } from '../../store/patientStore';
import type { ExamResult, LabTest } from '../../types';
import styles from './index.module.scss';

const DEF_LABS: Omit<LabTest, 'id'>[] = [
  { name: '肌钙蛋白I (cTnI)', value: '', unit: 'ng/mL', refRange: '<0.04', isAbnormal: false },
  { name: '肌钙蛋白T (cTnT)', value: '', unit: 'ng/mL', refRange: '<0.014', isAbnormal: false },
  { name: 'CK-MB', value: '', unit: 'U/L', refRange: '0-25', isAbnormal: false },
  { name: '肌红蛋白', value: '', unit: 'ng/mL', refRange: '28-72', isAbnormal: false },
  { name: 'BNP', value: '', unit: 'pg/mL', refRange: '<100', isAbnormal: false },
  { name: 'NT-proBNP', value: '', unit: 'pg/mL', refRange: '<125', isAbnormal: false },
  { name: '总胆固醇(TC)', value: '', unit: 'mmol/L', refRange: '<5.2', isAbnormal: false },
  { name: '甘油三酯(TG)', value: '', unit: 'mmol/L', refRange: '<1.7', isAbnormal: false },
  { name: 'LDL-C', value: '', unit: 'mmol/L', refRange: '<3.4', isAbnormal: false },
  { name: 'HDL-C', value: '', unit: 'mmol/L', refRange: '>1.0', isAbnormal: false },
  { name: '血糖(GLU)', value: '', unit: 'mmol/L', refRange: '3.9-6.1', isAbnormal: false },
  { name: '肌酐(Cr)', value: '', unit: 'μmol/L', refRange: '57-97', isAbnormal: false },
  { name: '钾(K)', value: '', unit: 'mmol/L', refRange: '3.5-5.3', isAbnormal: false },
  { name: 'INR', value: '', unit: '', refRange: '0.8-1.2', isAbnormal: false },
];

const ExamEditPage: React.FC = () => {
  const router = useRouter();
  const patientId = router.params?.patientId || 'P001';

  const getPatientById = usePatientStore((s) => s.getPatientById);
  const getLatestExamByPatientId = usePatientStore((s) => s.getLatestExamByPatientId);
  const addExamResult = usePatientStore((s) => s.addExamResult);

  const patient = useMemo(() => getPatientById(patientId) || getPatientById('P001'), [patientId, getPatientById]);
  const latest = useMemo(() => getLatestExamByPatientId(patientId), [patientId, getLatestExamByPatientId]);

  useDidShow(() => {
    console.log('[ExamEdit] 录入检查: patientId=', patientId, ' 最近检查=', latest?.id);
  });

  const [activeTab, setActiveTab] = useState<'vitals' | 'lab' | 'ecg' | 'image'>('vitals');

  const [systolicBP, setSystolicBP] = useState<string>('');
  const [diastolicBP, setDiastolicBP] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [respRate, setRespRate] = useState<string>('');
  const [spo2, setSpo2] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  const [labEntries, setLabEntries] = useState<(Omit<LabTest, 'id'> & { _temp: string })[]>(() => {
    const arr = latest?.labTests && latest.labTests.length > 0
      ? latest.labTests.map((t) => ({ ...t, _temp: t.value?.toString() || '' }))
      : DEF_LABS.map((l) => ({ ...l, _temp: '' }));
    return arr;
  });
  const updateLab = (idx: number, field: 'name' | '_temp' | 'unit', v: string) => {
    setLabEntries((prev) => {
      const n = [...prev];
      n[idx] = { ...n[idx], [field]: v };
      try {
        const num = parseFloat(v);
        if (!isNaN(num) && n[idx].refRange) {
          const range = n[idx].refRange;
          let low = NaN, high = NaN;
          if (range.startsWith('<')) high = parseFloat(range.slice(1));
          else if (range.startsWith('>')) low = parseFloat(range.slice(1));
          else if (range.includes('-')) {
            const [a, b] = range.split('-');
            low = parseFloat(a); high = parseFloat(b);
          }
          let abnormal = false;
          if (!isNaN(low) && num < low) abnormal = true;
          if (!isNaN(high) && num > high) abnormal = true;
          n[idx].isAbnormal = abnormal;
        }
      } catch (_) {}
      return n;
    });
  };
  const [customLabOpen, setCustomLabOpen] = useState(false);
  const [customLab, setCustomLab] = useState({ name: '', value: '', unit: '' });
  const addCustomLab = () => {
    if (!customLab.name.trim()) return;
    setLabEntries((prev) => [...prev, {
      name: customLab.name,
      value: '',
      unit: customLab.unit,
      refRange: '',
      isAbnormal: false,
      _temp: customLab.value
    }]);
    setCustomLab({ name: '', value: '', unit: '' });
    setCustomLabOpen(false);
  };

  const [ecgRhythm, setEcgRhythm] = useState(latest?.ecg?.rhythm || '');
  const [ecgRate, setEcgRate] = useState<string>(latest?.ecg?.heartRate?.toString() || '');
  const [ecgConclusion, setEcgConclusion] = useState(latest?.ecg?.conclusion || '');
  const [ecgDetails, setEcgDetails] = useState(latest?.ecg?.description || '');

  const [echoSummary, setEchoSummary] = useState(latest?.echo?.summary || '');
  const [echoLVEF, setEchoLVEF] = useState<string>(latest?.echo?.lvef?.toString() || '');
  const [echoLVDD, setEchoLVDD] = useState<string>(latest?.echo?.lvdd?.toString() || '');
  const [echoOther, setEchoOther] = useState(latest?.imagingSummary || '');

  const handleSave = () => {
    const labTests: LabTest[] = labEntries
      .filter((l) => l._temp && l._temp.trim() !== '')
      .map((l) => ({
        id: `lab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: l.name,
        value: l._temp,
        unit: l.unit,
        refRange: l.refRange,
        isAbnormal: l.isAbnormal
      }));

    const vitalSignsData: ExamResult['vitalSigns'] = {
      bpSystolic: systolicBP ? parseInt(systolicBP) : undefined as any,
      bpDiastolic: diastolicBP ? parseInt(diastolicBP) : undefined as any,
      heartRate: heartRate ? parseInt(heartRate) : undefined as any,
      temperature: temperature ? parseFloat(temperature) : undefined as any,
      respiratoryRate: respRate ? parseInt(respRate) : undefined as any,
      spo2: spo2 ? parseInt(spo2) : undefined as any,
      weight: weight ? parseFloat(weight) : undefined as any
    } as any;

    const payload = {
      patientId: patient!.id,
      vitalSigns: vitalSignsData,
      labTests,
      ecg: (ecgConclusion || ecgRhythm || ecgRate) ? {
        rhythm: ecgRhythm || '窦性心律',
        heartRate: ecgRate ? parseInt(ecgRate) : 75,
        prInterval: undefined as any,
        qrsDuration: undefined as any,
        conclusion: ecgConclusion || '待解读',
        description: ecgDetails || undefined
      } as any : undefined,
      echo: (echoSummary || echoLVEF || echoLVDD) ? {
        lvef: echoLVEF ? parseInt(echoLVEF) : undefined,
        lvdd: echoLVDD ? parseInt(echoLVDD) : undefined,
        summary: echoSummary || undefined,
        efNotes: undefined as any
      } as any : undefined,
      imagingSummary: echoOther || undefined
    };

    console.log('[ExamEdit] 保存 payload=', JSON.stringify(payload, null, 2));
    const saved = addExamResult(patient!.id, payload as any);
    console.log('[ExamEdit] 保存成功 检查ID=', saved.id);

    const parts: string[] = [];
    if (systolicBP && diastolicBP) parts.push(`血压 ${systolicBP}/${diastolicBP}`);
    if (heartRate) parts.push(`心率 ${heartRate}`);
    if (labTests.length) parts.push(`化验 ${labTests.length}项`);
    if (ecgConclusion) parts.push('心电图');
    if (echoLVEF || echoSummary) parts.push('超声');
    Taro.showToast({
      title: parts.length ? `✓ ${parts.join('、')}` : '检查已保存',
      icon: 'none',
      duration: 1400
    });
    setTimeout(() => Taro.navigateBack(), 1000);
  };

  const tabs = [
    { key: 'vitals' as const, label: '生命体征', icon: '❤️' },
    { key: 'lab' as const, label: '化验', icon: '🧪', badge: labEntries.filter(l => l._temp).length },
    { key: 'ecg' as const, label: '心电图', icon: '📈' },
    { key: 'image' as const, label: '影像', icon: '🏥' }
  ];

  if (!patient) {
    return (
      <ScrollView scrollY className={styles.pageWrap}>
        <View style={{ padding: '120rpx 48rpx' }}>
          <Text>未找到患者信息</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16rpx',
        padding: '24rpx',
        background: 'linear-gradient(135deg, rgba(26,115,232,0.06) 0%, rgba(0,191,165,0.06) 100%)',
        borderRadius: '16rpx',
        marginBottom: '20rpx',
        border: '1rpx solid rgba(26,115,232,0.1)'
      }}>
        <View style={{
          width: '72rpx',
          height: '72rpx',
          borderRadius: '36rpx',
          background: 'linear-gradient(135deg,#1A73E8,#00BFA5)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28rpx',
          fontWeight: 700,
          flexShrink: 0
        }}><Text>{patient.name.charAt(0)}</Text></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontSize: '30rpx', fontWeight: 600, color: '#1D2129', display: 'block' }}>
            {patient.name} · {patient.gender}{patient.age}岁
          </Text>
          <Text style={{ fontSize: '22rpx', color: '#86909C', marginTop: '4rpx', display: 'block' }}>
            {patient.bedNo ? `${patient.ward}${patient.bedNo}` : '门诊'} · {patient.patientNo} · {patient.diagnosis}
          </Text>
        </View>
        <TagBadge type={patient.riskLevel} showDot size="sm">
          {latest ? '更新检查' : '新录入'}
        </TagBadge>
      </View>

      {latest && (
        <View style={{
          marginBottom: '20rpx',
          padding: '16rpx 24rpx',
          background: '#FEF3C7',
          borderRadius: '12rpx',
          display: 'flex',
          alignItems: 'center',
          gap: '12rpx'
        }}>
          <Text style={{ fontSize: '28rpx' }}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '24rpx', color: '#92400E', fontWeight: 500, display: 'block' }}>
              最近一次检查：{latest.examDate}
            </Text>
            <Text style={{ fontSize: '22rpx', color: '#B45309', marginTop: '2rpx' }}>
              💾 空白字段将保留上次检查数据，不会被覆盖
            </Text>
          </View>
        </View>
      )}

      <View className={styles.sectionCard}>
        <View className={styles.tabRow}>
          {tabs.map((t) => (
            <View
              key={t.key}
              className={classnames(styles.tabItem, activeTab === t.key && styles.active)}
              onClick={() => setActiveTab(t.key)}
            >
              <Text>{t.icon} {t.label}</Text>
              {t.badge && t.badge > 0 && (
                <Text style={{
                  fontSize: '18rpx',
                  background: '#1A73E8',
                  color: '#fff',
                  padding: '2rpx 10rpx',
                  borderRadius: '20rpx',
                  marginLeft: '6rpx'
                }}>{t.badge}</Text>
              )}
            </View>
          ))}
        </View>

        {activeTab === 'vitals' && (
          <View style={{ paddingTop: '8rpx' }}>
            <View style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20rpx',
              padding: '0 8rpx'
            }}>
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#4E5969' }}>
                {latest?.vitalSigns ? `参考上次: BP ${latest.vitalSigns.bpSystolic}/${latest.vitalSigns.bpDiastolic} / HR ${latest.vitalSigns.heartRate}` : '请填写本次生命体征'}
              </Text>
              <TagBadge type="normal">mmHg / 次/分 / ℃</TagBadge>
            </View>
            <View className={styles.vitalsGrid}>
              {[
                { label: '🩸 收缩压(SBP)', state: systolicBP, setter: setSystolicBP, ph: latest?.vitalSigns?.bpSystolic?.toString() || '130', range: '正常 90-140', unit: 'mmHg', type: 'blue' },
                { label: '🩸 舒张压(DBP)', state: diastolicBP, setter: setDiastolicBP, ph: latest?.vitalSigns?.bpDiastolic?.toString() || '85', range: '正常 60-90', unit: 'mmHg', type: 'blue' },
                { label: '💗 心率(HR)', state: heartRate, setter: setHeartRate, ph: latest?.vitalSigns?.heartRate?.toString() || '78', range: '正常 60-100', unit: '次/分', type: 'pink' },
                { label: '🌡️ 体温(T)', state: temperature, setter: setTemperature, ph: latest?.vitalSigns?.temperature?.toString() || '36.5', range: '正常 36.0-37.3', unit: '℃', type: 'orange' },
                { label: '🫁 呼吸(RR)', state: respRate, setter: setRespRate, ph: latest?.vitalSigns?.respiratoryRate?.toString() || '18', range: '正常 12-20', unit: '次/分', type: 'green' },
                { label: '💨 SpO₂', state: spo2, setter: setSpo2, ph: latest?.vitalSigns?.spo2?.toString() || '98', range: '正常 ≥95%', unit: '%', type: 'teal' }
              ].map((v, idx) => (
                <View key={idx} className={styles.vitalItem}>
                  <Text className={styles.vitalLabel}>{v.label}</Text>
                  <View style={{ display: 'flex', alignItems: 'baseline', gap: '6rpx' }}>
                    <Input
                      className={styles.vitalValue}
                      type="digit"
                      placeholder={v.ph}
                      value={v.state}
                      onInput={(e) => v.setter(e.detail.value)}
                    />
                    <Text style={{ fontSize: '22rpx', color: '#86909C' }}>{v.unit}</Text>
                  </View>
                  <Text className={styles.vitalRange}>{v.range}</Text>
                </View>
              ))}
            </View>

            <View style={{ marginTop: '24rpx', padding: '20rpx 24rpx', background: '#F7F8FA', borderRadius: '12rpx' }}>
              <Text style={{ fontSize: '24rpx', color: '#4E5969', fontWeight: 500, display: 'block', marginBottom: '16rpx' }}>
                🏋️ 基础信息（可选）
              </Text>
              <View style={{ display: 'flex', gap: '16rpx' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: '22rpx', color: '#86909C', marginBottom: '8rpx', display: 'block' }}>体重(kg)</Text>
                  <Input
                    style={{
                      height: '72rpx',
                      background: '#fff',
                      padding: '0 20rpx',
                      borderRadius: '12rpx',
                      fontSize: '28rpx',
                      border: '1rpx solid #E5E6EB'
                    }}
                    type="digit"
                    placeholder={latest?.vitalSigns?.weight?.toString() || '65'}
                    value={weight}
                    onInput={(e) => setWeight(e.detail.value)}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'lab' && (
          <View style={{ paddingTop: '8rpx' }}>
            <View style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20rpx',
              padding: '0 8rpx'
            }}>
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#4E5969' }}>
                心血管常用化验 {labEntries.filter(l => l._temp).length > 0 && `(已填${labEntries.filter(l => l._temp).length}项)`}
              </Text>
              <TagBadge type="warning">异常项自动标红</TagBadge>
            </View>

            <View className={styles.testRow} style={{
              padding: '12rpx 16rpx',
              background: '#F2F3F5',
              borderRadius: '10rpx',
              marginBottom: '12rpx',
              fontSize: '22rpx',
              color: '#86909C'
            }}>
              <Text style={{ flex: 2, fontSize: '22rpx', fontWeight: 500 }}>检验项目</Text>
              <Text style={{ flex: 1, textAlign: 'center' as const, fontSize: '22rpx', fontWeight: 500 }}>结果</Text>
              <Text style={{ flex: 2, textAlign: 'right' as const, fontSize: '22rpx', fontWeight: 500 }}>参考范围</Text>
            </View>

            {labEntries.map((t, idx) => (
              <View
                key={idx}
                className={styles.testRow}
                style={{ borderLeft: t.isAbnormal ? '4rpx solid #F53F3F' : '4rpx solid transparent' }}
              >
                <Text className={styles.testName} style={{ flex: 2 }}>
                  {t.isAbnormal && <Text style={{ color: '#EF4444', marginRight: '6rpx', fontWeight: 700 }}>⚠</Text>}
                  {t.name}
                </Text>
                <View style={{ flex: 1 }}>
                  <Input
                    className={styles.testValue}
                    style={{
                      color: t.isAbnormal ? '#F53F3F' : '#1D2129',
                      fontWeight: t.isAbnormal ? 600 : 400,
                      textAlign: 'center' as const
                    }}
                    type="digit"
                    placeholder="—"
                    value={t._temp}
                    onInput={(e) => updateLab(idx, '_temp', e.detail.value)}
                  />
                </View>
                <View style={{ flex: 2, textAlign: 'right' as const }}>
                  <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                    {t.refRange} {t.unit}
                  </Text>
                </View>
              </View>
            ))}

            <View
              style={{
                marginTop: '20rpx',
                padding: '16rpx 24rpx',
                background: '#FAFBFC',
                borderRadius: '12rpx',
                border: '1rpx dashed #C9CDD4'
              }}
              onClick={() => setCustomLabOpen(!customLabOpen)}
            >
              <Text style={{ fontSize: '26rpx', color: '#4E5969' }}>
                {customLabOpen ? '收起' : '+ 自定义添加其他检验项目'}
              </Text>
            </View>

            {customLabOpen && (
              <View style={{
                marginTop: '20rpx',
                padding: '24rpx',
                background: '#F7F8FA',
                borderRadius: '12rpx'
              }}>
                {[
                  { label: '项目名称*', key: 'name', v: customLab.name, ph: '如：D-二聚体' },
                  { label: '结果', key: 'value', v: customLab.value, ph: '数值' },
                  { label: '单位', key: 'unit', v: customLab.unit, ph: '如：mg/L' }
                ].map((f) => (
                  <View key={f.key} style={{ marginBottom: '16rpx' }}>
                    <Text style={{ fontSize: '22rpx', color: '#4E5969', marginBottom: '8rpx', display: 'block' }}>{f.label}</Text>
                    <Input
                      style={{
                        height: '72rpx',
                        padding: '0 20rpx',
                        background: '#fff',
                        border: '1rpx solid #E5E6EB',
                        borderRadius: '10rpx',
                        fontSize: '26rpx'
                      }}
                      placeholder={f.ph}
                      value={customLab[f.key as keyof typeof customLab]}
                      onInput={(e) => setCustomLab(p => ({ ...p, [f.key]: e.detail.value }))}
                    />
                  </View>
                ))}
                <View
                  style={{
                    marginTop: '8rpx',
                    padding: '18rpx',
                    background: 'linear-gradient(135deg,#1A73E8,#00BFA5)',
                    color: '#fff',
                    textAlign: 'center' as const,
                    borderRadius: '12rpx',
                    fontWeight: 500
                  }}
                  onClick={addCustomLab}
                >
                  添加项目
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'ecg' && (
          <View style={{ paddingTop: '8rpx' }}>
            <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16rpx', marginBottom: '24rpx' }}>
              <View style={{ padding: '20rpx', background: '#F7F8FA', borderRadius: '12rpx' }}>
                <Text style={{ fontSize: '22rpx', color: '#86909C', marginBottom: '10rpx', display: 'block' }}>节律</Text>
                <Input
                  style={{ fontSize: '28rpx', fontWeight: 600, color: '#1D2129' }}
                  placeholder={latest?.ecg?.rhythm || '窦性心律'}
                  value={ecgRhythm}
                  onInput={(e) => setEcgRhythm(e.detail.value)}
                />
              </View>
              <View style={{ padding: '20rpx', background: '#F7F8FA', borderRadius: '12rpx' }}>
                <Text style={{ fontSize: '22rpx', color: '#86909C', marginBottom: '10rpx', display: 'block' }}>心室率(次/分)</Text>
                <Input
                  style={{ fontSize: '28rpx', fontWeight: 600, color: '#F53F3F' }}
                  type="digit"
                  placeholder={latest?.ecg?.heartRate?.toString() || '75'}
                  value={ecgRate}
                  onInput={(e) => setEcgRate(e.detail.value)}
                />
              </View>
            </View>

            <View style={{
              padding: '8rpx 16rpx',
              marginBottom: '16rpx',
              display: 'flex',
              flexWrap: 'wrap' as const,
              gap: '12rpx'
            }}>
              {['窦性心律', '大致正常心电图', 'ST段压低', 'T波倒置', '房颤心律', '室性早搏', '房室传导阻滞', '完全性右束支阻滞', '左室肥厚劳损', '急性ST段抬高'].map((t) => (
                <Text
                  key={t}
                  style={{
                    padding: '8rpx 20rpx',
                    background: 'rgba(26,115,232,0.06)',
                    color: '#1A73E8',
                    borderRadius: '32rpx',
                    fontSize: '24rpx'
                  }}
                  onClick={() => setEcgConclusion((p) => (p ? p + '；' : '') + t)}
                >
                  + {t}
                </Text>
              ))}
            </View>

            <View style={{ background: '#F7F8FA', borderRadius: '12rpx', padding: '24rpx', marginBottom: '20rpx' }}>
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block', marginBottom: '12rpx' }}>
                📈 心电图结论*
              </Text>
              <Textarea
                style={{
                  width: '100%',
                  minHeight: '140rpx',
                  background: '#fff',
                  borderRadius: '12rpx',
                  padding: '20rpx',
                  fontSize: '26rpx',
                  color: '#1D2129',
                  lineHeight: 1.6,
                  boxSizing: 'border-box' as const
                }}
                placeholder="请输入心电图结论，如：窦性心律、ST段V1-V4抬高0.2-0.4mV、T波倒置等"
                value={ecgConclusion}
                onInput={(e) => setEcgConclusion(e.detail.value)}
              />
            </View>

            <View style={{ background: '#F7F8FA', borderRadius: '12rpx', padding: '24rpx', marginBottom: '20rpx' }}>
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block', marginBottom: '12rpx' }}>
                📝 ECG详细描述（可选）
              </Text>
              <Textarea
                style={{
                  width: '100%',
                  minHeight: '160rpx',
                  background: '#fff',
                  borderRadius: '12rpx',
                  padding: '20rpx',
                  fontSize: '26rpx',
                  lineHeight: 1.6,
                  boxSizing: 'border-box' as const
                }}
                placeholder="P波、PR间期、QRS形态、QTc、ST段偏移、T波改变等详细描述"
                value={ecgDetails}
                onInput={(e) => setEcgDetails(e.detail.value)}
              />
            </View>
          </View>
        )}

        {activeTab === 'image' && (
          <View style={{ paddingTop: '8rpx' }}>
            <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16rpx', marginBottom: '20rpx' }}>
              <View style={{ background: 'rgba(16,185,129,0.06)', padding: '20rpx', borderRadius: '12rpx' }}>
                <Text style={{ fontSize: '22rpx', color: '#86909C', display: 'block', marginBottom: '8rpx' }}>LVEF(射血分数)%</Text>
                <Input
                  style={{ fontSize: '32rpx', fontWeight: 600, color: '#10B981' }}
                  type="digit"
                  placeholder={latest?.echo?.lvef?.toString() || '60'}
                  value={echoLVEF}
                  onInput={(e) => setEchoLVEF(e.detail.value)}
                />
                <Text style={{ fontSize: '20rpx', color: '#86909C', marginTop: '6rpx' }}>正常 ≥50%</Text>
              </View>
              <View style={{ background: 'rgba(245,158,11,0.06)', padding: '20rpx', borderRadius: '12rpx' }}>
                <Text style={{ fontSize: '22rpx', color: '#86909C', display: 'block', marginBottom: '8rpx' }}>LVDD(舒张末)mm</Text>
                <Input
                  style={{ fontSize: '32rpx', fontWeight: 600, color: '#F59E0B' }}
                  type="digit"
                  placeholder={latest?.echo?.lvdd?.toString() || '50'}
                  value={echoLVDD}
                  onInput={(e) => setEchoLVDD(e.detail.value)}
                />
                <Text style={{ fontSize: '20rpx', color: '#86909C', marginTop: '6rpx' }}>正常 {'<55mm'}</Text>
              </View>
            </View>

            <View style={{ background: '#F7F8FA', borderRadius: '12rpx', padding: '24rpx', marginBottom: '20rpx' }}>
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block', marginBottom: '12rpx' }}>
                🏥 超声心动图摘要
              </Text>
              <Textarea
                style={{
                  width: '100%',
                  minHeight: '160rpx',
                  background: '#fff',
                  borderRadius: '12rpx',
                  padding: '20rpx',
                  fontSize: '26rpx',
                  lineHeight: 1.6,
                  boxSizing: 'border-box' as const
                }}
                placeholder="各腔室大小、室壁厚度及运动、瓣膜结构与功能、EF值、心包积液等"
                value={echoSummary}
                onInput={(e) => setEchoSummary(e.detail.value)}
              />
            </View>

            <View style={{ background: '#F7F8FA', borderRadius: '12rpx', padding: '24rpx' }}>
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block', marginBottom: '12rpx' }}>
                📋 其他影像结果（CXR/CTA/MRI等）
              </Text>
              <Textarea
                style={{
                  width: '100%',
                  minHeight: '140rpx',
                  background: '#fff',
                  borderRadius: '12rpx',
                  padding: '20rpx',
                  fontSize: '26rpx',
                  lineHeight: 1.6,
                  boxSizing: 'border-box' as const
                }}
                placeholder="胸片、冠脉CTA、心脏MRI等其他影像摘要"
                value={echoOther}
                onInput={(e) => setEchoOther(e.detail.value)}
              />
            </View>
          </View>
        )}
      </View>

      <View style={{
        position: 'sticky' as any,
        bottom: 0,
        margin: '24rpx -24rpx -24rpx',
        padding: '24rpx',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)' as any,
        borderTop: '1rpx solid #F2F3F5'
      }}>
        <View className={styles.bar}>
          <View className={`${styles.btn} ${styles.ghost}`} onClick={() => Taro.navigateBack()}>
            <Text>取消</Text>
          </View>
          <View className={`${styles.btn} ${styles.primary}`} onClick={handleSave}>
            <Text>💾 保存检查结果</Text>
          </View>
        </View>
      </View>

      <View style={{ height: '40rpx' }} />
    </ScrollView>
  );
};

export default ExamEditPage;
