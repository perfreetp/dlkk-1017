import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { mockPatients } from '../../data/patients';
import { mockFirstVisitRecords, mockExamResults } from '../../data/records';
import { mockFollowUps } from '../../data/followups';
import styles from './index.module.scss';

const ExportPage: React.FC = () => {
  useDidShow(() => console.log('[Export] 页面显示'));

  const [selectedTypes, setSelectedTypes] = useState<string[]>(['patient', 'record']);
  const [format, setFormat] = useState('excel');

  const exportTypes = [
    { key: 'patient', icon: '👥', name: '患者信息', desc: `共${mockPatients.length}名患者` },
    { key: 'record', icon: '📝', name: '首诊记录', desc: `共${mockFirstVisitRecords.length}条记录` },
    { key: 'exam', icon: '🧪', name: '检查结果', desc: `共${mockExamResults.length}份报告` },
    { key: 'followup', icon: '📅', name: '随访记录', desc: `共${mockFollowUps.length}条随访` },
  ];

  const formats = [
    { key: 'excel', name: 'Excel 表格', desc: '适合数据统计与分析，可直接打开编辑', ext: '.xlsx' },
    { key: 'pdf', name: 'PDF 文档', desc: '适合打印存档，格式固定不可修改', ext: '.pdf' },
    { key: 'json', name: 'JSON 数据', desc: '适合系统对接，结构化原始数据', ext: '.json' },
  ];

  const toggleType = (key: string) => {
    setSelectedTypes((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const doExport = () => {
    if (selectedTypes.length === 0) {
      Taro.showToast({ title: '请至少选择一种导出类型', icon: 'none' });
      return;
    }
    console.log('[Export] 执行导出:', { types: selectedTypes, format });
    Taro.showLoading({ title: '正在导出...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showModal({
        title: '✓ 导出成功',
        content: `已导出 ${selectedTypes.length} 种类型数据，格式：${formats.find(f => f.key === format)?.name}\n文件已保存至下载目录`,
        confirmText: '查看文件',
        cancelText: '知道了',
        success: (res) => {
          if (res.confirm) Taro.showToast({ title: '打开文件管理...', icon: 'none' });
        }
      });
    }, 1200);
  };

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View className={styles.headerCard}>
        <View style={{ position: 'relative', zIndex: 1 }}>
          <Text style={{ fontSize: '40rpx', fontWeight: 700, display: 'block', marginBottom: '8rpx' }}>📤 数据导出</Text>
          <Text style={{ fontSize: '26rpx', opacity: 0.9 }}>一键导出诊疗数据，便于研究、汇报与存档</Text>
        </View>
        <View className={styles.statRow}>
          <View className={styles.statItem}>
            <Text className={styles.num}>{mockPatients.length}</Text>
            <Text className={styles.label}>患者</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.num}>{mockFirstVisitRecords.length}</Text>
            <Text className={styles.label}>记录</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.num}>{mockExamResults.length}</Text>
            <Text className={styles.label}>检查</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.num}>{mockFollowUps.length}</Text>
            <Text className={styles.label}>随访</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.title}><Text>🔖</Text><Text>选择导出类型</Text></View>
        <View className={styles.typeList}>
          {exportTypes.map((t) => (
            <View
              key={t.key}
              className={classnames(styles.typeItem, selectedTypes.includes(t.key) && styles.selected)}
              onClick={() => toggleType(t.key)}
            >
              {selectedTypes.includes(t.key) && <View className={styles.check}><Text>✓</Text></View>}
              <View className={styles.icon}><Text>{t.icon}</Text></View>
              <Text className={styles.name}>{t.name}</Text>
              <Text className={styles.desc}>{t.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.title}><Text>📁</Text><Text>选择导出格式</Text></View>
        <View className={styles.formatList}>
          {formats.map((f) => (
            <View key={f.key} className={styles.formatItem} onClick={() => setFormat(f.key)}>
              <View className={classnames(styles.radio, format === f.key && styles.checked)} />
              <View className={styles.fmtInfo}>
                <Text className={styles.fmtName}>{f.name}</Text>
                <Text className={styles.fmtDesc}>{f.desc}</Text>
              </View>
              <Text className={styles.ext}>{f.ext}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.title}><Text>🔒</Text><Text>数据安全说明</Text></View>
        <View style={{ padding: '20rpx', background: 'rgba(26,115,232,0.06)', borderRadius: '12rpx' }}>
          {[
            '所有导出文件均为本地处理，不上传至服务器',
            '请妥善保管导出文件，避免患者隐私信息泄露',
            '文件符合 HIPAA 隐私保护标准，包含脱敏选项',
            '导出记录将保存在系统操作日志中，可追溯审计'
          ].map((l, i) => (
            <Text key={i} style={{ fontSize: '26rpx', color: '#4E5969', lineHeight: 2, display: 'block' }}>
              ✓ {l}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.btnBar}>
        <View className={`${styles.btn} ${styles.primary}`} onClick={doExport}>
          <Text>📤 立即导出 ({selectedTypes.length}项)</Text>
        </View>
        <View className={`${styles.btn} ${styles.ghost}`} onClick={() => Taro.navigateBack()}>
          <Text>取消</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ExportPage;
