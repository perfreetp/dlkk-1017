import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { mockFirstVisitRecords, mockExamResults } from '../../data/records';
import { mockPatients } from '../../data/patients';
import TagBadge from '../../components/TagBadge';
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
}

const RecordsPage: React.FC = () => {
  useDidShow(() => {
    console.log('[RecordsPage] 页面显示');
  });

  const patientMap = useMemo(() => {
    const map: Record<string, string> = {};
    mockPatients.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, []);

  const timelineData = useMemo<TimelineItem[]>(() => {
    const list: TimelineItem[] = [];

    mockFirstVisitRecords.forEach((r) => {
      list.push({
        id: r.id,
        type: 'record',
        patientId: r.patientId,
        patientName: patientMap[r.patientId] || '未知',
        date: r.visitDate,
        title: '首诊记录',
        content: r.symptoms,
        tags: r.pastHistory.slice(0, 2)
      });
    });

    mockExamResults.forEach((e) => {
      list.push({
        id: e.id,
        type: 'exam',
        patientId: e.patientId,
        patientName: patientMap[e.patientId] || '未知',
        date: e.examDate,
        title: '检查结果',
        content: e.ecg?.conclusion || `化验检查${e.labTests?.length || 0}项`,
        tags: ['心电图', '化验']
      });
    });

    return list.sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [patientMap]);

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
          <Text className={styles.sectionTitle}>近期动态</Text>
          <Text className={styles.sectionMore}>查看全部</Text>
        </View>

        <View className={styles.recordTimeline}>
          <View className={styles.timelineLine} />
          {timelineData.slice(0, 6).map((item, idx) => (
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
                    Taro.navigateTo({ url: `/pages/record-edit/index?id=${item.id}` });
                  } else {
                    Taro.navigateTo({ url: `/pages/exam-edit/index?id=${item.id}` });
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
                <Text className={styles.recordPatient}>{item.patientName}</Text>
                <Text className={styles.recordContent}>{item.content}</Text>
                <View className={styles.recordTags}>
                  {item.tags.map((tag, tIdx) => (
                    <TagBadge key={tIdx} type="default">
                      {tag}
                    </TagBadge>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.historySection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>快捷入口</Text>
        </View>

        {mockPatients.slice(0, 5).map((p) => (
          <View
            key={p.id}
            className={styles.historyItem}
            onClick={() => {
              console.log('[RecordsPage] 快捷操作患者:', p.id);
              Taro.navigateTo({ url: `/pages/patient-detail/index?id=${p.id}` });
            }}
          >
            <View className={styles.patientInfo}>
              <Text className={styles.patientName}>
                {p.name} · {p.gender}{p.age}岁
              </Text>
              <Text className={styles.lastTime}>
                {p.bedNo || '门诊'} · 最近就诊 {p.lastVisitDate}
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
        ))}
      </View>
    </ScrollView>
  );
};

export default RecordsPage;
