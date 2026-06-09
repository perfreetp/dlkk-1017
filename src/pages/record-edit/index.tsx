import React, { useState, useMemo } from 'react';
import { View, Text, Textarea, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { usePatientStore } from '../../store/patientStore';
import TagBadge from '../../components/TagBadge';
import type { MedicationItem } from '../../types';
import styles from './index.module.scss';

const COMMON_MEDS: Omit<MedicationItem, 'id' | 'startDate'>[] = [
  { name: '阿司匹林肠溶片', dose: '100mg', frequency: '每日1次', route: '口服', category: '抗血小板' },
  { name: '氯吡格雷片', dose: '75mg', frequency: '每日1次', route: '口服', category: '抗血小板' },
  { name: '替格瑞洛片', dose: '90mg', frequency: '每日2次', route: '口服', category: '抗血小板' },
  { name: '阿托伐他汀钙片', dose: '20mg', frequency: '每晚1次', route: '口服', category: '调脂' },
  { name: '瑞舒伐他汀钙片', dose: '10mg', frequency: '每晚1次', route: '口服', category: '调脂' },
  { name: '美托洛尔缓释片', dose: '47.5mg', frequency: '每日1次', route: '口服', category: 'β受体阻滞剂' },
  { name: '比索洛尔片', dose: '5mg', frequency: '每日1次', route: '口服', category: 'β受体阻滞剂' },
  { name: '贝那普利片', dose: '10mg', frequency: '每日1次', route: '口服', category: 'ACEI' },
  { name: '缬沙坦胶囊', dose: '80mg', frequency: '每日1次', route: '口服', category: 'ARB' },
  { name: '氨氯地平片', dose: '5mg', frequency: '每日1次', route: '口服', category: 'CCB' },
  { name: '呋塞米片', dose: '20mg', frequency: '每日1次', route: '口服', category: '利尿剂' },
  { name: '螺内酯片', dose: '20mg', frequency: '每日1次', route: '口服', category: '利尿剂' },
  { name: '达格列净片', dose: '10mg', frequency: '每日1次', route: '口服', category: 'SGLT2i' },
  { name: '二甲双胍片', dose: '0.5g', frequency: '每日2次', route: '口服', category: '降糖' }
];

const RecordEditPage: React.FC = () => {
  const router = useRouter();
  const patientId = router.params?.patientId || 'P001';

  const getPatientById = usePatientStore((s) => s.getPatientById);
  const getFirstVisitRecordsByPatientId = usePatientStore((s) => s.getFirstVisitRecordsByPatientId);
  const addFirstVisitRecord = usePatientStore((s) => s.addFirstVisitRecord);

  const patient = useMemo(() => getPatientById(patientId) || getPatientById('P001'), [patientId, getPatientById]);
  const prevRecords = useMemo(() => getFirstVisitRecordsByPatientId(patientId), [patientId, getFirstVisitRecordsByPatientId]);

  useDidShow(() => {
    console.log('[RecordEdit] 编辑首诊记录: patientId=', patientId, ' 既往记录数:', prevRecords.length);
  });

  const [symptoms, setSymptoms] = useState(prevRecords[0]?.symptoms || '');
  const [presentIllness, setPresentIllness] = useState(prevRecords[0]?.presentIllness || '');
  const [selectedHistory, setSelectedHistory] = useState<string[]>(prevRecords[0]?.medicalHistory || []);
  const [allergies, setAllergies] = useState(prevRecords[0]?.allergies || '');
  const [medications, setMedications] = useState<MedicationItem[]>(prevRecords[0]?.medications || []);

  const historyOptions = ['高血压', '糖尿病', '高血脂', '冠心病', '房颤', '心衰', '脑卒中', '慢阻肺', '吸烟史', '饮酒史'];

  const toggleHistory = (item: string) => {
    setSelectedHistory((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCommonMed = (med: Omit<MedicationItem, 'id' | 'startDate'>) => {
    const idx = medications.findIndex((m) => m.name === med.name);
    if (idx >= 0) {
      Taro.showToast({ title: '该药已存在于用药列表', icon: 'none' });
      return;
    }
    const newMed: MedicationItem = {
      ...med,
      id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      startDate: new Date().toISOString().slice(0, 10)
    };
    setMedications((prev) => [...prev, newMed]);
    Taro.showToast({ title: `+ ${med.name}`, icon: 'none', duration: 800 });
  };

  const removeMed = (mid: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== mid));
  };

  const [showCustom, setShowCustom] = useState(false);
  const [customMed, setCustomMed] = useState({ name: '', dose: '', frequency: '', category: '' });
  const saveCustomMed = () => {
    if (!customMed.name.trim()) {
      Taro.showToast({ title: '请填写药品名称', icon: 'none' });
      return;
    }
    addCommonMed({
      name: customMed.name,
      dose: customMed.dose || '遵医嘱',
      frequency: customMed.frequency || '每日1次',
      route: '口服',
      category: customMed.category || '其他'
    });
    setCustomMed({ name: '', dose: '', frequency: '', category: '' });
    setShowCustom(false);
  };

  const handleSave = () => {
    const payload = {
      patientId: patient!.id,
      symptoms: symptoms.trim() || '未填写',
      presentIllness: presentIllness.trim() || '未填写',
      medicalHistory: selectedHistory.length > 0 ? selectedHistory : ['无特殊病史'],
      allergies: allergies.trim() || '无过敏史',
      medications
    };
    console.log('[RecordEdit] 保存首诊记录 payload:', JSON.stringify(payload, null, 2));
    const saved = addFirstVisitRecord(payload);
    console.log('[RecordEdit] 保存成功记录ID:', saved.id);
    Taro.showToast({ title: '首诊记录已保存', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 900);
  };

  if (!patient) {
    return (
      <ScrollView scrollY className={styles.pageWrap}>
        <View style={{ padding: '120rpx 48rpx', alignItems: 'center' }}>
          <Text>未找到患者信息</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.formCard}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '20rpx' }}>
          <View style={{
            width: '80rpx',
            height: '80rpx',
            borderRadius: '40rpx',
            background: 'linear-gradient(135deg,#1A73E8,#00BFA5)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32rpx',
            fontWeight: 700,
            flexShrink: 0
          }}><Text>{patient.name.charAt(0)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '32rpx', color: '#1D2129', fontWeight: 600, display: 'block' }}>
              {patient.name} · {patient.gender}{patient.age}岁
            </Text>
            <Text style={{ fontSize: '24rpx', color: '#4E5969', marginTop: '6rpx', display: 'block' }}>
              {patient.bedNo ? `${patient.ward}${patient.bedNo}` : '门诊'} · {patient.patientNo} · {patient.diagnosis}
            </Text>
            <View style={{ display: 'flex', gap: '12rpx', marginTop: '8rpx' }}>
              <TagBadge type={patient.riskLevel} showDot size="sm">
                {patient.riskLevel === 'critical' ? '急重症' : patient.riskLevel === 'high' ? '高危' : '稳定'}
              </TagBadge>
              {prevRecords.length > 0 && (
                <TagBadge type="normal" size="sm">已有 {prevRecords.length} 条记录</TagBadge>
              )}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}>
          <Text className={styles.icon}>🩺</Text>
          <Text>症状与主诉</Text>
          <Text style={{ fontSize: '22rpx', color: '#F53F3F', marginLeft: '4rpx' }}>*</Text>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.itemLabel}>症状描述</Text>
          <Textarea
            className={styles.itemTextarea}
            placeholder="请输入患者症状描述，如：胸骨后压榨样疼痛3小时，向左肩放射，伴大汗..."
            value={symptoms}
            onInput={(e) => setSymptoms(e.detail.value)}
          />
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx', marginTop: '16rpx' }}>
            {['胸骨后压榨样胸痛', '胸闷气短', '心悸心慌', '头晕头痛', '乏力疲倦', '呼吸困难', '下肢水肿', '夜间端坐呼吸'].map((s) => (
              <Text
                key={s}
                style={{
                  padding: '8rpx 20rpx',
                  background: '#F2F3F5',
                  borderRadius: '32rpx',
                  fontSize: '24rpx',
                  color: '#4E5969'
                }}
                onClick={() => setSymptoms((p) => (p ? p + '、' : '') + s)}
              >
                + {s}
              </Text>
            ))}
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.itemLabel}>现病史</Text>
          <Textarea
            className={styles.itemTextarea}
            placeholder="描述发病时间、诱因、持续时间、缓解方式、既往诊治经过等..."
            value={presentIllness}
            onInput={(e) => setPresentIllness(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}><Text className={styles.icon}>📜</Text><Text>既往病史</Text></View>
        <View className={styles.formItem}>
          <Text className={styles.itemLabel}>选择合并症（可多选）</Text>
          <View className={styles.tagList}>
            {historyOptions.map((item) => (
              <View
                key={item}
                className={classnames(styles.tagChip, selectedHistory.includes(item) && styles.active)}
                onClick={() => toggleHistory(item)}
              >
                <Text>
                  {selectedHistory.includes(item) ? '✓ ' : ''}{item}
                </Text>
              </View>
            ))}
          </View>
          {selectedHistory.length > 0 && (
            <Text style={{ fontSize: '22rpx', color: '#1A73E8', marginTop: '12rpx' }}>
              已选 {selectedHistory.length} 项：{selectedHistory.join('、')}
            </Text>
          )}
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}>
          <Text className={styles.icon}>💊</Text>
          <Text>当前用药（{medications.length}种）</Text>
          <Text style={{ fontSize: '22rpx', color: '#86909C', marginLeft: 'auto' }}>门诊/入院前用药</Text>
        </View>

        {medications.length > 0 && (
          <View style={{ marginBottom: '24rpx' }}>
            {medications.map((m, idx) => (
              <View
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16rpx 20rpx',
                  background: idx % 2 === 0 ? '#F7F8FA' : '#FFFFFF',
                  borderRadius: '12rpx',
                  marginBottom: '8rpx',
                  border: '1rpx solid #F2F3F5'
                }}
              >
                <View style={{
                  width: '36rpx',
                  height: '36rpx',
                  borderRadius: '10rpx',
                  background: 'rgba(26,115,232,0.1)',
                  color: '#1A73E8',
                  fontSize: '22rpx',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginRight: '16rpx'
                }}><Text>{idx + 1}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '10rpx', flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1D2129' }}>{m.name}</Text>
                    {m.category && (
                      <Text style={{
                        fontSize: '20rpx',
                        padding: '2rpx 12rpx',
                        background: 'rgba(0,191,165,0.1)',
                        color: '#009688',
                        borderRadius: '24rpx'
                      }}>{m.category}</Text>
                    )}
                  </View>
                  <Text style={{
                    fontSize: '24rpx',
                    color: '#4E5969',
                    marginTop: '6rpx',
                    display: 'block'
                  }}>
                    {m.dose} · {m.frequency} · {m.route}
                    {m.startDate && <Text style={{ color: '#86909C' }}>  (自 {m.startDate}起)</Text>}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: '28rpx',
                    color: '#86909C',
                    padding: '8rpx 12rpx',
                    marginLeft: '12rpx'
                  }}
                  onClick={() => removeMed(m.id)}
                >
                  ✕
                </Text>
              </View>
            ))}
          </View>
        )}

        <View className={styles.formItem}>
          <Text className={styles.itemLabel}>
            💡 快速添加常用心血管药物
          </Text>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx' }}>
            {COMMON_MEDS.map((m) => {
              const exists = medications.find((x) => x.name === m.name);
              return (
                <View
                  key={m.name}
                  style={{
                    padding: '12rpx 20rpx',
                    background: exists
                      ? 'rgba(16,185,129,0.1)'
                      : 'rgba(26,115,232,0.06)',
                    border: exists
                      ? '1rpx solid rgba(16,185,129,0.3)'
                      : '1rpx solid rgba(26,115,232,0.2)',
                    borderRadius: '10rpx',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10rpx'
                  }}
                  onClick={() => !exists && addCommonMed(m)}
                >
                  <Text style={{
                    fontSize: '24rpx',
                    color: exists ? '#10B981' : '#1A73E8',
                    fontWeight: 500
                  }}>
                    {exists ? '✓ ' : '+ '}{m.name}
                  </Text>
                  <Text style={{
                    fontSize: '20rpx',
                    color: '#86909C'
                  }}>
                    {m.category}
                  </Text>
                </View>
              );
            })}
          </View>

          <View
            style={{
              marginTop: '20rpx',
              padding: '16rpx 24rpx',
              background: '#FAFBFC',
              borderRadius: '12rpx',
              border: '1rpx dashed #C9CDD4'
            }}
            onClick={() => setShowCustom(!showCustom)}
          >
            <Text style={{ fontSize: '26rpx', color: '#4E5969' }}>
              {showCustom ? '收起' : '+ 自定义添加其他药品'}
            </Text>
          </View>

          {showCustom && (
            <View style={{
              marginTop: '20rpx',
              padding: '24rpx',
              background: '#F7F8FA',
              borderRadius: '12rpx'
            }}>
              {[
                { label: '药品名称*', value: customMed.name, key: 'name', ph: '如：华法林钠片' },
                { label: '剂量', value: customMed.dose, key: 'dose', ph: '如：2.5mg' },
                { label: '用法频次', value: customMed.frequency, key: 'frequency', ph: '如：每日1次' },
                { label: '类别', value: customMed.category, key: 'category', ph: '如：抗凝药' }
              ].map((f) => (
                <View key={f.key} style={{ marginBottom: '16rpx' }}>
                  <Text style={{ fontSize: '22rpx', color: '#4E5969', marginBottom: '8rpx', display: 'block' }}>
                    {f.label}
                  </Text>
                  <Input
                    style={{
                      width: '100%',
                      height: '72rpx',
                      padding: '0 20rpx',
                      background: '#fff',
                      border: '1rpx solid #E5E6EB',
                      borderRadius: '10rpx',
                      fontSize: '26rpx',
                      boxSizing: 'border-box' as const
                    }}
                    placeholder={f.ph}
                    value={customMed[f.key as keyof typeof customMed]}
                    onInput={(e) => setCustomMed((p) => ({ ...p, [f.key]: e.detail.value }))}
                  />
                </View>
              ))}
              <View
                style={{
                  marginTop: '8rpx',
                  padding: '20rpx',
                  background: 'linear-gradient(135deg,#1A73E8,#00BFA5)',
                  color: '#fff',
                  textAlign: 'center' as const,
                  borderRadius: '12rpx',
                  fontWeight: 600,
                  fontSize: '28rpx'
                }}
                onClick={saveCustomMed}
              >
                添加该药品
              </View>
            </View>
          )}
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}><Text className={styles.icon}>⚠️</Text><Text>过敏史</Text></View>
        <View className={styles.formItem}>
          <Input
            className={styles.itemInput}
            placeholder="如：青霉素过敏、磺胺类过敏；无则填【无过敏史】"
            value={allergies}
            onInput={(e) => setAllergies(e.detail.value)}
          />
          <View style={{ display: 'flex', gap: '12rpx', marginTop: '16rpx', flexWrap: 'wrap' }}>
            {['无过敏史', '青霉素过敏', '磺胺类过敏', '头孢类过敏', '海鲜过敏'].map((a) => (
              <Text
                key={a}
                style={{
                  padding: '8rpx 20rpx',
                  background: 'rgba(245,63,63,0.06)',
                  color: '#F53F3F',
                  borderRadius: '32rpx',
                  fontSize: '24rpx'
                }}
                onClick={() => setAllergies(a)}
              >
                {a}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.saveBar}>
        <View className={`${styles.btn} ${styles.ghost}`} onClick={() => Taro.navigateBack()}>
          <Text>取消</Text>
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleSave}>
          <Text>💾 保存首诊记录</Text>
        </View>
      </View>

      <View style={{ height: '140rpx' }} />
    </ScrollView>
  );
};

export default RecordEditPage;
