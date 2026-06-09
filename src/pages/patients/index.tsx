import React, { useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { usePatientStore } from '../../store/patientStore';
import PatientCard from '../../components/PatientCard';
import StatItem from '../../components/StatItem';
import type { PatientGroup } from '../../types';
import styles from './index.module.scss';

const groupOptions: { key: PatientGroup; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'critical', label: '急重症' },
  { key: 'ward_a', label: 'A区' },
  { key: 'ward_b', label: 'B区' },
  { key: 'outpatient', label: '门诊' },
  { key: 'favorites', label: '收藏' }
];

const PatientsPage: React.FC = () => {
  const {
    patients,
    searchKeyword,
    currentGroup,
    setSearchKeyword,
    setCurrentGroup,
    getFilteredPatients
  } = usePatientStore();

  useDidShow(() => {
    console.log('[PatientsPage] 页面显示');
  });

  const filteredPatients = useMemo(() => getFilteredPatients(), [
    patients,
    searchKeyword,
    currentGroup
  ]);

  const stats = useMemo(() => {
    return {
      total: patients.length,
      critical: patients.filter((p) => p.isCritical).length,
      warning: patients.filter((p) => p.riskLevel === 'warning').length,
      favorites: patients.filter((p) => p.isFavorite).length
    };
  }, [patients]);

  const getGroupCount = (group: PatientGroup): number => {
    switch (group) {
      case 'all':
        return patients.length;
      case 'favorites':
        return stats.favorites;
      case 'critical':
        return stats.critical;
      case 'ward_a':
        return patients.filter((p) => p.ward === 'A区').length;
      case 'ward_b':
        return patients.filter((p) => p.ward === 'B区').length;
      case 'outpatient':
        return patients.filter((p) => !p.ward).length;
      default:
        return 0;
    }
  };

  const handleAddPatient = () => {
    console.log('[PatientsPage] 新增患者');
    Taro.showToast({ title: '新增患者功能', icon: 'none' });
  };

  return (
    <ScrollView
      scrollY
      className={styles.pageWrap}
      refresherEnabled
      onRefresherRefresh={() => {
        console.log('[PatientsPage] 下拉刷新');
        setTimeout(() => Taro.stopPullDownRefresh(), 1000);
      }}
    >
      <View className={styles.headerSection}>
        <Text className={styles.pageTitle}>早上好，李主任</Text>
        <Text className={styles.pageSubtitle}>今日查房 · 共 {stats.total} 位患者</Text>

        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索姓名/床号/诊断"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            confirmType="search"
          />
          {searchKeyword && (
            <Text
              className={styles.clearBtn}
              onClick={() => setSearchKeyword('')}
            >
              ✕
            </Text>
          )}
        </View>
      </View>

      <View className={styles.statsRow}>
        <StatItem
          value={stats.total}
          label="总患者"
          colorType="primary"
        />
        <View className={styles.statDivider} />
        <StatItem
          value={stats.critical}
          label="急重症"
          colorType="critical"
          subText="需优先处理"
        />
        <View className={styles.statDivider} />
        <StatItem
          value={stats.warning}
          label="需关注"
          colorType="warning"
        />
        <View className={styles.statDivider} />
        <StatItem
          value={stats.favorites}
          label="已收藏"
          colorType="stable"
        />
      </View>

      <View className={styles.groupTabs}>
        <ScrollView scrollX className={styles.tabsScroll} showScrollbar={false}>
          {groupOptions.map((opt) => (
            <View
              key={opt.key}
              className={classnames(
                styles.tabItem,
                currentGroup === opt.key && styles.active,
                styles.hasCount
              )}
              onClick={() => {
                console.log('[PatientsPage] 切换分组:', opt.label);
                setCurrentGroup(opt.key);
              }}
            >
              {opt.label}
              <Text className={styles.countBadge}>{getGroupCount(opt.key)}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.listSection}>
        <View className={styles.listHeader}>
          <Text className={styles.headerTitle}>患者列表</Text>
          <Text className={styles.headerCount}>
            共 {filteredPatients.length} 位
          </Text>
        </View>

        {filteredPatients.length === 0 ? (
          <View className="emptyState">
            <Text>暂无符合条件的患者</Text>
          </View>
        ) : (
          filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))
        )}
      </View>

      <View className={styles.actionFab} onClick={handleAddPatient}>
        <Text>+</Text>
      </View>
    </ScrollView>
  );
};

export default PatientsPage;
