import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatItemProps {
  value: string | number;
  label: string;
  subText?: string;
  colorType?: 'critical' | 'warning' | 'stable' | 'primary' | 'default';
}

const StatItem: React.FC<StatItemProps> = ({
  value,
  label,
  subText,
  colorType = 'default'
}) => {
  return (
    <View className={styles.statItem}>
      <Text className={classnames(styles.statValue, styles[colorType])}>
        {value}
      </Text>
      <Text className={styles.statLabel}>{label}</Text>
      {subText && <Text className={styles.statSub}>{subText}</Text>}
    </View>
  );
};

export default StatItem;
