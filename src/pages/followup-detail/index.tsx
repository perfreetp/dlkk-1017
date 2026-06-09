import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { usePatientStore } from '../../store/patientStore';
import TagBadge from '../../components/TagBadge';
import SectionCard from '../../components/SectionCard';
import type { FollowUp } from '../../types';
import styles from './index.module.scss';

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

const FollowupDetailPage: React.FC = () => {
  const router = useRouter();
  const patientId = router.params?.patientId;
  const followupId = router.params?.id;

  useDidShow(() => {
    console.log('[FollowupDetail] 参数: patientId=', patientId, ' followupId=', followupId);
  });

  const getPatientById = usePatientStore((s) => s.getPatientById);
  const getLatestOrNewFollowUp = usePatientStore((s) => s.getLatestOrNewFollowUp);
  const getFollowUpsByPatientId = usePatientStore((s) => s.getFollowUpsByPatientId);
  const updateFollowUpStatus = usePatientStore((s) => s.updateFollowUpStatus);
  const addFollowUp = usePatientStore((s) => s.addFollowUp);

  const patient = useMemo(() => {
    if (patientId) return getPatientById(patientId);
    if (followupId) {
      const fu = getLatestOrNewFollowUp('', followupId);
      return fu ? getPatientById(fu.patientId) : undefined;
    }
    return getPatientById('P001');
  }, [patientId, followupId, getPatientById, getLatestOrNewFollowUp]);

  const pid = patient?.id || patientId || 'P001';

  const patientFollowUps = useMemo(() => getFollowUpsByPatientId(pid), [pid, getFollowUpsByPatientId]);

  const initialFollowUp = useMemo(() => {
    if (followupId) {
      return getLatestOrNewFollowUp(pid, followupId);
    }
    if (patientFollowUps.length > 0) {
      return patientFollowUps[0];
    }
    return undefined;
  }, [followupId, pid, patientFollowUps, getLatestOrNewFollowUp]);

  const currentFollowUp = initialFollowUp;

  const [feedback, setFeedback] = useState<string>(currentFollowUp?.feedback || '');

  const priorityLabel = currentFollowUp?.scheduleDate?.includes('6-12') ? 'urgent' : 'normal';

  const handleSend = () => {
    console.log('[FollowupDetail] 发送提醒 to:', patient?.name);
    Taro.showToast({ title: `已向${patient?.name}发送随访提醒`, icon: 'success' });
  };

  const handleDone = () => {
    if (!currentFollowUp) return;
    Taro.showModal({
      title: '确认完成随访？',
      content: feedback ? '将保存反馈并标记已完成' : '未填写反馈，确认完成？',
      confirmText: '确认完成',
      success: (res) => {
        if (res.confirm && currentFollowUp) {
          updateFollowUpStatus(currentFollowUp.id, 'completed', feedback || undefined);
          Taro.showToast({ title: '已保存并标记完成', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 900);
        }
      }
    });
  };

  const handleSaveFeedback = () => {
    if (!currentFollowUp || !feedback.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }
    updateFollowUpStatus(currentFollowUp.id, currentFollowUp.status, feedback);
    Taro.showToast({ title: '反馈已保存', icon: 'success' });
  };

  if (!patient) {
    return (
      <ScrollView scrollY className={styles.pageWrap}>
        <View style={{ padding: '120rpx 48rpx', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
          <Text style={{ fontSize: '120rpx' }}>📋</Text>
          <Text style={{ fontSize: '32rpx', marginTop: '24rpx', color: '#86909C' }}>请从患者详情或随访列表进入</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.patientBar}>
        <View className={styles.avatar}><Text>{patient.name.charAt(0)}</Text></View>
        <View className={styles.info}>
          <Text className={styles.name}>{patient.name} · {patient.gender}{patient.age}岁</Text>
          <Text className={styles.sub}>{patient.diagnosis}</Text>
          <Text className={styles.sub} style={{ marginTop: '4rpx', fontSize: '20rpx', opacity: 0.8 }}>
            {patient.bedNo ? `${patient.ward}${patient.bedNo}` : '门诊'} · {patient.patientNo}
          </Text>
        </View>
        <TagBadge type={patient.riskLevel} showDot size="sm">
          {statusLabels[currentFollowUp?.status || 'pending']}
        </TagBadge>
      </View>

      {!currentFollowUp ? (
        <View style={{
          margin: '24rpx 0',
          padding: '64rpx 32rpx',
          background: '#fff',
          borderRadius: '16rpx',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: '80rpx', marginBottom: '16rpx' }}>📅</Text>
          <Text style={{ fontSize: '30rpx', fontWeight: 600, color: '#1D2129', marginBottom: '8rpx' }}>
            {patient.name} 暂无随访计划
          </Text>
          <Text style={{ fontSize: '24rpx', color: '#86909C', marginBottom: '32rpx', textAlign: 'center' }}>
            点击下方按钮立即为该患者创建随访计划
          </Text>
          <View
            style={{
              padding: '20rpx 64rpx',
              background: 'linear-gradient(135deg,#1A73E8 0%,#00BFA5 100%)',
              color: '#fff',
              borderRadius: '48rpx',
              fontWeight: 600
            }}
            onClick={() => {
              const today = new Date();
              const nextWeek = new Date(today.getTime() + 7 * 24 * 3600 * 1000);
              const ns = addFollowUp({
                patientId: patient.id,
                scheduleDate: nextWeek.toISOString().slice(0, 10),
                scheduleTime: '09:00',
                type: 'reexamination',
                notes: `${patient.diagnosis}复查`,
                reminder: true,
                reminderDate: nextWeek.toISOString().slice(0, 10)
              });
              Taro.showToast({ title: '已创建随访计划', icon: 'success' });
              setTimeout(() => {
                Taro.redirectTo({
                  url: `/pages/followup-detail/index?id=${ns.id}&patientId=${patient.id}`
                });
              }, 800);
            }}
          >
            <Text>+ 创建随访计划</Text>
          </View>
        </View>
      ) : (
        <>
          <View className={styles.card}>
            <View className={styles.cardTitle}><Text>📅</Text><Text>随访计划详情</Text></View>
            <View className={styles.planRow}>
              <Text className={styles.planLabel}>随访方式</Text>
              <Text className={styles.planValue}>{typeLabels[currentFollowUp.type]}</Text>
            </View>
            <View className={styles.planRow}>
              <Text className={styles.planLabel}>随访日期</Text>
              <Text className={styles.planValue}>
                {currentFollowUp.scheduleDate} {currentFollowUp.scheduleTime || ''}
              </Text>
            </View>
            <View className={styles.planRow}>
              <Text className={styles.planLabel}>紧急程度</Text>
              <View className={styles.planValue}>
                <Text className={`${styles.planTag} ${priorityLabel === 'urgent' ? styles.high : styles.mid}`}>
                  {priorityLabel === 'urgent' ? '紧急' : '常规'}
                </Text>
              </View>
            </View>
            <View className={styles.planRow}>
              <Text className={styles.planLabel}>当前状态</Text>
              <View className={styles.planValue}>
                <TagBadge
                  type={
                    currentFollowUp.status === 'completed' ? 'normal' :
                    currentFollowUp.status === 'missed' ? 'critical' : 'warning'
                  }
                  showDot
                  size="sm"
                >
                  {statusLabels[currentFollowUp.status]}
                </TagBadge>
                {currentFollowUp.completedDate && (
                  <Text style={{ fontSize: '20rpx', color: '#86909C', marginLeft: '12rpx' }}>
                    (完成于 {currentFollowUp.completedDate})
                  </Text>
                )}
              </View>
            </View>
            <View className={styles.planRow}>
              <Text className={styles.planLabel}>随访目的</Text>
              <Text className={styles.planValue}>{currentFollowUp.notes || `${patient.diagnosis}随访`}</Text>
            </View>
            <View className={styles.planRow}>
              <Text className={styles.planLabel}>提醒设置</Text>
              <Text className={styles.planValue}>
                {currentFollowUp.reminder
                  ? `🔔 已设置提醒（${currentFollowUp.reminderDate || '计划前1天'}）`
                  : '🔕 未设置提醒'}
              </Text>
            </View>
            <View className={styles.planRow}>
              <Text className={styles.planLabel}>创建时间</Text>
              <Text className={styles.planValue}>{currentFollowUp.createDate}</Text>
            </View>
          </View>

          <SectionCard title={`📝 随访历史（共 ${patientFollowUps.length} 条记录）`}>
            <View className={styles.timeline}>
              {[
                ...patientFollowUps.map((fu, idx) => ({
                  status: fu.status === 'completed' ? 'done' : 'pending',
                  date: `${fu.scheduleDate} ${fu.scheduleTime || ''}`,
                  text: `${typeLabels[fu.type]} - ${fu.notes || '随访'}${fu.feedback ? `\n反馈：${fu.feedback}` : ''}`,
                  idx
                })),
              ].map((it, idx) => (
                <View key={idx} className={styles.tlItem}>
                  <View className={`${styles.tlDot} ${styles[it.status]}`} />
                  <View className={styles.tlContent}>
                    <Text className={styles.tlDate}>
                      {it.date} · {it.status === 'done' ? '✓ 已完成' : '⏳ 待进行'}
                    </Text>
                    {it.text.split('\n').map((line, i) => (
                      <Text key={i} className={styles.tlText}>{line}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </SectionCard>

          <SectionCard
            title="💬 反馈录入"
            extra={
              currentFollowUp.status !== 'completed' ? (
                <Text
                  style={{ fontSize: '24rpx', color: '#1A73E8' }}
                  onClick={handleSaveFeedback}
                >
                  暂存
                </Text>
              ) : null
            }
          >
            <Textarea
              value={feedback}
              onInput={(e) => setFeedback(e.detail.value)}
              placeholder={`请记录与${patient.name}的随访反馈，包括：症状、体征、用药依从性、检查结果、下一步方案...`}
              style={{
                width: '100%',
                minHeight: '200rpx',
                padding: '24rpx',
                background: '#F7F8FA',
                borderRadius: '12rpx',
                fontSize: '28rpx',
                lineHeight: 1.6,
                color: '#1D2129',
                boxSizing: 'border-box'
              }}
            />
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '16rpx', marginTop: '24rpx' }}>
              {[
                { label: '✓ 血压控制良好', tag: '常规' },
                { label: '✓ 无胸闷胸痛发作', tag: '症状' },
                { label: '↑ 调整他汀剂量', tag: '用药' },
                { label: '→ 需复查心电图+肌钙蛋白', tag: '检查' },
                { label: '⚠ 诉有轻微乏力，继续观察', tag: '体征' },
              ].map((p, i) => (
                <View
                  key={i}
                  style={{
                    padding: '14rpx 28rpx',
                    background: 'rgba(26,115,232,0.06)',
                    borderRadius: '32rpx',
                    fontSize: '26rpx',
                    color: '#1A73E8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8rpx'
                  }}
                  onClick={() => {
                    setFeedback((prev) => (prev ? prev + '；' : '') + p.label);
                    Taro.showToast({ title: `已插入：${p.tag}`, icon: 'none', duration: 800 });
                  }}
                >
                  <Text style={{ fontSize: '20rpx', opacity: 0.6 }}>#{p.tag}</Text>
                  <Text>{p.label}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        </>
      )}

      <View className={styles.saveBar}>
        <View className={`${styles.btn} ${styles.ghost}`} onClick={handleSend}>
          <Text>📤 发送提醒</Text>
        </View>
        <View className={`${styles.btn} ${styles.primary}`} onClick={handleDone}>
          <Text>✓ 完成随访</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default FollowupDetailPage;
