import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export const Button = ({ title, loading, style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity 
      style={[styles.button, props.disabled && styles.disabled, style]} 
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryText} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.body,
    color: colors.primaryText,
    fontWeight: '600',
  },
});
