import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SectionCardProps {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  showIcon?: boolean;
  onClick?: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  extra,
  children,
  showIcon = true,
  onClick
}) => {
  return (
    <View className={styles.sectionCard} onClick={onClick}>
      <View className={styles.cardHeader}>
        <View className={styles.cardTitle}>
          {showIcon && <View className={styles.titleIcon} />}
          <Text>{title}</Text>
        </View>
        {extra && <View className={styles.cardExtra}>{extra}</View>}
      </View>
      <View className={styles.cardBody}>{children}</View>
    </View>
  );
};

export default SectionCard;
