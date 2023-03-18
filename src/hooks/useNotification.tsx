import { useState } from 'react';

type NotificationProps = {
  intent: 'success' | 'error' | 'loading';
  message: string;
  description: string;
  show: boolean;
  onClose: () => void;
  timeout?: number;
};

const useNotification = () => {
  const [notification, setNotification] = useState<NotificationProps>({
    intent: 'error',
    message: '',
    description: '',
    show: false,
    onClose: () => setNotification({ ...notification, show: false }),
  });

  const showSuccessNotification = (message: string, description = '') => {
    setNotification({
      intent: 'success',
      message,
      description,
      show: true,
      onClose: notification.onClose,
      timeout: 3000,
    });
  };

  const showErrorNotification = (message: string, description = '') => {
    setNotification({
      intent: 'error',
      message,
      description,
      show: true,
      onClose: notification.onClose,
    });
  };

  const showLoadingNotification = (message: string, description = '') => {
    setNotification({
      intent: 'loading',
      message,
      description,
      show: true,
      onClose: notification.onClose,
    });
  };

  return {
    notification,
    showSuccessNotification,
    showErrorNotification,
    showLoadingNotification,
  };
};

export default useNotification;
