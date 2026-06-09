import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Patient } from '../../types';
import { getRiskLevelText } from '../../utils/riskCalc';
import { usePatientStore } from '../../store/patientStore';
import TagBadge from '../TagBadge';
import styles from './index.module.scss';

interface PatientCardProps {
  patient: Patient;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const toggleFavorite = usePatientStore((s) => s.toggleFavorite);
  const toggleCritical = usePatientStore((s) => s.toggleCritical);
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient);

  const borderClass = {
    critical: styles.criticalBorder,
    warning: styles.warningBorder,
    stable: styles.stableBorder,
    normal: styles.normalBorder
  }[patient.riskLevel];

  const handleCardClick = () => {
    console.log('[PatientCard] 点击患者:', patient.id, patient.name);
    setSelectedPatient(patient.id);
    Taro.navigateTo({
      url: `/pages/patient-detail/index?id=${patient.id}`
    });
  };

  const handleFavorite = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    console.log('[PatientCard] 切换收藏:', patient.id);
    toggleFavorite(patient.id);
  };

  const handleCritical = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    console.log('[PatientCard] 切换急重标记:', patient.id);
    toggleCritical(patient.id);
  };

  return (
    <View
      className={classnames(styles.patientCard, borderClass)}
      onClick={handleCardClick}
    >
      <View className={styles.cardHeader}>
        <View className={styles.patientInfo}>
          <View
            className={classnames(styles.avatar, patient.gender === '女' && styles.female)}
          >
            <Text>{patient.name.charAt(0)}</Text>
          </View>
          <View className={styles.patientMeta}>
            <View className={styles.nameRow}>
              <Text className={styles.patientName}>{patient.name}</Text>
              <TagBadge type={patient.riskLevel} showDot size="sm">
                {getRiskLevelText(patient.riskLevel)}
              </TagBadge>
            </View>
            <Text className={styles.patientBasic}>
              {patient.gender} · {patient.age}岁 · {patient.patientNo}
            </Text>
            <Text className={styles.bedInfo}>
              {patient.bedNo ? `${patient.ward} ${patient.bedNo}` : '门诊患者'}
            </Text>
          </View>
        </View>
        <View className={styles.cardActions}>
          <View
            className={classnames(
              styles.actionBtn,
              styles.favorite,
              patient.isFavorite && styles.active
            )}
            onClick={handleFavorite}
          >
            <Text>{patient.isFavorite ? '★' : '☆'}</Text>
          </View>
          <View
            className={classnames(
              styles.actionBtn,
              styles.critical,
              patient.isCritical && styles.active
            )}
            onClick={handleCritical}
          >
            <Text>{patient.isCritical ? '⚠' : '⚡'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.cardBody}>
        <Text className={styles.diagnosis}>{patient.diagnosis}</Text>
        <Text className={styles.complaint}>{patient.chiefComplaint}</Text>
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.tagsWrap}>
          {patient.tags.slice(0, 3).map((tag, idx) => (
            <TagBadge key={idx} type="default">
              {tag}
            </TagBadge>
          ))}
        </View>
        <Text className={styles.lastVisit}>就诊：{patient.lastVisitDate}</Text>
      </View>
    </View>
  );
};

export default PatientCard;
