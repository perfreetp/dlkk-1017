import React, { useState } from 'react';
import { View, Text, Textarea, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { mockPatients } from '../../data/patients';
import { mockTemplates } from '../../data/followups';
import styles from './index.module.scss';

const RecordEditPage: React.FC = () => {
  const router = useRouter();
  const patientId = router.params?.patientId || 'P001';
  const patient = mockPatients.find((p) => p.id === patientId) || mockPatients[0];

  useDidShow(() => console.log('[RecordEdit] 编辑首诊记录:', patientId));

  const [symptoms, setSymptoms] = useState('');
  const [presentIllness, setPresentIllness] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('');

  const historyOptions = ['高血压', '糖尿病', '高血脂', '冠心病', '房颤', '心衰', '脑卒中', '慢阻肺', '吸烟史', '饮酒史'];

  const toggleHistory = (item: string) => {
    setSelectedHistory((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const applyTemplate = (tpl: typeof mockTemplates[0]) => {
    console.log('[RecordEdit] 应用模板:', tpl.name);
    if (tpl.category === 'symptom') {
      setSymptoms(tpl.content.slice(0, 100));
    }
    Taro.showToast({ title: `已应用模板:${tpl.name}`, icon: 'none' });
  };

  const handleSave = () => {
    console.log('[RecordEdit] 保存记录', { symptoms, presentIllness, selectedHistory, allergies });
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.formCard}>
        <Text style={{ fontSize: '28rpx', color: '#1A73E8', fontWeight: 500, display: 'block', marginBottom: '12rpx' }}>
          📋 {patient.name} · {patient.gender}{patient.age}岁 · {patient.bedNo || '门诊'}
        </Text>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}><Text className={styles.icon}>🩺</Text><Text>症状与主诉</Text></View>
        <View className={styles.formItem}>
          <Text className={styles.itemLabel}>症状描述</Text>
          <Textarea
            className={styles.itemTextarea}
            placeholder="请输入患者症状描述，如胸痛、胸闷、气短等"
            value={symptoms}
            onInput={(e) => setSymptoms(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.itemLabel}>现病史</Text>
          <Textarea
            className={styles.itemTextarea}
            placeholder="描述发病过程、诊治经过等"
            value={presentIllness}
            onInput={(e) => setPresentIllness(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}><Text className={styles.icon}>📜</Text><Text>既往病史</Text></View>
        <View className={styles.formItem}>
          <Text className={styles.itemLabel}>选择病史（可多选）</Text>
          <View className={styles.tagList}>
            {historyOptions.map((item) => (
              <View
                key={item}
                className={classnames(styles.tagChip, selectedHistory.includes(item) && styles.active)}
                onClick={() => toggleHistory(item)}
              >
                <Text>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}><Text className={styles.icon}>⚠️</Text><Text>过敏史</Text></View>
        <View className={styles.formItem}>
          <Input
            className={styles.itemInput}
            placeholder="如青霉素、磺胺类等，无则填无"
            value={allergies}
            onInput={(e) => setAllergies(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.cardTitle}>
          <Text className={styles.icon}>📄</Text>
          <Text>快速模板</Text>
          <Text style={{ fontSize: '22rpx', color: '#86909C', marginLeft: 'auto' }}>点击应用</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'column', gap: '16rpx' }}>
          {mockTemplates.filter((t) => t.category === 'symptom' || t.category === 'diagnosis').map((tpl) => (
            <View
              key={tpl.id}
              style={{ padding: '20rpx', background: '#F7F8FA', borderRadius: '12rpx' }}
              onClick={() => applyTemplate(tpl)}
            >
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block', marginBottom: '8rpx' }}>
                {tpl.name} <Text style={{ fontSize: '20rpx', color: '#1A73E8' }}>(使用{tpl.usageCount}次)</Text>
              </Text>
              <Text style={{ fontSize: '24rpx', color: '#86909C', lineHeight: 1.5 }}>
                {tpl.content.slice(0, 60)}...
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.saveBar}>
        <View className={`${styles.btn} ${styles.ghost}`} onClick={() => Taro.navigateBack()}>
          <Text>取消</Text>
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleSave}>
          <Text>保存记录</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default RecordEditPage;
