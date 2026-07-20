import { useCameraPermission, useCameraDevice } from 'react-native-vision-camera';
import { useEffect, useState } from 'react';

export function useCameraSetup() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // A small delay simulates initialization to prevent layout shifts
    // while the permission state is synchronized.
    setIsInitializing(false);
  }, [hasPermission]);

  return {
    device,
    hasPermission,
    requestPermission,
    isInitializing,
  };
}
