import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { mockPatients } from '../../data/patients';
import { mockFirstVisitRecords, mockExamResults } from '../../data/records';
import { mockRiskAssessments, mockDoctorAdvices } from '../../data/assessments';
import SectionCard from '../../components/SectionCard';
import TagBadge from '../../components/TagBadge';
import { getRiskLevelText } from '../../utils/riskCalc';
import styles from './index.module.scss';

const PatientDetailPage: React.FC = () => {
  const router = useRouter();
  const patientId = router.params?.id || 'P001';

  useDidShow(() => {
    console.log('[PatientDetail] 页面显示，患者ID:', patientId);
  });

  const patient = useMemo(() => mockPatients.find((p) => p.id === patientId) || mockPatients[0], [patientId]);
  const records = useMemo(() => mockFirstVisitRecords.filter((r) => r.patientId === patientId), [patientId]);
  const exams = useMemo(() => mockExamResults.filter((e) => e.patientId === patientId), [patientId]);
  const assessments = useMemo(() => mockRiskAssessments.filter((a) => a.patientId === patientId), [patientId]);
  const advices = useMemo(() => mockDoctorAdvices.filter((a) => a.patientId === patientId), [patientId]);

  const latestExam = exams[0];
  const latestAssessment = assessments[0];

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.header}>
        <View className={styles.patientRow}>
          <View className={styles.avatar}>
            <Text>{patient.name.charAt(0)}</Text>
          </View>
          <View className={styles.info}>
            <Text className={styles.name}>{patient.name}</Text>
            <Text className={styles.meta}>
              {patient.gender} · {patient.age}岁 · {patient.patientNo}
            </Text>
            <Text className={styles.meta}>
              {patient.bedNo ? `${patient.ward} ${patient.bedNo}` : '门诊患者'} · 入院 {patient.admissionDate}
            </Text>
          </View>
          <TagBadge type={patient.riskLevel} showDot size="lg">
            {getRiskLevelText(patient.riskLevel)}
          </TagBadge>
        </View>

        <View className={styles.tagsRow}>
          {patient.tags.map((tag, idx) => (
            <View key={idx} className={styles.tagItem}>
              <Text>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.contentSection}>
        <View className={styles.quickInfo}>
          <View className={styles.infoItem}>
            <Text className={styles.label}>血压</Text>
            <Text className={styles.value}>
              {latestExam?.vitalSigns ? `${latestExam.vitalSigns.systolicBP}/${latestExam.vitalSigns.diastolicBP}` : '-/-'}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.label}>心率</Text>
            <Text className={styles.value}>
              {latestExam?.vitalSigns?.heartRate || '-'} 次/分
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.label}>风险分</Text>
            <Text className={styles.value}>{latestAssessment?.score || '-'}</Text>
          </View>
        </View>

        <SectionCard title="诊断信息" extra={<TagBadge type={patient.riskLevel}>{getRiskLevelText(patient.riskLevel)}</TagBadge>}>
          <Text style={{ fontSize: '30rpx', fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: '16rpx' }}>
            {patient.diagnosis}
          </Text>
          <Text style={{ fontSize: '28rpx', color: '#4E5969', lineHeight: 1.6 }}>
            主诉：{patient.chiefComplaint}
          </Text>
        </SectionCard>

        {records.length > 0 && (
          <SectionCard
            title="首诊记录"
            extra={<Text style={{ fontSize: '24rpx', color: '#1A73E8' }}>{records.length}条 ›</Text>}
            onClick={() => Taro.navigateTo({ url: `/pages/record-edit/index?patientId=${patient.id}` })}
          >
            {records.slice(0, 1).map((r) => (
              <View key={r.id}>
                <Text style={{ fontSize: '24rpx', color: '#86909C', marginBottom: '12rpx', display: 'block' }}>
                  就诊日期：{r.visitDate} · 主治医师：{r.doctor}
                </Text>
                <Text style={{ fontSize: '28rpx', color: '#4E5969', lineHeight: 1.7 }}>
                  {r.symptoms}
                </Text>
                {r.allergies.length > 0 && (
                  <View style={{ marginTop: '20rpx' }}>
                    <TagBadge type="critical">⚠ 过敏：{r.allergies.join('、')}</TagBadge>
                  </View>
                )}
              </View>
            ))}
          </SectionCard>
        )}

        {latestExam && (
          <SectionCard
            title="最新检查"
            extra={<Text style={{ fontSize: '24rpx', color: '#1A73E8' }}>详情 ›</Text>}
            onClick={() => Taro.navigateTo({ url: `/pages/exam-edit/index?patientId=${patient.id}` })}
          >
            <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '24rpx' }}>
              {latestExam.labTests?.slice(0, 4).map((t, idx) => (
                <View key={idx} style={{
                  padding: '16rpx',
                  background: t.isAbnormal ? 'rgba(239,68,68,0.06)' : '#F7F8FA',
                  borderRadius: '12rpx'
                }}>
                  <Text style={{ fontSize: '22rpx', color: '#86909C', display: 'block', marginBottom: '6rpx' }}>{t.name}</Text>
                  <Text style={{
                    fontSize: '30rpx',
                    fontWeight: 600,
                    color: t.isAbnormal ? '#EF4444' : '#1D2129'
                  }}>
                    {t.value}{t.unit} {t.isAbnormal && (t.trend === 'up' ? '↑' : t.trend === 'down' ? '↓' : '!')}
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>
        )}

        {latestAssessment && (
          <SectionCard
            title="风险评估"
            extra={<TagBadge type={latestAssessment.overallRisk} showDot>
              {getRiskLevelText(latestAssessment.overallRisk)} · {latestAssessment.score}分
            </TagBadge>}
            onClick={() => Taro.navigateTo({ url: `/pages/risk-detail/index?id=${latestAssessment.id}` })}
          >
            <Text style={{ fontSize: '28rpx', color: '#4E5969', lineHeight: 1.7 }}>
              ⚠ {latestAssessment.warnings.slice(0, 2).join('；')}
            </Text>
          </SectionCard>
        )}

        {advices.length > 0 && (
          <SectionCard title="医嘱建议">
            {advices[0].medications.slice(0, 3).map((m, idx) => (
              <View key={idx} style={{
                padding: '16rpx 0',
                borderBottom: idx < 2 ? '1rpx solid #F2F3F5' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Text style={{ fontSize: '28rpx', color: '#1D2129', fontWeight: 500 }}>{m.name}</Text>
                <Text style={{ fontSize: '24rpx', color: '#86909C' }}>{m.dose} {m.frequency}</Text>
              </View>
            ))}
          </SectionCard>
        )}
      </View>

      <View className={styles.actionBar}>
        <View className={`${styles.btn} ${styles.outline}`} onClick={() => Taro.navigateTo({ url: `/pages/record-edit/index?patientId=${patientId}` })}>
          <Text>首诊记录</Text>
        </View>
        <View className={`${styles.btn} ${styles.secondary}`} onClick={() => Taro.navigateTo({ url: `/pages/exam-edit/index?patientId=${patientId}` })}>
          <Text>检查录入</Text>
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={() => Taro.navigateTo({ url: `/pages/followup-detail/index?patientId=${patientId}` })}>
          <Text>安排随访</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PatientDetailPage;
