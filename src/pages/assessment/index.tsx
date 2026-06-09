import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { mockRiskAssessments, mockDoctorAdvices } from '../../data/assessments';
import { mockPatients } from '../../data/patients';
import TagBadge from '../../components/TagBadge';
import { getRiskLevelText } from '../../utils/riskCalc';
import type { RiskLevel } from '../../types';
import styles from './index.module.scss';

const assessmentTools = [
  { name: 'GRACE评分', desc: 'ACS风险评估与预后', icon: '📊', colorClass: '' },
  { name: 'TIMI评分', desc: 'UA/NSTEMI风险分层', icon: '📈', colorClass: 'orange' },
  { name: 'HAS-BLED', desc: '抗凝出血风险评估', icon: '🔬', colorClass: 'green' },
  { name: 'CHA₂DS₂-VASc', desc: '房颤卒中风险评分', icon: '❤️', colorClass: 'red' }
];

const AssessmentPage: React.FC = () => {
  useDidShow(() => {
    console.log('[AssessmentPage] 页面显示');
  });

  const patientMap = useMemo(() => {
    const map: Record<string, { name: string; age: number; gender: string }> = {};
    mockPatients.forEach((p) => {
      map[p.id] = { name: p.name, age: p.age, gender: p.gender };
    });
    return map;
  }, []);

  const overallStats = useMemo(() => {
    const total = mockRiskAssessments.length;
    const critical = mockRiskAssessments.filter((a) => a.overallRisk === 'critical').length;
    const warning = mockRiskAssessments.filter((a) => a.overallRisk === 'warning').length;
    const stable = mockRiskAssessments.filter((a) => a.overallRisk === 'stable').length;
    const avgScore = Math.round(
      mockRiskAssessments.reduce((sum, a) => sum + a.score, 0) / Math.max(total, 1)
    );
    return { total, critical, warning, stable, avgScore };
  }, []);

  const handleToolClick = (toolName: string) => {
    console.log('[AssessmentPage] 使用评估工具:', toolName);
    Taro.showToast({ title: `${toolName} 评估`, icon: 'none' });
  };

  const handleNewAssessment = () => {
    console.log('[AssessmentPage] 新建评估');
    Taro.showToast({ title: '选择患者进行评估', icon: 'none' });
  };

  const handleViewDetail = (id: string) => {
    console.log('[AssessmentPage] 查看评估详情:', id);
    Taro.navigateTo({ url: `/pages/risk-detail/index?id=${id}` });
  };

  const getGraceLevel = (score?: number): string => {
    if (!score) return '-';
    if (score >= 140) return '高危';
    if (score >= 109) return '中危';
    return '低危';
  };

  const getHASBLEDLevel = (score?: number): string => {
    if (!score) return '-';
    if (score >= 3) return '高出血';
    return '可接受';
  };

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.overallCard}>
        <Text className={styles.cardTitle}>今日风险概览</Text>

        <View className={styles.summaryRow}>
          <View className={`${styles.riskCircle} ${overallStats.critical > 0 ? 'critical' : 'warning'}`}>
            <Text className={styles.riskScore}>{overallStats.avgScore}</Text>
            <Text className={styles.riskLabel}>平均分</Text>
          </View>
          <View className={styles.riskTexts}>
            <Text className={styles.mainLevel}>
              {overallStats.critical > 0 ? '重点关注期' : '常规监测期'}
            </Text>
            <Text className={styles.subText}>
              {overallStats.critical > 0
                ? `有${overallStats.critical}位急危患者需优先处理`
                : '当前无急危患者，请持续跟进'}
            </Text>
          </View>
        </View>

        <View className={styles.scoreCards}>
          <View className={styles.scoreItem}>
            <Text className={styles.scoreName}>急危</Text>
            <Text className={styles.scoreValue}>{overallStats.critical}</Text>
            <Text className={styles.scoreLevel}>需立即处理</Text>
          </View>
          <View className={styles.scoreItem}>
            <Text className={styles.scoreName}>关注</Text>
            <Text className={styles.scoreValue}>{overallStats.warning}</Text>
            <Text className={styles.scoreLevel}>重点跟进</Text>
          </View>
          <View className={styles.scoreItem}>
            <Text className={styles.scoreName}>稳定</Text>
            <Text className={styles.scoreValue}>{overallStats.stable}</Text>
            <Text className={styles.scoreLevel}>常规随访</Text>
          </View>
        </View>
      </View>

      <View className={styles.toolSection}>
        <View className="sectionTitle">评估工具</View>
        <View className={styles.toolGrid}>
          {assessmentTools.map((tool, idx) => (
            <View
              key={idx}
              className={styles.toolCard}
              onClick={() => handleToolClick(tool.name)}
            >
              <View className={`${styles.toolIcon} ${styles[tool.colorClass]}`}>
                <Text>{tool.icon}</Text>
              </View>
              <Text className={styles.toolName}>{tool.name}</Text>
              <Text className={styles.toolDesc}>{tool.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.historySection}>
        <View className="sectionTitle">近期评估</View>
        <View className={styles.historyList}>
          {mockRiskAssessments.map((a) => {
            const patient = patientMap[a.patientId];
            return (
              <View
                key={a.id}
                className={styles.historyItem}
                onClick={() => handleViewDetail(a.id)}
              >
                <View className={styles.itemHeader}>
                  <Text className={styles.patientName}>
                    {patient?.name || '未知'} · {patient?.gender}
                    {patient?.age}岁
                  </Text>
                  <Text className={styles.assessDate}>{a.assessmentDate}</Text>
                </View>

                <View className={styles.riskInfo}>
                  <TagBadge
                    type={a.overallRisk as RiskLevel}
                    showDot
                    size="lg"
                  >
                    {getRiskLevelText(a.overallRisk)} · {a.score}分
                  </TagBadge>
                  {a.graceScore !== undefined && (
                    <TagBadge type="default">
                      GRACE {a.graceScore} ({getGraceLevel(a.graceScore)})
                    </TagBadge>
                  )}
                  {a.hasBledScore !== undefined && (
                    <TagBadge type="default">
                      HAS-BLED {a.hasBledScore} ({getHASBLEDLevel(a.hasBledScore)})
                    </TagBadge>
                  )}
                </View>

                <View className={styles.infoRow}>
                  {a.warnings.slice(0, 2).map((w, i) => (
                    <TagBadge key={i} type="warning" size="sm">
                      ⚠ {w.slice(0, 16)}...
                    </TagBadge>
                  ))}
                  <TagBadge type="primary">
                    {a.recommendations.length}条建议
                  </TagBadge>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.actionBtn} onClick={handleNewAssessment}>
        <Text>+ 新建风险评估</Text>
      </View>
    </ScrollView>
  );
};

export default AssessmentPage;
