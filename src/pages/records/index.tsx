import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { usePatientStore } from '../../store/patientStore';
import TagBadge from '../../components/TagBadge';
import type { FirstVisitRecord, ExamResult, Patient } from '../../types';
import styles from './index.module.scss';

interface TimelineItem {
  id: string;
  type: 'record' | 'exam';
  patientId: string;
  patientName: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  raw: FirstVisitRecord | ExamResult;
}

const RecordsPage: React.FC = () => {
  useDidShow(() => {
    console.log('[RecordsPage] 页面显示 - 从Store重新获取数据');
  });

  const getPatientById = usePatientStore((s) => s.getPatientById);
  const getPatients = usePatientStore((s) => s.getPatients);
  const getAllFirstVisitRecords = usePatientStore((s) => s.getAllFirstVisitRecords);
  const getAllExamResults = usePatientStore((s) => s.getAllExamResults);

  const patients = useMemo(() => getPatients(), [getPatients]);
  const allRecords = useMemo(() => getAllFirstVisitRecords(), [getAllFirstVisitRecords]);
  const allExams = useMemo(() => getAllExamResults(), [getAllExamResults]);

  console.log('[RecordsPage] store数据: 患者=', patients.length, '首诊=', allRecords.length, '检查=', allExams.length);

  const patientName = (pid: string): string => {
    const p = getPatientById(pid);
    return p?.name || '未知';
  };

  const patientInfo = (pid: string): Patient | undefined => getPatientById(pid);

  const timelineData = useMemo<TimelineItem[]>(() => {
    const list: TimelineItem[] = [];

    allRecords.forEach((r) => {
      const tags = [...(r.medicalHistory || [])];
      if (r.medications?.length > 0) tags.push(`用药${r.medications.length}种`);
      if (r.allergies && r.allergies !== '无过敏史') tags.push('过敏史');
      list.push({
        id: r.id,
        type: 'record',
        patientId: r.patientId,
        patientName: patientName(r.patientId),
        date: r.visitDate,
        title: '首诊记录',
        content: r.symptoms + (r.medications?.length ? `；当前${r.medications.length}种药物治疗中` : ''),
        tags: tags.slice(0, 3),
        raw: r
      });
    });

    allExams.forEach((e) => {
      const tags: string[] = [];
      if (e.vitalSigns) {
        tags.push(`BP${e.vitalSigns.bpSystolic}/${e.vitalSigns.bpDiastolic}`);
        tags.push(`HR${e.vitalSigns.heartRate}`);
      }
      if (e.labTests?.length) tags.push(`化验${e.labTests.length}项`);
      if (e.ecg) tags.push('心电图');
      list.push({
        id: e.id,
        type: 'exam',
        patientId: e.patientId,
        patientName: patientName(e.patientId),
        date: e.examDate,
        title: '检查结果',
        content: e.ecg?.conclusion || (e.labTests?.length ? `化验检查${e.labTests.length}项` : '体征测量记录'),
        tags: tags.slice(0, 3),
        raw: e
      });
    });

    return list.sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [allRecords, allExams, patients]);

  const goFirstVisit = () => {
    console.log('[RecordsPage] 新增首诊记录');
    Taro.navigateTo({ url: '/pages/record-edit/index' });
  };

  const goExam = () => {
    console.log('[RecordsPage] 新增检查结果');
    Taro.navigateTo({ url: '/pages/exam-edit/index' });
  };

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      {allRecords.length + allExams.length > 0 && (
        <View style={{
          marginBottom: '20rpx',
          padding: '20rpx 28rpx',
          background: 'linear-gradient(135deg, rgba(26,115,232,0.08) 0%, rgba(0,191,165,0.08) 100%)',
          borderRadius: '16rpx',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <View>
            <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#1D2129', display: 'block' }}>
              共 {allRecords.length + allExams.length} 条诊疗记录
            </Text>
            <Text style={{ fontSize: '22rpx', color: '#86909C', marginTop: '4rpx', display: 'block' }}>
              首诊 {allRecords.length} 条 · 检查 {allExams.length} 条 · 覆盖 {patients.length} 位患者
            </Text>
          </View>
          <Text style={{ fontSize: '48rpx' }}>📈</Text>
        </View>
      )}

      <View className={styles.quickActions}>
        <View
          className={`${styles.actionCard} ${styles.primary}`}
          onClick={goFirstVisit}
        >
          <Text className={styles.actionIcon}>📝</Text>
          <Text className={styles.actionTitle}>首诊记录</Text>
          <Text className={styles.actionDesc}>快速填写症状、病史、用药和过敏信息</Text>
        </View>
        <View
          className={`${styles.actionCard} ${styles.secondary}`}
          onClick={goExam}
        >
          <Text className={styles.actionIcon}>🩺</Text>
          <Text className={styles.actionTitle}>检查结果</Text>
          <Text className={styles.actionDesc}>录入血压、心率、心电图、化验和影像</Text>
        </View>
      </View>

      <View className={styles.recentSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            近期动态 {timelineData.length > 0 ? `（${timelineData.length}条）` : ''}
          </Text>
          {timelineData.length === 0 && (
            <Text className={styles.sectionMore} style={{ color: '#86909C' }}>
              暂无数据
            </Text>
          )}
          {timelineData.length > 6 && (
            <Text className={styles.sectionMore}>查看全部</Text>
          )}
        </View>

        {timelineData.length === 0 ? (
          <View style={{
            padding: '80rpx 32rpx',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#fff',
            borderRadius: '16rpx'
          }}>
            <Text style={{ fontSize: '80rpx', marginBottom: '16rpx' }}>📋</Text>
            <Text style={{ fontSize: '28rpx', fontWeight: 500, color: '#1D2129', marginBottom: '8rpx' }}>
              还没有诊疗记录
            </Text>
            <Text style={{ fontSize: '24rpx', color: '#86909C', textAlign: 'center', marginBottom: '24rpx' }}>
              点击上方卡片开始录入患者的首诊或检查
            </Text>
            <View style={{ display: 'flex', gap: '16rpx' }}>
              <View
                style={{
                  padding: '14rpx 32rpx',
                  background: 'linear-gradient(135deg,#1A73E8,#00BFA5)',
                  color: '#fff',
                  borderRadius: '48rpx',
                  fontSize: '26rpx',
                  fontWeight: 500
                }}
                onClick={goFirstVisit}
              >
                + 写首诊
              </View>
              <View
                style={{
                  padding: '14rpx 32rpx',
                  background: '#F2F3F5',
                  color: '#4E5969',
                  borderRadius: '48rpx',
                  fontSize: '26rpx',
                  fontWeight: 500
                }}
                onClick={goExam}
              >
                + 录检查
              </View>
            </View>
          </View>
        ) : (
          <View className={styles.recordTimeline}>
            <View className={styles.timelineLine} />
            {timelineData.slice(0, 8).map((item, idx) => {
              const p = patientInfo(item.patientId);
              return (
                <View key={item.id} className={styles.timelineItem}>
                  <View
                    className={`${styles.timelineDot} ${
                      item.type === 'exam' ? styles.typeExam : styles.typeRecord
                    }`}
                  />
                  <View
                    className={styles.recordCard}
                    onClick={() => {
                      console.log('[RecordsPage] 查看记录:', item.id, item.title);
                      if (item.type === 'record') {
                        Taro.navigateTo({
                          url: `/pages/record-edit/index?patientId=${item.patientId}&id=${item.id}`
                        });
                      } else {
                        Taro.navigateTo({
                          url: `/pages/exam-edit/index?patientId=${item.patientId}&id=${item.id}`
                        });
                      }
                    }}
                  >
                    <View className={styles.recordHeader}>
                      <Text
                        className={`${styles.recordType} ${
                          item.type === 'exam' ? styles.exam : styles.record
                        }`}
                      >
                        {item.title}
                      </Text>
                      <Text className={styles.recordDate}>{item.date}</Text>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx', marginTop: '6rpx' }}>
                      <Text className={styles.recordPatient}>{item.patientName}</Text>
                      {p?.riskLevel && p.riskLevel !== 'normal' && (
                        <TagBadge type={p.riskLevel} showDot size="sm">
                          {p.riskLevel === 'critical' ? '急重症' : p.riskLevel === 'high' ? '高危' : '中危'}
                        </TagBadge>
                      )}
                      {p?.bedNo && (
                        <Text style={{ fontSize: '20rpx', color: '#86909C' }}>
                          {p.ward}{p.bedNo}
                        </Text>
                      )}
                    </View>
                    <Text className={styles.recordContent}>{item.content}</Text>
                    {item.tags.length > 0 && (
                      <View className={styles.recordTags}>
                        {item.tags.map((tag, tIdx) => (
                          <TagBadge key={tIdx} type="default">
                            {tag}
                          </TagBadge>
                        ))}
                      </View>
                    )}
                    {item.type === 'record' && (item.raw as FirstVisitRecord).medications?.length > 0 && (
                      <View style={{
                        marginTop: '12rpx',
                        padding: '12rpx 16rpx',
                        background: 'rgba(139,92,246,0.06)',
                        borderRadius: '10rpx',
                        borderLeft: '4rpx solid #8B5CF6'
                      }}>
                        <Text style={{ fontSize: '22rpx', color: '#8B5CF6', fontWeight: 500, display: 'block', marginBottom: '6rpx' }}>
                          💊 当前用药 {(item.raw as FirstVisitRecord).medications.length} 种
                        </Text>
                        <Text style={{ fontSize: '22rpx', color: '#4E5969', lineHeight: 1.5 }}>
                          {(item.raw as FirstVisitRecord).medications.slice(0, 3).map(m => `${m.name}${m.dose}`).join('、')}
                          {(item.raw as FirstVisitRecord).medications.length > 3 && '...'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View className={styles.historySection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>快捷操作 · 常用患者</Text>
        </View>

        {patients.slice(0, 6).map((p) => {
          const rCount = allRecords.filter(r => r.patientId === p.id).length;
          const eCount = allExams.filter(e => e.patientId === p.id).length;
          return (
            <View
              key={p.id}
              className={styles.historyItem}
              style={{
                borderLeft: p.riskLevel === 'critical' ? '6rpx solid #F53F3F'
                  : p.riskLevel === 'high' ? '6rpx solid #F7BA1E'
                  : '6rpx solid #1A73E8'
              }}
              onClick={() => {
                console.log('[RecordsPage] 快捷操作患者:', p.id);
                Taro.navigateTo({ url: `/pages/patient-detail/index?id=${p.id}` });
              }}
            >
              <View className={styles.patientInfo}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '12rpx' }}>
                  <Text className={styles.patientName}>
                    {p.name} · {p.gender}{p.age}岁
                  </Text>
                  <TagBadge type={p.riskLevel} showDot size="sm">
                    {p.diagnosis.split(',')[0]}
                  </TagBadge>
                </View>
                <Text className={styles.lastTime}>
                  {p.bedNo || '门诊'} · {p.lastVisitDate}
                  {rCount + eCount > 0 && (
                    <Text style={{ color: '#1A73E8', marginLeft: '8rpx' }}>
                      （{rCount}诊/{eCount}检）
                    </Text>
                  )}
                </Text>
              </View>
              <View className={styles.actionBtns}>
                <View
                  className={`${styles.btnSmall} ${styles.outline}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    Taro.navigateTo({
                      url: `/pages/record-edit/index?patientId=${p.id}`
                    });
                  }}
                >
                  首诊
                </View>
                <View
                  className={`${styles.btnSmall} ${styles.solid}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    Taro.navigateTo({
                      url: `/pages/exam-edit/index?patientId=${p.id}`
                    });
                  }}
                >
                  检查
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default RecordsPage;
