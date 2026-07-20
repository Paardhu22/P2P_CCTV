import React from 'react';
import { View, StyleSheet, SafeAreaView, ViewProps } from 'react-native';
import { colors } from '../theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
}

export const Screen = ({ children, style, ...props }: ScreenProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
