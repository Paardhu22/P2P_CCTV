import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface CardProps extends TouchableOpacityProps {
  title: string;
  description: string;
}

export const Card = ({ title, description, style, ...props }: CardProps) => {
  return (
    <TouchableOpacity 
      style={[styles.card, style]} 
      activeOpacity={0.7}
      {...props}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.m,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.s,
  },
  description: {
    ...typography.bodySecondary,
  },
});
