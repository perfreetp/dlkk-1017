import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { usePatientStore } from '../../store/patientStore';
import { getRiskLevelText } from '../../utils/riskCalc';
import SectionCard from '../../components/SectionCard';
import TagBadge from '../../components/TagBadge';
import styles from './index.module.scss';

const RiskDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params?.id;
  const pid = router.params?.patientId;

  useDidShow(() => console.log('[RiskDetail] id:', id, 'pid:', pid));

  const patient = usePatientStore((s) => (pid ? s.getPatientById(pid) : undefined));
  const getRiskAssessmentsByPatientId = usePatientStore((s) => s.getRiskAssessmentsByPatientId);
  const getDoctorAdviceByPatientId = usePatientStore((s) => s.getDoctorAdviceByPatientId);
  const riskAssessmentsAll = usePatientStore((s) => s.riskAssessments);

  const assessment = useMemo(() => {
    if (id) {
      return riskAssessmentsAll.find((a) => a.id === id);
    }
    if (pid) {
      return getRiskAssessmentsByPatientId(pid)[0];
    }
    return riskAssessmentsAll[0];
  }, [id, pid, riskAssessmentsAll, getRiskAssessmentsByPatientId]);

  const patientId = assessment?.patientId || pid || 'P001';
  const advice = useMemo(() => getDoctorAdviceByPatientId(patientId), [patientId, getDoctorAdviceByPatientId]);

  const factors = [
    { icon: '❗', type: 'critical', title: '收缩压 >180mmHg', desc: '当前血压严重偏高，需紧急处理' },
    { icon: '❤️', type: 'critical', title: '肌钙蛋白显著升高', desc: '提示心肌损伤，cTnI 12.5ng/mL' },
    { icon: '⏰', type: 'warning', title: '发病至就诊时间', desc: '发病2小时，处于黄金窗口期' },
    { icon: '🩺', type: 'warning', title: 'Killip分级Ⅱ级', desc: '存在轻度心力衰竭表现' },
    { icon: '✅', type: 'positive', title: '无糖尿病史', desc: '代谢风险因素较低' },
  ];

  const urgencyMap = { routine: '常规', urgent: '紧急', emergent: '立即' } as const;

  if (!assessment) {
    return (
      <ScrollView scrollY className={styles.pageWrap}>
        <View style={{
          padding: '120rpx 48rpx',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{ fontSize: '120rpx', marginBottom: '32rpx' }}>📊</Text>
          <Text style={{ fontSize: '36rpx', fontWeight: 600, color: '#1D2129', marginBottom: '16rpx' }}>暂无风险评估</Text>
          <Text style={{ fontSize: '28rpx', color: '#86909C', textAlign: 'center', lineHeight: 1.6 }}>
            该患者尚未进行风险分层评估，{"\n"}请完成首诊记录后自动生成评估报告
          </Text>
          <View
            style={{
              marginTop: '64rpx',
              padding: '24rpx 48rpx',
              background: 'linear-gradient(135deg,#1A73E8 0%, #00BFA5 100%)',
              borderRadius: '48rpx',
              color: '#fff',
              fontWeight: 600
            }}
            onClick={() => Taro.navigateBack()}
          >
            <Text>返回患者列表</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

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
            <Text style={{ fontSize: '22rpx', opacity: 0.7, marginTop: '12rpx', display: 'block' }}>
              患者：{patient?.name || '关联患者'} · 评估日期：{assessment.assessmentDate}
            </Text>
          </View>
        </View>
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

      {assessment.warnings && assessment.warnings.length > 0 && (
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
      )}

      {/* 临床建议 - 分三大类 */}
      <View className={styles.adviceCard}>
        <View className={styles.adviceTitle}><Text>💊</Text><Text>临床建议</Text></View>

        {!advice ? (
          <View style={{
            padding: '64rpx 24rpx',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: '80rpx', marginBottom: '20rpx' }}>📝</Text>
            <Text style={{ fontSize: '28rpx', color: '#86909C', marginBottom: '12rpx' }}>
              暂未生成医嘱建议
            </Text>
            <Text style={{ fontSize: '24rpx', color: '#C9CDD4', textAlign: 'center' }}>
              可在首诊记录保存后系统自动生成推荐方案
            </Text>
          </View>
        ) : (
          <>
            {/* 用药核对 */}
            <View style={{ marginBottom: '32rpx' }}>
              <View style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12rpx',
                marginBottom: '16rpx'
              }}>
                <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1A73E8' }}>💊 用药方案</Text>
                <Text style={{
                  fontSize: '22rpx',
                  padding: '4rpx 16rpx',
                  background: 'rgba(26,115,232,0.12)',
                  color: '#1A73E8',
                  borderRadius: '32rpx'
                }}>{advice.medications.length}种药物</Text>
              </View>
              {advice.medications.map((m, idx) => (
                <View key={idx} style={{
                  padding: '20rpx',
                  background: '#fff',
                  borderRadius: '12rpx',
                  marginBottom: '12rpx',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1rpx solid rgba(26,115,232,0.1)'
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: '6rpx' }}>
                      {m.name}
                    </Text>
                    <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                      {m.route} · {m.dose} · {m.frequency}
                    </Text>
                  </View>
                  {m.duration && (
                    <TagBadge type="normal" size="sm">{m.duration}</TagBadge>
                  )}
                </View>
              ))}

              {advice.medicationChecks && advice.medicationChecks.length > 0 && (
                <View style={{ marginTop: '16rpx' }}>
                  <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#4E5969', display: 'block', marginBottom: '12rpx' }}>
                    ✅ 用药核对结果
                  </Text>
                  {advice.medicationChecks.map((mc, idx) => (
                    <View key={idx} style={{
                      padding: '16rpx 20rpx',
                      background: mc.status === 'pass' ? 'rgba(16,185,129,0.06)' :
                                  mc.status === 'warning' ? 'rgba(245,158,11,0.06)' :
                                  'rgba(239,68,68,0.06)',
                      borderRadius: '12rpx',
                      marginBottom: '8rpx',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12rpx'
                    }}>
                      <Text>
                        {mc.status === 'pass' ? '✅' : mc.status === 'warning' ? '⚠️' : '⛔'}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block' }}>
                          {mc.medication}
                        </Text>
                        <Text style={{ fontSize: '22rpx', color: '#4E5969' }}>{mc.message}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 检查推荐 */}
            {advice.examRecommendations && advice.examRecommendations.length > 0 && (
              <View style={{ marginBottom: '32rpx' }}>
                <View style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12rpx',
                  marginBottom: '16rpx'
                }}>
                  <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#00BFA5' }}>🧪 检查推荐</Text>
                </View>
                {advice.examRecommendations.map((er, idx) => (
                  <View key={idx} style={{
                    padding: '16rpx 20rpx',
                    background: '#fff',
                    borderRadius: '12rpx',
                    marginBottom: '10rpx',
                    border: '1rpx solid rgba(0,191,165,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: '28rpx', fontWeight: 500, color: '#1D2129', display: 'block' }}>
                        {er.examType}
                      </Text>
                      <Text style={{ fontSize: '22rpx', color: '#86909C' }}>{er.reason}</Text>
                    </View>
                    <TagBadge
                      type={er.urgency === 'emergent' ? 'critical' : er.urgency === 'urgent' ? 'warning' : 'normal'}
                      size="sm"
                    >
                      {urgencyMap[er.urgency]}
                    </TagBadge>
                  </View>
                ))}
              </View>
            )}

            {/* 禁忌提醒 */}
            {advice.contraindications && advice.contraindications.length > 0 && (
              <View style={{ marginBottom: '16rpx' }}>
                <View style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12rpx',
                  marginBottom: '16rpx'
                }}>
                  <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#EF4444' }}>⛔ 禁忌与注意事项</Text>
                </View>
                {advice.contraindications.map((c, idx) => (
                  <View key={idx} style={{
                    padding: '16rpx 20rpx',
                    background: 'rgba(239,68,68,0.04)',
                    borderRadius: '12rpx',
                    marginBottom: '10rpx',
                    borderLeft: '4rpx solid #EF4444',
                    paddingLeft: '24rpx'
                  }}>
                    <Text style={{ fontSize: '26rpx', color: '#4E5969', lineHeight: 1.6 }}>
                      <Text style={{ color: '#EF4444', fontWeight: 500 }}>● </Text>
                      {c}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* 生活方式建议 */}
            {advice.lifestyleAdvice && advice.lifestyleAdvice.length > 0 && (
              <View>
                <View style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12rpx',
                  marginBottom: '16rpx'
                }}>
                  <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#10B981' }}>🏃 健康指导</Text>
                </View>
                {advice.lifestyleAdvice.map((l, idx) => (
                  <Text key={idx} className={styles.adviceItem}>{l}</Text>
                ))}
              </View>
            )}

            {advice.notes && (
              <View style={{
                marginTop: '32rpx',
                padding: '20rpx',
                background: 'rgba(245,158,11,0.06)',
                borderRadius: '12rpx'
              }}>
                <Text style={{ fontSize: '24rpx', color: '#B45309', lineHeight: 1.6 }}>
                  💡 医师备注：{advice.notes}
                </Text>
              </View>
            )}
          </>
        )}
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
