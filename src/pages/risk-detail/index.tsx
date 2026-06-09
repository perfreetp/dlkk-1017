import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { mockRiskAssessments, mockDoctorAdvices } from '../../data/assessments';
import { getRiskLevelText } from '../../utils/riskCalc';
import SectionCard from '../../components/SectionCard';
import styles from './index.module.scss';

const RiskDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params?.id || 'RA001';

  useDidShow(() => console.log('[RiskDetail] 查看评估:', id));

  const assessment = useMemo(() => mockRiskAssessments.find((a) => a.id === id) || mockRiskAssessments[0], [id]);
  const advice = useMemo(() => mockDoctorAdvices.find((a) => a.patientId === assessment.patientId), [assessment]);

  const factors = [
    { icon: '❗', type: 'critical', title: '收缩压 >180mmHg', desc: '当前血压严重偏高，需紧急处理' },
    { icon: '❤️', type: 'critical', title: '肌钙蛋白显著升高', desc: '提示心肌损伤，cTnI 12.5ng/mL' },
    { icon: '⏰', type: 'warning', title: '发病至就诊时间', desc: '发病2小时，处于黄金窗口期' },
    { icon: '🩺', type: 'warning', title: 'Killip分级Ⅱ级', desc: '存在轻度心力衰竭表现' },
    { icon: '✅', type: 'positive', title: '无糖尿病史', desc: '代谢风险因素较低' },
  ];

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.heroCard}>
        <View className={styles.bgCircle} />
        <View className={styles.scoreRow}>
          <View className={styles.scoreCircle}>
            <Text className={styles.scoreVal}>{assessment.score}</Text>
            <Text className={styles.scoreLabel}>总分</Text>
          </View>
          <View className={styles.scoreInfo}>
            <Text className={styles.riskLabel}>{getRiskLevelText(assessment.overallRisk)}风险</Text>
            <Text className={styles.desc}>
              院内死亡率预测 15.2%，12个月死亡率预测 28.5%，建议立即启动救治流程
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: '24rpx', opacity: 0.8, position: 'relative', zIndex: 1 }}>
          评估时间：{assessment.assessmentDate} · 主治医师：{assessment.doctor}
        </Text>
      </View>

      <View className={styles.scoreGroup}>
        <View className={styles.scoreCard}>
          <Text className={styles.scoreName}>GRACE</Text>
          <Text className={`${styles.scoreNum} ${styles.critical}`}>{assessment.graceScore}</Text>
          <Text className={styles.scoreLevel}>高危</Text>
        </View>
        <View className={styles.scoreCard}>
          <Text className={styles.scoreName}>TIMI</Text>
          <Text className={`${styles.scoreNum} ${styles.warning}`}>{assessment.timiScore}/7</Text>
          <Text className={styles.scoreLevel}>中高危</Text>
        </View>
        <View className={styles.scoreCard}>
          <Text className={styles.scoreName}>HAS-BLED</Text>
          <Text className={`${styles.scoreNum} ${styles.warning}`}>{assessment.hasBledScore}/9</Text>
          <Text className={styles.scoreLevel}>中等</Text>
        </View>
      </View>

      <SectionCard title="风险因子分析">
        <View className={styles.factorList}>
          {factors.map((f, idx) => (
            <View key={idx} className={styles.factorItem}>
              <View className={`${styles.factorIcon} ${styles[f.type]}`}>
                <Text>{f.icon}</Text>
              </View>
              <View className={styles.factorContent}>
                <Text className={styles.factorTitle}>{f.title}</Text>
                <Text className={styles.factorDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="⚠️ 风险提示">
        {assessment.warnings.map((w, idx) => (
          <View
            key={idx}
            style={{
              padding: '20rpx',
              background: 'rgba(239,68,68,0.06)',
              borderRadius: '12rpx',
              marginBottom: idx < assessment.warnings.length - 1 ? '16rpx' : 0,
              borderLeft: '6rpx solid #EF4444'
            }}
          >
            <Text style={{ fontSize: '28rpx', color: '#1D2129', lineHeight: 1.6 }}>{w}</Text>
          </View>
        ))}
      </SectionCard>

      <View className={styles.adviceCard}>
        <View className={styles.adviceTitle}><Text>💊</Text><Text>临床建议</Text></View>
        {advice?.recommendations.slice(0, 5).map((r, idx) => (
          <Text key={idx} className={styles.adviceItem}>{r}</Text>
        ))}
      </View>

      <View style={{ height: '32rpx' }} />

      <View style={{
        background: 'rgba(245,158,11,0.08)',
        borderRadius: '20rpx',
        padding: '24rpx',
        marginTop: '24rpx',
        border: '2rpx solid rgba(245,158,11,0.2)'
      }}>
        <Text style={{ fontSize: '24rpx', color: '#B45309', lineHeight: 1.8 }}>
          ⚠️ 免责声明：本评估结果仅作为临床参考，不作为诊断依据。最终诊疗方案请结合临床判断，必要时组织多学科会诊。
        </Text>
      </View>
    </ScrollView>
  );
};

export default RiskDetailPage;
