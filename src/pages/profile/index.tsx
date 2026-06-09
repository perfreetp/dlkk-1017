import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { mockDoctorProfile, mockTemplates, mockPhrases, mockFollowUps } from '../../data/followups';
import { mockPatients } from '../../data/patients';
import { mockFirstVisitRecords, mockExamResults } from '../../data/records';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  useDidShow(() => {
    console.log('[ProfilePage] 页面显示');
  });

  const stats = useMemo(() => {
    return {
      patients: mockPatients.length,
      records: mockFirstVisitRecords.length + mockExamResults.length,
      followups: mockFollowUps.filter((f) => f.status === 'completed').length,
      templates: mockTemplates.length + mockPhrases.length
    };
  }, []);

  const menuGroups = [
    {
      title: '数据管理',
      items: [
        {
          name: '病历模板',
          desc: `已配置 ${mockTemplates.length} 套模板`,
          icon: '📋',
          iconClass: 'blue',
          url: '/pages/templates/index'
        },
        {
          name: '常用语库',
          desc: `${mockPhrases.length} 条快捷常用语`,
          icon: '💬',
          iconClass: 'green',
          url: '/pages/phrases/index'
        },
        {
          name: '数据导出',
          desc: '导出病历和统计数据',
          icon: '📤',
          iconClass: 'orange',
          url: '/pages/export/index'
        }
      ]
    },
    {
      title: '系统设置',
      items: [
        {
          name: '提醒设置',
          desc: '随访提醒和闹钟配置',
          icon: '🔔',
          iconClass: 'purple',
          action: 'reminder'
        },
        {
          name: '医嘱模板',
          desc: '用药方案和检查推荐',
          icon: '💊',
          iconClass: 'red',
          badge: '3',
          action: 'order'
        },
        {
          name: '隐私与安全',
          desc: '数据加密和权限管理',
          icon: '🔒',
          iconClass: 'gray',
          action: 'privacy'
        },
        {
          name: '帮助与反馈',
          desc: '使用指南和问题反馈',
          icon: '❓',
          iconClass: 'blue',
          action: 'help'
        },
        {
          name: '关于我们',
          desc: '心内科助手 v1.0.0',
          icon: 'ℹ️',
          iconClass: 'green',
          action: 'about'
        }
      ]
    }
  ];

  const handleMenuClick = (item: { url?: string; action?: string; name: string }) => {
    console.log('[ProfilePage] 点击菜单:', item.name);
    if (item.url) {
      Taro.navigateTo({ url: item.url });
    } else if (item.action) {
      Taro.showToast({ title: `${item.name} 功能`, icon: 'none' });
    }
  };

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.profileHeader}>
        <View className={styles.doctorInfo}>
          <View className={styles.avatar}>
            <Text>{mockDoctorProfile.name.charAt(0)}</Text>
          </View>
          <View className={styles.infoText}>
            <Text className={styles.name}>{mockDoctorProfile.name}</Text>
            <Text className={styles.title}>
              {mockDoctorProfile.title} · {mockDoctorProfile.department}
            </Text>
            <Text className={styles.hospital}>{mockDoctorProfile.hospital}</Text>
          </View>
        </View>

        <View className={styles.quickStats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.patients}</Text>
            <Text className={styles.statLabel}>管理患者</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.records}</Text>
            <Text className={styles.statLabel}>诊疗记录</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.followups}</Text>
            <Text className={styles.statLabel}>完成随访</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.templates}</Text>
            <Text className={styles.statLabel}>模板短语</Text>
          </View>
        </View>
      </View>

      <View className={styles.mainContent}>
        {menuGroups.map((group, gIdx) => (
          <View key={gIdx} className={styles.sectionCard}>
            <View className={styles.sectionTitle}>
              <Text>{group.title}</Text>
            </View>
            {group.items.map((item, iIdx) => (
              <View
                key={iIdx}
                className={styles.menuItem}
                onClick={() => handleMenuClick(item)}
              >
                <View className={`${styles.menuIcon} ${styles[item.iconClass]}`}>
                  <Text>{item.icon}</Text>
                </View>
                <View className={styles.menuText}>
                  <Text className={styles.menuName}>{item.name}</Text>
                  <Text className={styles.menuDesc}>{item.desc}</Text>
                </View>
                {item.badge && <Text className={styles.menuBadge}>{item.badge}</Text>}
                <Text className={styles.menuArrow}>›</Text>
              </View>
            ))}
          </View>
        ))}

        <View
          className={styles.logoutBtn}
          onClick={() => {
            console.log('[ProfilePage] 退出登录');
            Taro.showModal({
              title: '提示',
              content: '确认退出登录？',
              success: (res) => {
                if (res.confirm) {
                  Taro.showToast({ title: '已退出', icon: 'success' });
                }
              }
            });
          }}
        >
          <Text>退出登录</Text>
        </View>

        <Text className={styles.versionInfo}>
          心内科医生助手 v1.0.0 © 2024
        </Text>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
