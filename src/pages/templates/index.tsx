import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import { mockTemplates } from '../../data/followups';
import styles from './index.module.scss';

const TemplatesPage: React.FC = () => {
  useDidShow(() => console.log('[Templates] 页面显示'));

  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { key: 'all', label: '全部' },
    { key: 'symptom', label: '症状描述' },
    { key: 'diagnosis', label: '诊断建议' },
    { key: 'followup', label: '随访方案' },
  ];

  const filtered = useMemo(() =>
    activeTab === 'all' ? mockTemplates : mockTemplates.filter((t) => t.category === activeTab),
    [activeTab]
  );

  const useTpl = (tpl: typeof mockTemplates[0]) => {
    console.log('[Templates] 使用模板:', tpl.id);
    Taro.showToast({ title: `模板 "${tpl.name}" 已复制到剪贴板`, icon: 'none' });
    Taro.setClipboardData({ data: tpl.content });
  };

  const editTpl = (tpl: typeof mockTemplates[0]) => {
    Taro.showToast({ title: `编辑模板: ${tpl.name}`, icon: 'none' });
  };

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24rpx' }}>
        <View>
          <Text style={{ fontSize: '40rpx', fontWeight: 700, color: '#1D2129', display: 'block', marginBottom: '4rpx' }}>📄 模板管理</Text>
          <Text style={{ fontSize: '24rpx', color: '#86909C' }}>共 {mockTemplates.length} 个模板，点击使用快速复用</Text>
        </View>
      </View>

      <View className={styles.tabs}>
        {categories.map((c) => (
          <View
            key={c.key}
            className={classnames(styles.tab, activeTab === c.key && styles.active)}
            onClick={() => setActiveTab(c.key)}
          >
            <Text>{c.label}</Text>
          </View>
        ))}
      </View>

      {filtered.map((tpl) => (
        <View key={tpl.id} className={styles.tplCard}>
          <View className={styles.tplHead}>
            <Text className={styles.tplName}>
              {tpl.category === 'symptom' ? '🩺' : tpl.category === 'diagnosis' ? '🔬' : '📋'}
              {tpl.name}
            </Text>
            <Text className={styles.tplMeta}>使 {tpl.usageCount}次</Text>
          </View>
          <Text className={styles.tplContent}>{tpl.content}</Text>
          <View className={styles.tplActions}>
            <View className={`${styles.actBtn} ${styles.ghost}`} onClick={() => editTpl(tpl)}><Text>编辑</Text></View>
            <View className={`${styles.actBtn} ${styles.outline}`} onClick={() => useTpl(tpl)}><Text>使用模板</Text></View>
          </View>
        </View>
      ))}

      <View className={styles.fab} onClick={() => Taro.showToast({ title: '新建模板', icon: 'none' })}>
        <Text>+</Text>
      </View>
    </ScrollView>
  );
};

export default TemplatesPage;
