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
  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const initialNotificationState: NotificationProps = {
    intent: 'error',
    message: '',
    description: '',
    show: false,
    onClose: closeNotification,
  };

  const [notification, setNotification] = useState<NotificationProps>(initialNotificationState);

  const showSuccessNotification = (message: string, description = '') => {
    setNotification({
      intent: 'success',
      message,
      description,
      show: true,
      onClose: closeNotification,
      timeout: 3000,
    });
  };

  const showErrorNotification = (message: string, description = '') => {
    setNotification({
      intent: 'error',
      message,
      description,
      show: true,
      onClose: closeNotification,
    });
  };

  const showLoadingNotification = (message: string, description = '') => {
    setNotification({
      intent: 'loading',
      message,
      description,
      show: true,
      onClose: closeNotification,
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
