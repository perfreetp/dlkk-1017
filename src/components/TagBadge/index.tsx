import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { RiskLevel } from '../../types';
import styles from './index.module.scss';

interface TagBadgeProps {
  children: React.ReactNode;
  type?: RiskLevel | 'primary' | 'secondary' | 'default';
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

const TagBadge: React.FC<TagBadgeProps> = ({
  children,
  type = 'default',
  size = 'sm',
  showDot = false,
  className = ''
}) => {
  return (
    <View
      className={classnames(
        styles.tagBadge,
        styles[type],
        {
          [styles.dot]: showDot,
          [styles.large]: size === 'lg'
        },
        className
      )}
    >
      <Text>{children}</Text>
    </View>
  );
};

export default TagBadge;
