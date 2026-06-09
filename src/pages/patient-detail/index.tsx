import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { usePatientStore } from '../../store/patientStore';
import SectionCard from '../../components/SectionCard';
import TagBadge from '../../components/TagBadge';
import { getRiskLevelText } from '../../utils/riskCalc';
import type { FollowUp, MedicationItem } from '../../types';
import styles from './index.module.scss';

const typeLabels: Record<FollowUp['type'], string> = {
  checkup: '常规检查',
  medication: '用药调整',
  reexamination: '术后复查',
  phone: '电话随访'
};

const PatientDetailPage: React.FC = () => {
  const router = useRouter();
  const patientId = router.params?.id || 'P001';

  useDidShow(() => {
    console.log('[PatientDetail] 页面显示，患者ID:', patientId);
  });

  const getPatientById = usePatientStore((s) => s.getPatientById);
  const getFirstVisitRecordsByPatientId = usePatientStore((s) => s.getFirstVisitRecordsByPatientId);
  const getLatestExamByPatientId = usePatientStore((s) => s.getLatestExamByPatientId);
  const getExamResultsByPatientId = usePatientStore((s) => s.getExamResultsByPatientId);
  const getRiskAssessmentByPatientId = usePatientStore((s) => s.getRiskAssessmentByPatientId);
  const getDoctorAdviceByPatientId = usePatientStore((s) => s.getDoctorAdviceByPatientId);
  const getFollowUpsByPatientId = usePatientStore((s) => s.getFollowUpsByPatientId);

  const patient = useMemo(() => getPatientById(patientId), [patientId, getPatientById]);
  const firstVisits = useMemo(() => getFirstVisitRecordsByPatientId(patientId), [patientId, getFirstVisitRecordsByPatientId]);
  const latestExam = useMemo(() => getLatestExamByPatientId(patientId), [patientId, getLatestExamByPatientId]);
  const allExams = useMemo(() => getExamResultsByPatientId(patientId), [patientId, getExamResultsByPatientId]);
  const riskAssess = useMemo(() => getRiskAssessmentByPatientId(patientId), [patientId, getRiskAssessmentByPatientId]);
  const doctorAdvice = useMemo(() => getDoctorAdviceByPatientId(patientId), [patientId, getDoctorAdviceByPatientId]);
  const followUps = useMemo(() => getFollowUpsByPatientId(patientId), [patientId, getFollowUpsByPatientId]);

  const latestFV = firstVisits[0];

  if (!patient) {
    return (
      <ScrollView scrollY className={styles.pageWrap}>
        <View style={{ padding: '160rpx 32rpx', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <Text style={{ fontSize: '100rpx' }}>🏥</Text>
          <Text style={{ fontSize: '32rpx', marginTop: '24rpx', color: '#86909C' }}>未找到患者信息</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.header} style={{
        background: patient.riskLevel === 'critical'
          ? 'linear-gradient(135deg,#7F1D1D 0%,#FCA5A5 100%)'
          : patient.riskLevel === 'warning'
            ? 'linear-gradient(135deg,#1A73E8 0%,#93C5FD 100%)'
            : 'linear-gradient(135deg,#0F766E 0%,#5EEAD4 100%)'
      }}>
        <View className={styles.patientRow}>
          <View className={styles.avatar} style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2rpx solid rgba(255,255,255,0.4)'
          }}>
            <Text style={{ color: '#fff' }}>{patient.name.charAt(0)}</Text>
          </View>
          <View className={styles.info}>
            <Text className={styles.name} style={{ color: '#fff' }}>{patient.name}</Text>
            <Text className={styles.meta} style={{ color: 'rgba(255,255,255,0.85)' }}>
              {patient.gender} · {patient.age}岁 · {patient.patientNo}
            </Text>
            <Text className={styles.meta} style={{ color: 'rgba(255,255,255,0.75)', marginTop: '4rpx' }}>
              {patient.bedNo ? `${patient.ward} ${patient.bedNo}` : '门诊患者'} · {patient.lastVisitDate}
            </Text>
          </View>
          <TagBadge
            type={patient.riskLevel === 'critical' ? 'critical' : patient.riskLevel === 'warning' ? 'warning' : 'normal'}
            showDot size="lg"
            style={{ background: 'rgba(255,255,255,0.95)' }}
          >
            {getRiskLevelText(patient.riskLevel)}
          </TagBadge>
        </View>

        <View className={styles.tagsRow}>
          <View style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12rpx',
            padding: '8rpx 0 4rpx',
            width: '100%'
          }}>
            {[
              ...patient.tags,
              firstVisits.length > 0 ? `已${firstVisits.length}诊` : '',
              allExams.length > 0 ? `${allExams.length}次检查` : '',
              latestFV?.medications?.length ? `${latestFV.medications.length}种药` : ''
            ].filter(Boolean).map((tag, idx) => (
              <View key={idx} className={styles.tagItem} style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1rpx solid rgba(255,255,255,0.3)',
                color: '#fff'
              }}>
                <Text style={{ color: '#fff', fontSize: '22rpx' }}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.contentSection}>
        {/* 最新生命体征 */}
        <View className={styles.quickInfo}>
          <View className={styles.infoItem}>
            <Text className={styles.label}>🩸 血压</Text>
            <Text className={styles.value} style={{
              color: (latestExam?.vitalSigns?.bpSystolic || latestExam?.vitalSigns?.systolicBP) && ((latestExam?.vitalSigns?.bpSystolic || latestExam?.vitalSigns?.systolicBP) as number) > 140 ? '#F53F3F' : '#1D2129'
            }}>
              {latestExam?.vitalSigns ? `${latestExam.vitalSigns.bpSystolic || latestExam.vitalSigns.systolicBP || '-'}/${latestExam.vitalSigns.bpDiastolic || latestExam.vitalSigns.diastolicBP || '-'}` : '-/-'}
            </Text>
            <Text className={{
              ...styles.label,
              ...{ fontSize: '20rpx', marginTop: '4rpx', color: '#86909C' }
            } as any}>
              {latestExam?.examDate ? `(${latestExam.examDate})` : '暂无数据'}
            </Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.label}>💗 心率</Text>
            <Text className={styles.value} style={{
              color: latestExam?.vitalSigns?.heartRate && (latestExam.vitalSigns.heartRate > 100 || latestExam.vitalSigns.heartRate < 60) ? '#F53F3F' : '#1D2129'
            }}>
              {latestExam?.vitalSigns?.heartRate || '-'}
            </Text>
            <Text className={{
              ...styles.label,
              ...{ fontSize: '20rpx', marginTop: '4rpx', color: '#86909C' }
            } as any}>次/分</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.label}>🌡️ 体温</Text>
            <Text className={styles.value}>
              {latestExam?.vitalSigns?.temperature || '-'}
            </Text>
            <Text className={{
              ...styles.label,
              ...{ fontSize: '20rpx', marginTop: '4rpx', color: '#86909C' }
            } as any}>℃</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.label}>📊 风险</Text>
            <Text className={styles.value} style={{
              color: riskAssess?.overallRisk === 'critical' ? '#F53F3F'
                : riskAssess?.overallRisk === 'warning' ? '#F7BA1E' : '#10B981'
            }}>
              {riskAssess?.score || '-'}
            </Text>
            <Text className={{
              ...styles.label,
              ...{ fontSize: '20rpx', marginTop: '4rpx', color: '#86909C' }
            } as any}>
              {riskAssess?.model || 'GRACE'}分
            </Text>
          </View>
        </View>

        {/* 诊断信息 */}
        <SectionCard
          title="🩺 诊断信息"
          extra={<TagBadge type={patient.riskLevel}>{getRiskLevelText(patient.riskLevel)}</TagBadge>}
        >
          <Text style={{ fontSize: '30rpx', fontWeight: 600, color: '#1D2129', display: 'block', marginBottom: '12rpx' }}>
            {patient.diagnosis}
          </Text>
          <Text style={{ fontSize: '28rpx', color: '#4E5969', lineHeight: 1.6, display: 'block', marginBottom: '16rpx' }}>
            主诉：{patient.chiefComplaint}
          </Text>
          <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12rpx' }}>
            {patient.tags.map((t, i) => (
              <TagBadge key={i} type="default" size="sm">{t}</TagBadge>
            ))}
          </View>
        </SectionCard>

        {/* 首诊记录（用药/病史/过敏） */}
        <SectionCard
          title={`📝 首诊记录 ${firstVisits.length > 0 ? `(${firstVisits.length}条)` : ''}`}
          extra={
            <Text
              style={{ fontSize: '24rpx', color: '#1A73E8' }}
              onClick={() => Taro.navigateTo({ url: `/pages/record-edit/index?patientId=${patient.id}` })}
            >
              {latestFV ? '继续编辑 ›' : '+ 新建 ›'}
            </Text>
          }
          onClick={() => Taro.navigateTo({ url: `/pages/record-edit/index?patientId=${patient.id}` })}
        >
          {!latestFV ? (
            <View style={{
              padding: '32rpx 24rpx',
              background: 'linear-gradient(135deg, rgba(26,115,232,0.04) 0%, rgba(0,191,165,0.04) 100%)',
              borderRadius: '12rpx',
              border: '1rpx dashed rgba(26,115,232,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '16rpx'
            }}>
              <Text style={{ fontSize: '48rpx' }}>📋</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block', marginBottom: '4rpx' }}>
                  还没有首诊记录
                </Text>
                <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                  点击右上角快速录入症状、病史、用药和过敏信息
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <View style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16rpx'
              }}>
                <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                  最近就诊：{latestFV.visitDate} · 主治医师：{latestFV.doctor}
                </Text>
              </View>

              <View style={{
                padding: '16rpx 20rpx',
                background: '#F7F8FA',
                borderRadius: '10rpx',
                marginBottom: '16rpx'
              }}>
                <Text style={{ fontSize: '22rpx', color: '#86909C', marginBottom: '8rpx', display: 'block' }}>🩹 症状描述</Text>
                <Text style={{ fontSize: '28rpx', color: '#1D2129', lineHeight: 1.6 }}>
                  {latestFV.symptoms}
                </Text>
              </View>

              <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16rpx', marginBottom: '16rpx' }}>
                <View style={{ padding: '16rpx 20rpx', background: '#EFF6FF', borderRadius: '10rpx' }}>
                  <Text style={{ fontSize: '22rpx', color: '#1A73E8', marginBottom: '8rpx', display: 'block', fontWeight: 500 }}>
                    📜 既往病史
                  </Text>
                  <Text style={{ fontSize: '24rpx', color: '#1D2129', lineHeight: 1.5 }}>
                    {((latestFV.pastHistory && latestFV.pastHistory.length > 0)
                      ? latestFV.pastHistory
                      : (latestFV.medicalHistory && latestFV.medicalHistory.length > 0 ? latestFV.medicalHistory : [])).join('、') || '无特殊病史'}
                  </Text>
                </View>
                <View style={{
                  padding: '16rpx 20rpx',
                  background: Array.isArray(latestFV.allergies) && latestFV.allergies.length > 0
                    ? 'rgba(245,63,63,0.06)' : '#F7F8FA',
                  borderRadius: '10rpx',
                  borderLeft: Array.isArray(latestFV.allergies) && latestFV.allergies.length > 0
                    ? '4rpx solid #F53F3F' : '4rpx solid transparent'
                }}>
                  <Text style={{
                    fontSize: '22rpx',
                    color: Array.isArray(latestFV.allergies) && latestFV.allergies.length > 0 ? '#F53F3F' : '#86909C',
                    marginBottom: '8rpx',
                    display: 'block',
                    fontWeight: 500
                  }}>
                    ⚠️ 过敏史
                  </Text>
                  <Text style={{
                    fontSize: '24rpx',
                    color: '#1D2129',
                    lineHeight: 1.5
                  }}>
                    {(Array.isArray(latestFV.allergies) && latestFV.allergies.length > 0)
                      ? latestFV.allergies.join('、')
                      : (typeof latestFV.allergies === 'string' ? latestFV.allergies : '无过敏史')}
                  </Text>
                </View>
              </View>

              {/* 用药列表 */}
              {latestFV.medications && latestFV.medications.length > 0 && (
                <View style={{
                  padding: '20rpx',
                  background: 'rgba(139,92,246,0.04)',
                  borderRadius: '12rpx',
                  borderLeft: '5rpx solid #8B5CF6'
                }}>
                  <Text style={{
                    fontSize: '24rpx',
                    color: '#7C3AED',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8rpx',
                    marginBottom: '16rpx'
                  }}>
                    <Text>💊 当前用药（{latestFV.medications.length}种）</Text>
                  </Text>
                  <View style={{ display: 'flex', flexDirection: 'column', gap: '10rpx' }}>
                    {latestFV.medications.map((m: MedicationItem, idx: number) => (
                      <View key={m.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12rpx 16rpx',
                        background: '#fff',
                        borderRadius: '8rpx',
                        gap: '12rpx'
                      }}>
                        <Text style={{
                          width: '36rpx',
                          height: '36rpx',
                          borderRadius: '10rpx',
                          background: 'rgba(139,92,246,0.12)',
                          color: '#7C3AED',
                          fontSize: '22rpx',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {idx + 1}
                        </Text>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{
                            fontSize: '26rpx',
                            fontWeight: 500,
                            color: '#1D2129',
                            display: 'block'
                          }}>
                            {m.name}
                            {m.category && (
                              <Text style={{
                                fontSize: '18rpx',
                                color: '#8B5CF6',
                                background: 'rgba(139,92,246,0.1)',
                                padding: '2rpx 10rpx',
                                borderRadius: '20rpx',
                                marginLeft: '10rpx',
                                fontWeight: 400
                              }}>{m.category}</Text>
                            )}
                          </Text>
                          <Text style={{ fontSize: '22rpx', color: '#86909C', marginTop: '2rpx' }}>
                            {m.dose} · {m.frequency} · {m.route}
                            {m.startDate && ` · 自${m.startDate}`}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </SectionCard>

        {/* 最新检查结果 */}
        <SectionCard
          title={`🔬 最新检查 ${allExams.length > 1 ? `(共${allExams.length}次)` : ''}`}
          extra={
            <Text
              style={{ fontSize: '24rpx', color: '#1A73E8' }}
              onClick={() => Taro.navigateTo({ url: `/pages/exam-edit/index?patientId=${patient.id}` })}
            >
              {latestExam ? '+ 录入新检查 ›' : '+ 录入 ›'}
            </Text>
          }
        >
          {!latestExam ? (
            <View style={{
              padding: '48rpx 24rpx',
              textAlign: 'center' as const,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: '60rpx', marginBottom: '12rpx' }}>🧪</Text>
              <Text style={{ fontSize: '26rpx', color: '#86909C' }}>暂无检查数据</Text>
            </View>
          ) : (
            <View>
              {/* 生命体征 */}
              {latestExam.vitalSigns && (
                <View style={{ marginBottom: '20rpx' }}>
                  <Text style={{ fontSize: '22rpx', color: '#86909C', marginBottom: '12rpx', display: 'block' }}>
                    ❤️ 生命体征 · {latestExam.examDate}
                  </Text>
                  <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16rpx' }}>
                    <View style={{
                      padding: '16rpx 20rpx',
                      background: ((latestExam.vitalSigns.bpSystolic || latestExam.vitalSigns.systolicBP) as number) > 140 ? 'rgba(245,63,63,0.06)' : '#F7F8FA',
                      borderRadius: '10rpx'
                    }}>
                      <Text style={{ fontSize: '22rpx', color: '#86909C' }}>血压(BP)</Text>
                      <Text style={{
                        fontSize: '32rpx',
                        fontWeight: 700,
                        color: ((latestExam.vitalSigns.bpSystolic || latestExam.vitalSigns.systolicBP) as number) > 140 ? '#F53F3F' : '#1D2129',
                        marginTop: '6rpx',
                        display: 'block'
                      }}>
                        {latestExam.vitalSigns.bpSystolic || latestExam.vitalSigns.systolicBP}/{latestExam.vitalSigns.bpDiastolic || latestExam.vitalSigns.diastolicBP}
                        <Text style={{ fontSize: '20rpx', color: '#86909C', fontWeight: 400 }}> mmHg</Text>
                      </Text>
                    </View>
                    <View style={{
                      padding: '16rpx 20rpx',
                      background: (latestExam.vitalSigns.heartRate > 100 || latestExam.vitalSigns.heartRate < 60) ? 'rgba(245,63,63,0.06)' : '#F7F8FA',
                      borderRadius: '10rpx'
                    }}>
                      <Text style={{ fontSize: '22rpx', color: '#86909C' }}>心率(HR)</Text>
                      <Text style={{
                        fontSize: '32rpx',
                        fontWeight: 700,
                        color: (latestExam.vitalSigns.heartRate > 100 || latestExam.vitalSigns.heartRate < 60) ? '#F53F3F' : '#1D2129',
                        marginTop: '6rpx',
                        display: 'block'
                      }}>
                        {latestExam.vitalSigns.heartRate}
                        <Text style={{ fontSize: '20rpx', color: '#86909C', fontWeight: 400 }}> 次/分</Text>
                      </Text>
                    </View>
                    {latestExam.vitalSigns.temperature && (
                      <View style={{ padding: '16rpx 20rpx', background: '#F7F8FA', borderRadius: '10rpx' }}>
                        <Text style={{ fontSize: '22rpx', color: '#86909C' }}>体温</Text>
                        <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1D2129', marginTop: '6rpx', display: 'block' }}>
                          {latestExam.vitalSigns.temperature} ℃
                        </Text>
                      </View>
                    )}
                    {(latestExam.vitalSigns.spo2 || latestExam.vitalSigns.oxygenSaturation) && (
                      <View style={{ padding: '16rpx 20rpx', background: '#F7F8FA', borderRadius: '10rpx' }}>
                        <Text style={{ fontSize: '22rpx', color: '#86909C' }}>SpO₂</Text>
                        <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#10B981', marginTop: '6rpx', display: 'block' }}>
                          {latestExam.vitalSigns.spo2 || latestExam.vitalSigns.oxygenSaturation}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* 心电图 */}
              {latestExam.ecg && (
                <View style={{
                  marginBottom: '20rpx',
                  padding: '20rpx',
                  background: 'linear-gradient(135deg, rgba(26,115,232,0.05) 0%, rgba(0,191,165,0.05) 100%)',
                  borderRadius: '12rpx'
                }}>
                  <Text style={{ fontSize: '22rpx', color: '#1A73E8', marginBottom: '12rpx', display: 'block', fontWeight: 500 }}>
                    📈 心电图结论
                  </Text>
                  <View style={{ display: 'flex', gap: '16rpx', alignItems: 'center', marginBottom: '12rpx' }}>
                    <Text style={{ fontSize: '24rpx', color: '#4E5969', background: '#fff', padding: '6rpx 16rpx', borderRadius: '8rpx' }}>
                      {latestExam.ecg.rhythm || '窦性心律'}
                    </Text>
                    <Text style={{ fontSize: '24rpx', color: '#4E5969', background: '#fff', padding: '6rpx 16rpx', borderRadius: '8rpx' }}>
                      心室率 {latestExam.ecg.heartRate || '-'} 次/分
                    </Text>
                  </View>
                  <Text style={{ fontSize: '28rpx', color: '#1D2129', fontWeight: 500, lineHeight: 1.6 }}>
                    {latestExam.ecg.conclusion}
                  </Text>
                  {latestExam.ecg.description && (
                    <Text style={{ fontSize: '24rpx', color: '#86909C', lineHeight: 1.6, marginTop: '8rpx', display: 'block' }}>
                      {latestExam.ecg.description}
                    </Text>
                  )}
                </View>
              )}

              {/* 化验异常项 */}
              {latestExam.labTests && latestExam.labTests.some(l => l.isAbnormal) && (
                <View style={{
                  marginBottom: '20rpx',
                  padding: '20rpx',
                  background: 'rgba(245,63,63,0.04)',
                  borderRadius: '12rpx',
                  borderLeft: '5rpx solid #F53F3F'
                }}>
                  <Text style={{ fontSize: '24rpx', color: '#F53F3F', marginBottom: '12rpx', display: 'block', fontWeight: 600 }}>
                    ⚠️ 异常化验项
                  </Text>
                  {latestExam.labTests.filter(l => l.isAbnormal).slice(0, 5).map((t, idx) => (
                    <View key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10rpx 0',
                      borderBottom: idx < Math.min(latestExam.labTests!.filter(l => l.isAbnormal).length, 5) - 1 ? '1rpx solid rgba(245,63,63,0.1)' : 'none'
                    }}>
                      <Text style={{ fontSize: '24rpx', color: '#1D2129' }}>{t.name}</Text>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                        <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#F53F3F' }}>
                          {t.value} <Text style={{ fontSize: '20rpx', color: '#86909C', fontWeight: 400 }}>{t.unit}</Text>
                        </Text>
                        <Text style={{ fontSize: '20rpx', color: '#F53F3F', background: 'rgba(245,63,63,0.1)', padding: '4rpx 10rpx', borderRadius: '8rpx' }}>
                          参考 {t.refRange || t.referenceRange}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* 常规化验 */}
              {latestExam.labTests && latestExam.labTests.length > 0 && (
                <View style={{ marginBottom: '12rpx' }}>
                  <Text style={{ fontSize: '22rpx', color: '#86909C', marginBottom: '12rpx', display: 'block' }}>
                    🧪 化验结果（{latestExam.labTests.length}项）
                  </Text>
                  <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12rpx' }}>
                    {latestExam.labTests.filter(l => !l.isAbnormal).slice(0, 4).map((t, idx) => (
                      <View key={idx} style={{
                        padding: '12rpx 16rpx',
                        background: '#F7F8FA',
                        borderRadius: '10rpx'
                      }}>
                        <Text style={{ fontSize: '20rpx', color: '#86909C', display: 'block' }}>{t.name}</Text>
                        <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#10B981', marginTop: '4rpx', display: 'block' }}>
                          {t.value}{t.unit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 超声/影像 */}
              {(latestExam.echo || latestExam.imagingSummary) && (
                <View style={{
                  padding: '20rpx',
                  background: 'rgba(16,185,129,0.04)',
                  borderRadius: '12rpx',
                  marginTop: '16rpx'
                }}>
                  <Text style={{ fontSize: '24rpx', color: '#10B981', marginBottom: '12rpx', display: 'block', fontWeight: 500 }}>
                    🏥 影像学检查
                  </Text>
                  {latestExam.echo && (
                    <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12rpx', marginBottom: '12rpx' }}>
                      {latestExam.echo.lvef && (
                        <View style={{ padding: '12rpx 16rpx', background: '#fff', borderRadius: '10rpx' }}>
                          <Text style={{ fontSize: '20rpx', color: '#86909C' }}>LVEF</Text>
                          <Text style={{
                            fontSize: '30rpx', fontWeight: 700,
                            color: latestExam.echo.lvef < 50 ? '#F53F3F' : '#10B981',
                            marginTop: '4rpx', display: 'block'
                          }}>
                            {latestExam.echo.lvef}%
                          </Text>
                        </View>
                      )}
                      {latestExam.echo.lvdd && (
                        <View style={{ padding: '12rpx 16rpx', background: '#fff', borderRadius: '10rpx' }}>
                          <Text style={{ fontSize: '20rpx', color: '#86909C' }}>LVDD</Text>
                          <Text style={{
                            fontSize: '30rpx', fontWeight: 700,
                            color: latestExam.echo.lvdd > 55 ? '#F53F3F' : '#1D2129',
                            marginTop: '4rpx', display: 'block'
                          }}>
                            {latestExam.echo.lvdd}mm
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  {latestExam.echo?.summary && (
                    <Text style={{ fontSize: '24rpx', color: '#1D2129', lineHeight: 1.6 }}>
                      {latestExam.echo.summary}
                    </Text>
                  )}
                  {latestExam.imagingSummary && (
                    <Text style={{
                      fontSize: '24rpx', color: '#1D2129', lineHeight: 1.6,
                      marginTop: latestExam.echo?.summary ? '12rpx' : 0,
                      display: 'block'
                    }}>
                      {latestExam.imagingSummary}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </SectionCard>

        {/* 风险评估 */}
        {riskAssess ? (
          <SectionCard
            title="📊 风险评估"
            extra={
              <TagBadge type={riskAssess.overallRisk === 'critical' ? 'critical' : riskAssess.overallRisk === 'warning' ? 'warning' : 'normal'} showDot>
                {getRiskLevelText(riskAssess.overallRisk)} · {riskAssess.score}分
              </TagBadge>
            }
            onClick={() => Taro.navigateTo({ url: `/pages/risk-detail/index?patientId=${patient.id}&id=${riskAssess.id}` })}
          >
            <Text style={{ fontSize: '26rpx', color: '#4E5969', lineHeight: 1.7, display: 'block', marginBottom: '12rpx' }}>
              <Text style={{ color: riskAssess.overallRisk === 'critical' ? '#F53F3F' : '#1D2129', fontWeight: 500 }}>
                {riskAssess.model}风险分层：{getRiskLevelText(riskAssess.overallRisk)}
              </Text>
            </Text>
            {riskAssess.warnings && riskAssess.warnings.length > 0 && (
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '10rpx' }}>
                {riskAssess.warnings.slice(0, 4).map((w, i) => (
                  <TagBadge key={i} type={riskAssess.overallRisk === 'critical' ? 'critical' : 'warning'} size="sm">
                    ⚠ {w}
                  </TagBadge>
                ))}
              </View>
            )}
          </SectionCard>
        ) : (
          <SectionCard
            title="📊 风险评估"
            extra={<Text style={{ fontSize: '24rpx', color: '#1A73E8' }}>立即评估 ›</Text>}
            onClick={() => Taro.navigateTo({ url: '/pages/assessment/index' })}
          >
            <View style={{
              padding: '24rpx',
              background: 'rgba(26,115,232,0.04)',
              borderRadius: '12rpx',
              display: 'flex',
              alignItems: 'center',
              gap: '16rpx'
            }}>
              <Text style={{ fontSize: '48rpx' }}>📈</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '26rpx', color: '#1D2129', fontWeight: 500, display: 'block', marginBottom: '4rpx' }}>
                  还未进行风险分层
                </Text>
                <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                  支持GRACE/TIMI/HAS-BLED评分，生成临床建议
                </Text>
              </View>
            </View>
          </SectionCard>
        )}

        {/* 医嘱建议 */}
        {doctorAdvice ? (
          <SectionCard
            title="💊 医嘱建议"
            extra={<Text style={{ fontSize: '24rpx', color: '#1A73E8' }}>用药核对 ›</Text>}
            onClick={() => riskAssess && Taro.navigateTo({ url: `/pages/risk-detail/index?patientId=${patient.id}&id=${riskAssess.id}` })}
          >
            {doctorAdvice.medications && doctorAdvice.medications.length > 0 && (
              <View style={{ marginBottom: '16rpx' }}>
                <Text style={{ fontSize: '22rpx', color: '#86909C', marginBottom: '12rpx', display: 'block' }}>
                  推荐治疗方案（{doctorAdvice.medications.length}种）
                </Text>
                <View style={{ display: 'flex', flexDirection: 'column', gap: '10rpx' }}>
                  {doctorAdvice.medications.slice(0, 4).map((m, idx) => (
                    <View key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12rpx 16rpx',
                      background: '#F7F8FA',
                      borderRadius: '10rpx'
                    }}>
                      <Text style={{ fontSize: '26rpx', color: '#1D2129', fontWeight: 500 }}>{m.name}</Text>
                      <Text style={{ fontSize: '22rpx', color: '#4E5969' }}>
                        {m.dose} · {m.frequency}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {doctorAdvice.examRecommendations && doctorAdvice.examRecommendations.length > 0 && (
              <View>
                <Text style={{ fontSize: '22rpx', color: '#86909C', marginBottom: '12rpx', display: 'block' }}>
                  🧪 推荐检查
                </Text>
                <View style={{ display: 'flex', flexWrap: 'wrap', gap: '10rpx' }}>
                  {doctorAdvice.examRecommendations.slice(0, 5).map((c, i) => (
                    <TagBadge key={i} type="default" size="sm">{c.examType}</TagBadge>
                  ))}
                </View>
              </View>
            )}
            {doctorAdvice.contraindications && doctorAdvice.contraindications.length > 0 && (
              <View style={{
                marginTop: '16rpx',
                padding: '16rpx 20rpx',
                background: 'rgba(245,63,63,0.05)',
                borderLeft: '4rpx solid #F53F3F',
                borderRadius: '8rpx'
              }}>
                <Text style={{ fontSize: '24rpx', color: '#F53F3F', fontWeight: 600, display: 'block', marginBottom: '8rpx' }}>
                  ⛔ 禁忌/注意事项
                </Text>
                {doctorAdvice.contraindications.map((c, i) => (
                  <Text key={i} style={{ fontSize: '24rpx', color: '#7F1D1D', lineHeight: 1.6, display: 'block' }}>
                    • {c}
                  </Text>
                ))}
              </View>
            )}
          </SectionCard>
        ) : (
          <SectionCard
            title="💊 医嘱建议"
            extra={<Text style={{ fontSize: '24rpx', color: '#1A73E8' }}>风险详情 ›</Text>}
            onClick={() => Taro.navigateTo({ url: '/pages/assessment/index' })}
          >
            <View style={{
              padding: '24rpx',
              background: '#F7F8FA',
              borderRadius: '12rpx',
              display: 'flex',
              alignItems: 'center',
              gap: '16rpx'
            }}>
              <Text style={{ fontSize: '48rpx' }}>📝</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block', marginBottom: '4rpx' }}>
                  暂未生成医嘱建议
                </Text>
                <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                  完成风险评估后将自动生成用药核对、检查推荐与禁忌提醒
                </Text>
              </View>
            </View>
          </SectionCard>
        )}

        {/* 随访计划 */}
        <SectionCard
          title={`📅 随访计划 ${followUps.length > 0 ? `(${followUps.length}条)` : ''}`}
          extra={
            <Text
              style={{ fontSize: '24rpx', color: '#1A73E8' }}
              onClick={() => Taro.navigateTo({ url: `/pages/followup-detail/index?patientId=${patient.id}` })}
            >
              + 新建 ›
            </Text>
          }
        >
          {followUps.length === 0 ? (
            <View style={{
              padding: '32rpx 24rpx',
              background: '#F7F8FA',
              borderRadius: '12rpx',
              display: 'flex',
              alignItems: 'center',
              gap: '16rpx'
            }}>
              <Text style={{ fontSize: '48rpx' }}>📅</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '26rpx', fontWeight: 500, color: '#1D2129', display: 'block', marginBottom: '4rpx' }}>
                  暂无随访安排
                </Text>
                <Text style={{ fontSize: '22rpx', color: '#86909C' }}>
                  点击右上角安排复诊、复查或电话随访
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ display: 'flex', flexDirection: 'column', gap: '12rpx' }}>
              {followUps.slice(0, 3).map((fu) => (
                <View
                  key={fu.id}
                  onClick={() => Taro.navigateTo({ url: `/pages/followup-detail/index?id=${fu.id}&patientId=${patient.id}` })}
                  style={{
                    padding: '16rpx 20rpx',
                    background: fu.status === 'completed' ? '#F2F3F5'
                      : fu.status === 'missed' ? 'rgba(245,63,63,0.05)'
                        : 'linear-gradient(135deg, rgba(26,115,232,0.04), rgba(0,191,165,0.04))',
                    borderRadius: '12rpx',
                    border: fu.status === 'missed' ? '1rpx solid rgba(245,63,63,0.2)' : '1rpx solid rgba(26,115,232,0.1)',
                    opacity: fu.status === 'completed' ? 0.7 : 1
                  }}
                >
                  <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8rpx' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '10rpx', flexWrap: 'wrap' }}>
                      <TagBadge
                        type={fu.status === 'completed' ? 'normal' : fu.status === 'missed' ? 'critical' : 'warning'}
                        size="sm" showDot
                      >
                        {fu.status === 'completed' ? '已完成' : fu.status === 'missed' ? '已逾期' : '待随访'}
                      </TagBadge>
                      <TagBadge type="default" size="sm">{typeLabels[fu.type]}</TagBadge>
                    </View>
                    <Text style={{ fontSize: '22rpx', color: '#86909C' }}>{fu.scheduleDate}</Text>
                  </View>
                  {fu.notes && (
                    <Text style={{ fontSize: '24rpx', color: '#4E5969', lineHeight: 1.5, marginBottom: fu.feedback ? '8rpx' : 0 }}>
                      {fu.notes}
                    </Text>
                  )}
                  {fu.feedback && (
                    <Text style={{
                      fontSize: '22rpx',
                      color: fu.status === 'completed' ? '#10B981' : '#1A73E8',
                      background: fu.status === 'completed' ? 'rgba(16,185,129,0.08)' : 'rgba(26,115,232,0.08)',
                      padding: '8rpx 12rpx',
                      borderRadius: '8rpx',
                      lineHeight: 1.5,
                      display: 'block'
                    }}>
                      💬 {fu.feedback}
                      {fu.completedDate && `（${fu.completedDate}）`}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </SectionCard>

        <View style={{ height: '160rpx' }} />
      </View>

      {/* 底部操作栏 */}
      <View className={styles.actionBar}>
        <View className={`${styles.btn} ${styles.outline}`} onClick={() => Taro.navigateTo({ url: `/pages/record-edit/index?patientId=${patientId}` })}>
          <Text>📝 首诊记录</Text>
        </View>
        <View className={`${styles.btn} ${styles.secondary}`} onClick={() => Taro.navigateTo({ url: `/pages/exam-edit/index?patientId=${patientId}` })}>
          <Text>🔬 检查录入</Text>
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={() => Taro.navigateTo({ url: `/pages/followup-detail/index?patientId=${patientId}` })}>
          <Text>📅 安排随访</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PatientDetailPage;
