import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { mockPhrases } from '../../data/followups';
import styles from './index.module.scss';

const PhrasesPage: React.FC = () => {
  useDidShow(() => console.log('[Phrases] 页面显示'));

  const [keyword, setKeyword] = useState('');

  const groups = useMemo(() => {
    const rawGroups: { key: string; label: string; icon: string; items: typeof mockPhrases }[] = [
      { key: 'greeting', label: '问候与开场', icon: '👋', items: mockPhrases.filter(p => p.category === 'greeting') },
      { key: 'symptom', label: '症状询问', icon: '🩺', items: mockPhrases.filter(p => p.category === 'symptom') },
      { key: 'advice', label: '医嘱建议', icon: '💊', items: mockPhrases.filter(p => p.category === 'advice') },
      { key: 'comfort', label: '安慰与鼓励', icon: '❤️', items: mockPhrases.filter(p => p.category === 'comfort') },
      { key: 'followup', label: '随访提醒', icon: '📅', items: mockPhrases.filter(p => p.category === 'followup') },
    ];
    if (!keyword) return rawGroups;
    return rawGroups
      .map(g => ({ ...g, items: g.items.filter(p => p.content.includes(keyword)) }))
      .filter(g => g.items.length > 0);
  }, [keyword]);

  const copy = (p: typeof mockPhrases[0]) => {
    Taro.setClipboardData({ data: p.content });
    Taro.showToast({ title: '已复制到剪贴板', icon: 'success' });
    console.log('[Phrases] 复制:', p.id, '使用次数+1');
  };

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View style={{ marginBottom: '24rpx' }}>
        <Text style={{ fontSize: '40rpx', fontWeight: 700, color: '#1D2129', display: 'block', marginBottom: '4rpx' }}>💬 常用语</Text>
        <Text style={{ fontSize: '24rpx', color: '#86909C' }}>共 {mockPhrases.length} 条常用语，点击快速复制使用</Text>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.icon}>🔍</Text>
        <Input
          className={styles.input}
          placeholder="搜索常用语关键词..."
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
        />
        {keyword && <Text className={styles.hint} onClick={() => setKeyword('')}>清除</Text>}
      </View>

      {groups.map((g) => (
        <View key={g.key} className={styles.groupCard}>
          <View className={styles.groupTitle}>
            <Text>{g.icon}</Text>
            <Text>{g.label}</Text>
            <Text className={styles.count}>{g.items.length}条</Text>
          </View>
          <View className={styles.phraseList}>
            {g.items.map((p) => (
              <View key={p.id} className={styles.phraseChip} onClick={() => copy(p)}>
                {p.isPinned && <Text className={styles.pin}>📌</Text>}
                <Text>{p.content}</Text>
                <Text style={{ fontSize: '20rpx', color: '#86909C', marginLeft: '4rpx' }}>·{p.usageCount}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View className={styles.fab} onClick={() => Taro.showToast({ title: '新建常用语', icon: 'none' })}>
        <Text>+</Text>
      </View>
    </ScrollView>
  );
};

export default PhrasesPage;
