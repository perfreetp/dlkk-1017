import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { mockPatients } from '../../data/patients';
import { mockFollowUps } from '../../data/followups';
import TagBadge from '../../components/TagBadge';
import styles from './index.module.scss';

const FollowupDetailPage: React.FC = () => {
  const router = useRouter();
  const patientId = router.params?.patientId || 'P001';
  const followupId = router.params?.id;

  useDidShow(() => console.log('[FollowupDetail] patientId:', patientId, 'fid:', followupId));

  const patient = mockPatients.find((p) => p.id === patientId) || mockPatients[0];
  const fu = mockFollowUps.find((f) => f.id === followupId) || mockFollowUps[0];

  const handleSend = () => {
    console.log('[FollowupDetail] 发送提醒');
    Taro.showToast({ title: '已发送随访提醒', icon: 'success' });
  };
  const handleDone = () => {
    Taro.showModal({
      title: '确认完成随访？',
      content: '请确认本次随访已完成并记录反馈',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '随访已完成', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 800);
        }
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.patientBar}>
        <View className={styles.avatar}><Text>{patient.name.charAt(0)}</Text></View>
        <View className={styles.info}>
          <Text className={styles.name}>{patient.name} · {patient.gender}{patient.age}岁</Text>
          <Text className={styles.sub}>{patient.diagnosis}</Text>
        </View>
        <TagBadge type={patient.riskLevel} showDot size="sm" style={{ background: 'rgba(255,255,255,0.2)' }}>
          {patient.bedNo || '门诊'}
        </TagBadge>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}><Text>📅</Text><Text>随访计划</Text></View>
        <View className={styles.planRow}>
          <Text className={styles.planLabel}>随访方式</Text>
          <Text className={styles.planValue}>{fu.type}</Text>
        </View>
        <View className={styles.planRow}>
          <Text className={styles.planLabel}>随访日期</Text>
          <Text className={styles.planValue}>{fu.scheduledDate}</Text>
        </View>
        <View className={styles.planRow}>
          <Text className={styles.planLabel}>紧急程度</Text>
          <View className={styles.planValue}>
            <Text className={`${styles.planTag} ${fu.priority === 'urgent' ? 'high' : fu.priority === 'normal' ? 'mid' : 'low'}`}>
              {fu.priority === 'urgent' ? '紧急' : fu.priority === 'normal' ? '常规' : '一般'}
            </Text>
          </View>
        </View>
        <View className={styles.planRow}>
          <Text className={styles.planLabel}>随访目的</Text>
          <Text className={styles.planValue}>{fu.purpose}</Text>
        </View>
        <View className={styles.planRow}>
          <Text className={styles.planLabel}>检查项目</Text>
          <Text className={styles.planValue}>
            {fu.requiredChecks.join('、')}
          </Text>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}><Text>📝</Text><Text>随访记录</Text></View>
        <View className={styles.timeline}>
          {[
            { status: 'done', date: '2024-10-20 14:30', text: '患者入院，完善相关检查，肌钙蛋白升高，诊断急性ST段抬高型心梗' },
            { status: 'done', date: '2024-10-20 16:00', text: '急诊PCI术，LAD植入支架1枚，术后恢复可' },
            { status: 'pending', date: fu.scheduledDate, text: '出院后1周复诊，评估血压、心率、出血情况，调整用药方案' }
          ].map((it, idx) => (
            <View key={idx} className={styles.tlItem}>
              <View className={`${styles.tlDot} ${styles[it.status]}`} />
              <View className={styles.tlContent}>
                <Text className={styles.tlDate}>{it.date}</Text>
                <Text className={styles.tlText}>{it.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}><Text>💬</Text><Text>患者反馈录入</Text></View>
        <View style={{
          padding: '24rpx',
          background: '#F7F8FA',
          borderRadius: '12rpx',
          minHeight: '180rpx',
          border: '2rpx dashed #E5E6EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{ fontSize: '26rpx', color: '#86909C' }}>点击输入或使用常用语记录反馈</Text>
        </View>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx', marginTop: '24rpx' }}>
          {['血压控制良好', '无胸闷胸痛', '继续当前方案', '复查心电图', '调整他汀剂量'].map((p, i) => (
            <View
              key={i}
              style={{
                padding: '14rpx 28rpx',
                background: 'rgba(26,115,232,0.06)',
                borderRadius: '32rpx',
                fontSize: '26rpx',
                color: '#1A73E8'
              }}
              onClick={() => Taro.showToast({ title: `已插入：${p}`, icon: 'none' })}
            >
              <Text>{p}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.saveBar}>
        <View className={`${styles.btn} ${styles.ghost}`} onClick={handleSend}><Text>📤 发送提醒</Text></View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleDone}><Text>✓ 完成随访</Text></View>
      </View>
    </ScrollView>
  );
};

export default FollowupDetailPage;
