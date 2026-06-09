import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { usePatientStore } from '../../store/patientStore';
import styles from './index.module.scss';

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  '通用描述': { label: '通用描述', icon: '📝', color: '#1A73E8', bg: 'rgba(26,115,232,0.08)' },
  '查体': { label: '体格检查', icon: '🩺', color: '#00BFA5', bg: 'rgba(0,191,165,0.08)' },
  '处置': { label: '诊疗处置', icon: '💊', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  '辅助检查': { label: '辅助检查', icon: '🧪', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  '健康指导': { label: '健康指导', icon: '🏃', color: '#10B981', bg: 'rgba(16,185,129,0.08)' }
};

const PhrasesPage: React.FC = () => {
  const searchPhrases = usePatientStore((s) => s.searchPhrases);
  const getAllPhrases = usePatientStore((s) => s.getAllPhrases);
  const incrementPhraseUsage = usePatientStore((s) => s.incrementPhraseUsage);

  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useDidShow(() => console.log('[Phrases] 页面显示'));

  const allPhrases = getAllPhrases();

  const categoryList = useMemo(() => {
    const cats = new Map<string, number>();
    cats.set('all', allPhrases.length);
    allPhrases.forEach((p) => {
      cats.set(p.category, (cats.get(p.category) || 0) + 1);
    });
    return cats;
  }, [allPhrases]);

  const filteredList = useMemo(() => {
    let list = keyword.trim() ? searchPhrases(keyword) : allPhrases;
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }
    return list.sort((a, b) => b.usageCount - a.usageCount);
  }, [keyword, activeCategory, allPhrases, searchPhrases]);

  const groupedByCategory = useMemo(() => {
    if (keyword.trim() || activeCategory !== 'all') {
      return [{ key: 'result', label: `搜索结果（${filteredList.length}条）`, icon: '�', color: '#1A73E8', items: filteredList }];
    }
    const groups: { key: string; label: string; icon: string; color: string; bg: string; items: typeof allPhrases }[] = [];
    Object.entries(CATEGORY_CONFIG).forEach(([key, cfg]) => {
      const items = allPhrases.filter((p) => p.category === key);
      if (items.length > 0) {
        groups.push({ key, label: cfg.label, icon: cfg.icon, color: cfg.color, bg: cfg.bg, items });
      }
    });
    return groups;
  }, [keyword, activeCategory, allPhrases, filteredList]);

  const copyPhrase = (phrase: typeof allPhrases[0]) => {
    incrementPhraseUsage(phrase.id);
    Taro.setClipboardData({
      data: phrase.text,
      success: () => {
        Taro.showToast({ title: '✓ 已复制到剪贴板', icon: 'none', duration: 1200 });
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.pageWrap}>
      <View style={{ marginBottom: '24rpx' }}>
        <Text style={{ fontSize: '40rpx', fontWeight: 700, color: '#1D2129', display: 'block', marginBottom: '4rpx' }}>💬 常用语</Text>
        <Text style={{ fontSize: '24rpx', color: '#86909C' }}>
          共 {allPhrases.length} 条 · 覆盖查体/处置/检查/指导全场景 · 点击即复制
        </Text>
      </View>

      <View className={styles.searchBar}>
        <Text className={styles.icon}>🔍</Text>
        <Input
          className={styles.input}
          placeholder="按短语内容搜索，如：血压、心律、低盐..."
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
        />
        {keyword && (
          <Text className={styles.hint} onClick={() => setKeyword('')}>
            ✕ 清除
          </Text>
        )}
      </View>

      {/* 分类导航 */}
      <View style={{
        display: 'flex',
        overflowX: 'scroll',
        gap: '16rpx',
        marginBottom: '24rpx',
        padding: '4rpx 0',
        whiteSpace: 'nowrap' as const
      }}>
        {Array.from(categoryList.entries()).map(([cat, count]) => {
          const cfg = CATEGORY_CONFIG[cat];
          const isActive = activeCategory === cat;
          return (
            <View
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8rpx',
                padding: '16rpx 28rpx',
                background: isActive ? (cfg ? cfg.bg : 'rgba(26,115,232,0.12)') : '#fff',
                borderRadius: '48rpx',
                border: isActive
                  ? `2rpx solid ${cfg ? cfg.color : '#1A73E8'}`
                  : '2rpx solid #E5E6EB',
                flexShrink: 0
              }}
            >
              <Text>{cat === 'all' ? '🗂️' : cfg?.icon}</Text>
              <Text style={{
                fontSize: '26rpx',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? (cfg ? cfg.color : '#1A73E8') : '#4E5969'
              }}>
                {cat === 'all' ? '全部' : cfg?.label || cat}
              </Text>
              <Text style={{
                fontSize: '22rpx',
                color: isActive ? '#fff' : '#86909C',
                background: isActive ? (cfg ? cfg.color : '#1A73E8') : 'transparent',
                padding: isActive ? '2rpx 12rpx' : 0,
                borderRadius: '32rpx',
                marginLeft: isActive ? '4rpx' : 0
              }}>
                {count}
              </Text>
            </View>
          );
        })}
      </View>

      {groupedByCategory.length === 0 || groupedByCategory.every((g) => g.items.length === 0) ? (
        <View style={{
          padding: '120rpx 32rpx',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#fff',
          borderRadius: '16rpx'
        }}>
          <Text style={{ fontSize: '80rpx', marginBottom: '16rpx' }}>🔎</Text>
          <Text style={{ fontSize: '28rpx', color: '#1D2129', fontWeight: 500, marginBottom: '8rpx' }}>
            没有找到匹配的常用语
          </Text>
          <Text style={{ fontSize: '24rpx', color: '#86909C' }}>
            试试其他关键词，或在设置中添加新常用语
          </Text>
        </View>
      ) : (
        groupedByCategory.map((group) => (
          <View
            key={group.key}
            style={{
              background: '#fff',
              borderRadius: '16rpx',
              padding: '24rpx',
              marginBottom: '20rpx',
              boxShadow: '0 2rpx 12rpx rgba(0,0,0,0.04)'
            }}
          >
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12rpx',
                padding: '0 0 20rpx 0',
                marginBottom: '8rpx',
                borderBottom: '1rpx solid #F2F3F5'
              }}
            >
              <View style={{
                width: '56rpx',
                height: '56rpx',
                borderRadius: '14rpx',
                background: group.bg || CATEGORY_CONFIG[group.key]?.bg || 'rgba(26,115,232,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28rpx'
              }}>
                <Text>{group.icon}</Text>
              </View>
              <Text style={{
                fontSize: '30rpx',
                fontWeight: 600,
                color: '#1D2129',
                flex: 1
              }}>
                {group.label}
              </Text>
              <Text style={{
                fontSize: '22rpx',
                padding: '4rpx 16rpx',
                background: '#F2F3F5',
                borderRadius: '32rpx',
                color: '#86909C'
              }}>
                {group.items.length} 条
              </Text>
            </View>

            <View className={styles.groupCard ? '' : ''}>
              <View className={styles.phraseList ? '' : ''}>
                <View style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16rpx'
                }}>
                  {group.items.map((p) => (
                    <View
                      key={p.id}
                      className={styles.phraseChip}
                      onClick={() => copyPhrase(p)}
                      style={{
                        padding: '16rpx 20rpx 16rpx 24rpx',
                        background: group.bg || CATEGORY_CONFIG[p.category]?.bg || '#F7F8FA',
                        borderRadius: '12rpx',
                        border: `1rpx solid ${group.color || CATEGORY_CONFIG[p.category]?.color || '#E5E6EB'}20`,
                        maxWidth: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12rpx'
                      }}
                    >
                      <Text
                        style={{
                          fontSize: '26rpx',
                          color: '#1D2129',
                          lineHeight: 1.55,
                          flex: 1,
                          paddingRight: '8rpx'
                        }}
                      >
                        {p.text}
                      </Text>
                      <View style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8rpx',
                        marginTop: '4rpx'
                      }}>
                        <Text style={{
                          fontSize: '20rpx',
                          color: group.color || CATEGORY_CONFIG[p.category]?.color || '#86909C',
                          fontWeight: 500
                        }}>
                          {p.usageCount > 99 ? '🔥' : ''}
                        </Text>
                        <Text style={{
                          fontSize: '20rpx',
                          color: '#86909C',
                          background: '#FFFFFF',
                          padding: '4rpx 10rpx',
                          borderRadius: '8rpx',
                          whiteSpace: 'nowrap'
                        }}>
                          {p.usageCount}次
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={{ height: '16rpx' }} />

      <View style={{
        padding: '20rpx 24rpx',
        background: 'rgba(26,115,232,0.04)',
        borderRadius: '12rpx',
        border: '1rpx dashed rgba(26,115,232,0.3)'
      }}>
        <Text style={{ fontSize: '24rpx', color: '#4E5969', lineHeight: 1.7 }}>
          💡 提示：常用语可在 <Text style={{ color: '#1A73E8', fontWeight: 500 }}>个人中心 → 常用语管理</Text> 中自定义添加、分类和排序。复制后可直接粘贴到病历或随访记录中。
        </Text>
      </View>
    </ScrollView>
  );
};

export default PhrasesPage;
