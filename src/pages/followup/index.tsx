import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { mockFollowUps } from '../../data/followups';
import { mockPatients } from '../../data/patients';
import type { FollowUp } from '../../types';
import styles from './index.module.scss';

type TabType = 'all' | 'pending' | 'completed' | 'missed';

const typeLabels: Record<FollowUp['type'], string> = {
  checkup: '常规检查',
  medication: '用药调整',
  reexamination: '术后复查',
  phone: '电话随访'
};

const statusLabels: Record<FollowUp['status'], string> = {
  pending: '待随访',
  completed: '已完成',
  missed: '已逾期',
  cancelled: '已取消'
};

const FollowUpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useDidShow(() => {
    console.log('[FollowUpPage] 页面显示');
  });

  const patientMap = useMemo(() => {
    const map: Record<string, { name: string; age: number; gender: string }> = {};
    mockPatients.forEach((p) => {
      map[p.id] = { name: p.name, age: p.age, gender: p.gender };
    });
    return map;
  }, []);

  const summary = useMemo(() => {
    return {
      total: mockFollowUps.length,
      pending: mockFollowUps.filter((f) => f.status === 'pending').length,
      completed: mockFollowUps.filter((f) => f.status === 'completed').length,
      missed: mockFollowUps.filter((f) => f.status === 'missed').length
    };
  }, []);

  const filteredList = useMemo(() => {
    let list = [...mockFollowUps];
    if (activeTab !== 'all') {
      list = list.filter((f) => f.status === activeTab);
    }
    return list.sort((a, b) => {
      if (a.status !== b.status) {
        const order = { pending: 0, missed: 1, completed: 2, cancelled: 3 };
        return order[a.status] - order[b.status];
      }
      return a.scheduleDate > b.scheduleDate ? 1 : -1;
    });
  }, [activeTab]);

  const handleAction = (action: string, item: FollowUp) => {
    console.log(`[FollowUpPage] ${action}:`, item.id);
    switch (action) {
      case 'complete':
        Taro.showToast({ title: '已完成随访', icon: 'success' });
        break;
      case 'edit':
        Taro.navigateTo({ url: `/pages/followup-detail/index?id=${item.id}` });
        break;
      case 'remind':
        Taro.showToast({ title: '已发送提醒', icon: 'none' });
        break;
    }
  };

  const handleNew = () => {
    console.log('[FollowUpPage] 新建随访');
    Taro.navigateTo({ url: '/pages/followup-detail/index' });
  };

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.summaryBar}>
        <View className={styles.summaryItem}>
          <Text className={styles.sumValue}>{summary.total}</Text>
          <Text className={styles.sumLabel}>全部</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.sumValue, styles.pending)}>{summary.pending}</Text>
          <Text className={styles.sumLabel}>待随访</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.sumValue, styles.done)}>{summary.completed}</Text>
          <Text className={styles.sumLabel}>已完成</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.sumValue, styles.missed)}>{summary.missed}</Text>
          <Text className={styles.sumLabel}>逾期</Text>
        </View>
      </View>

      <View className={styles.filterTabs}>
        {(['all', 'pending', 'completed', 'missed'] as TabType[]).map((tab) => (
          <View
            key={tab}
            className={classnames(styles.tabBtn, activeTab === tab && styles.active)}
            onClick={() => setActiveTab(tab)}
          >
            <Text>
              {{
                all: '全部',
                pending: '待随访',
                completed: '已完成',
                missed: '已逾期'
              }[tab]}
            </Text>
          </View>
        ))}
      </View>

      {filteredList.length === 0 ? (
        <View className={styles.emptyWrap}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无随访记录</Text>
        </View>
      ) : (
        <View className={styles.followupList}>
          {filteredList.map((item) => {
            const patient = patientMap[item.patientId];
            return (
              <View
                key={item.id}
                className={styles.followupItem}
                onClick={() =>
                  Taro.navigateTo({ url: `/pages/followup-detail/index?id=${item.id}` })
                }
              >
                <View className={styles.itemTop}>
                  <View className={styles.dateBlock}>
                    <Text className={styles.dateMain}>{item.scheduleDate}</Text>
                    <Text className={styles.dateTime}>
                      {item.scheduleTime || '全天'} · {typeLabels[item.type]}
                    </Text>
                  </View>
                  <View className={classnames(styles.statusBadge, styles[item.status])}>
                    {statusLabels[item.status]}
                  </View>
                </View>

                <View className={styles.patientRow}>
                  <View className={styles.avatar}>
                    <Text>{patient?.name?.charAt(0) || '?'}</Text>
                  </View>
                  <View className={styles.pInfo}>
                    <Text className={styles.pName}>
                      {patient?.name || '未知患者'} · {patient?.gender}
                      {patient?.age}岁
                    </Text>
                    <Text className={styles.pMeta}>
                      {item.reminder ? '🔔 已设置提醒' : '未设置提醒'}
                    </Text>
                  </View>
                  <View className={styles.typeTag}>{typeLabels[item.type]}</View>
                </View>

                {item.notes && (
                  <Text className={styles.notesRow}>📝 {item.notes}</Text>
                )}

                {item.feedback && (
                  <View className={styles.feedbackRow}>
                    <Text className={styles.fbLabel}>上次随访反馈</Text>
                    <Text className={styles.fbContent}>{item.feedback}</Text>
                  </View>
                )}

                <View className={styles.actionRow}>
                  {item.status === 'pending' && (
                    <>
                      <View
                        className={`${styles.actionBtn} ${styles.primary}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('complete', item);
                        }}
                      >
                        <Text>完成随访</Text>
                      </View>
                      <View
                        className={`${styles.actionBtn} ${styles.outline}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('remind', item);
                        }}
                      >
                        <Text>发送提醒</Text>
                      </View>
                    </>
                  )}
                  {item.status === 'completed' && (
                    <View
                      className={`${styles.actionBtn} ${styles.ghost}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction('edit', item);
                      }}
                    >
                      <Text>查看详情</Text>
                    </View>
                  )}
                  {item.status === 'missed' && (
                    <>
                      <View
                        className={`${styles.actionBtn} ${styles.outline}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction('edit', item);
                        }}
                      >
                        <Text>重新安排</Text>
                      </View>
                      <View
                        className={`${styles.actionBtn} ${styles.primary}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          Taro.makePhoneCall({ phoneNumber: '13800000000' });
                        }}
                      >
                        <Text>联系患者</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View className={styles.fabBtn} onClick={handleNew}>
        <Text>+</Text>
      </View>
    </ScrollView>
  );
};

export default FollowUpPage;
