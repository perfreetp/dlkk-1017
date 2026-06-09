import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import TagBadge from '../../components/TagBadge';
import { mockPatients } from '../../data/patients';
import { mockExamResults } from '../../data/records';
import styles from './index.module.scss';

const ExamEditPage: React.FC = () => {
  const router = useRouter();
  const patientId = router.params?.patientId || 'P001';
  const patient = mockPatients.find((p) => p.id === patientId) || mockPatients[0];
  const latest = mockExamResults.find((e) => e.patientId === patientId);

  useDidShow(() => console.log('[ExamEdit] 录入检查:', patientId));

  const [activeTab, setActiveTab] = useState<'lab' | 'ecg' | 'image'>('lab');

  const handleSave = () => {
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  const tabs = [
    { key: 'lab' as const, label: '化验' },
    { key: 'ecg' as const, label: '心电图' },
    { key: 'image' as const, label: '影像' }
  ];

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.sectionCard}>
        <Text style={{ fontSize: '28rpx', color: '#1A73E8', fontWeight: 500, display: 'block', marginBottom: '12rpx' }}>
          📋 {patient.name} · {patient.gender}{patient.age}岁
        </Text>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionTitle}><Text>❤️</Text><Text>生命体征</Text></View>
        <View className={styles.vitalsGrid}>
          <View className={styles.vitalItem}>
            <Text className={styles.vitalLabel}>🩸 收缩压</Text>
            <Input className={styles.vitalValue} placeholder={`${latest?.vitalSigns?.systolicBP || 130}`} />
            <Text className={styles.vitalRange}>正常 90-140 mmHg</Text>
          </View>
          <View className={styles.vitalItem}>
            <Text className={styles.vitalLabel}>🩸 舒张压</Text>
            <Input className={styles.vitalValue} placeholder={`${latest?.vitalSigns?.diastolicBP || 85}`} />
            <Text className={styles.vitalRange}>正常 60-90 mmHg</Text>
          </View>
          <View className={styles.vitalItem}>
            <Text className={styles.vitalLabel}>💗 心率</Text>
            <Input className={styles.vitalValue} placeholder={`${latest?.vitalSigns?.heartRate || 78}`} />
            <Text className={styles.vitalRange}>正常 60-100 次/分</Text>
          </View>
          <View className={styles.vitalItem}>
            <Text className={styles.vitalLabel}>🌡️ 体温</Text>
            <Input className={styles.vitalValue} placeholder={`${latest?.vitalSigns?.temperature || 36.5}`} />
            <Text className={styles.vitalRange}>正常 36.0-37.3 ℃</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.tabRow}>
          {tabs.map((t) => (
            <View key={t.key} className={classnames(styles.tabItem, activeTab === t.key && styles.active)} onClick={() => setActiveTab(t.key)}>
              <Text>{t.label}</Text>
            </View>
          ))}
        </View>

        {activeTab === 'lab' && (
          <View>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16rpx' }}>
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#4E5969' }}>心肌酶谱</Text>
              <TagBadge type="critical">异常项需重点关注</TagBadge>
            </View>
            {latest?.labTests?.slice(0, 6).map((t, idx) => (
              <View key={idx} className={styles.testRow}>
                <Text className={styles.testName}>
                  {t.isAbnormal && <Text style={{ color: '#EF4444', marginRight: '8rpx' }}>⚠</Text>}
                  {t.name}
                </Text>
                <Input className={styles.testValue} placeholder={`${t.value}`} />
                <Text className={styles.testUnit}>{t.unit}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'ecg' && (
          <View>
            <View style={{ background: '#F7F8FA', borderRadius: '12rpx', padding: '24rpx', marginBottom: '20rpx' }}>
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block', marginBottom: '12rpx' }}>
                📈 心电图结论
              </Text>
              <Input
                style={{
                  background: '#fff',
                  borderRadius: '12rpx',
                  padding: '20rpx',
                  fontSize: '26rpx',
                  color: '#1D2129',
                  minHeight: '120rpx'
                }}
                placeholder="请输入心电图结论，如：窦性心律、ST段改变等"
              />
            </View>
            <View style={{ background: 'rgba(26,115,232,0.06)', borderRadius: '12rpx', padding: '20rpx' }}>
              <Text style={{ fontSize: '24rpx', color: '#1A73E8', lineHeight: 1.6 }}>
                💡 提示：请确认节律、心率、P波、PR间期、QRS波群、ST段、T波等关键指标
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'image' && (
          <View>
            <View style={{ background: '#F7F8FA', borderRadius: '12rpx', padding: '24rpx', marginBottom: '20rpx' }}>
              <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block', marginBottom: '12rpx' }}>
                🏥 超声心动图摘要
              </Text>
              <Input
                style={{
                  background: '#fff',
                  borderRadius: '12rpx',
                  padding: '20rpx',
                  fontSize: '26rpx',
                  color: '#1D2129',
                  minHeight: '160rpx'
                }}
                placeholder="输入各腔室大小、室壁运动、瓣膜功能、EF值等摘要信息"
              />
            </View>
            <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16rpx' }}>
              <View style={{ background: 'rgba(16,185,129,0.06)', padding: '20rpx', borderRadius: '12rpx' }}>
                <Text style={{ fontSize: '22rpx', color: '#86909C', display: 'block' }}>LVEF(射血分数)</Text>
                <Input style={{ fontSize: '32rpx', fontWeight: 600, color: '#10B981', marginTop: '8rpx' }} placeholder="60" />
                <Text style={{ fontSize: '20rpx', color: '#86909C' }}>正常 ≥50%</Text>
              </View>
              <View style={{ background: 'rgba(245,158,11,0.06)', padding: '20rpx', borderRadius: '12rpx' }}>
                <Text style={{ fontSize: '22rpx', color: '#86909C', display: 'block' }}>LVDD(舒张末期)</Text>
                <Input style={{ fontSize: '32rpx', fontWeight: 600, color: '#F59E0B', marginTop: '8rpx' }} placeholder="50" />
                <Text style={{ fontSize: '20rpx', color: '#86909C' }}>正常 {'<55mm'}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View className={styles.bar}>
        <View className={`${styles.btn} ${styles.ghost}`} onClick={() => Taro.navigateBack()}><Text>取消</Text></View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleSave}><Text>保存检查</Text></View>
      </View>
    </ScrollView>
  );
};

export default ExamEditPage;
