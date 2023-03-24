import { useRouter } from 'next/router';

import { api } from '@/utils/api';
import SubscribeModal from './SubscribeModal';
import { useState } from 'react';
import Notification from '../ui/Notification';
import useNotification from '@/hooks/useNotification';

interface SubscribeButtonProps {
  priceId: string;
  isSubscribedPrice: boolean;
  isSubscribedProduct: boolean;
  frequency: string;
  hasActiveSubscription: boolean;
}

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  priceId,
  isSubscribedPrice,
  isSubscribedProduct,
  frequency,
  hasActiveSubscription,
}) => {
  const utils = api.useContext();
  const { mutateAsync: createCheckoutSession } = api.stripe.createCheckoutSession.useMutation();
  const { mutate: changeSubscription } = api.stripe.upgradeOrDowngradeSubscription.useMutation({
    onSuccess() {
      // FIXME - need to wait for Stripe webhook to update the subscription
      setTimeout(() => {
        showSuccessNotification('Enjoy your new subscription!');
        // Refetch the query after a successful detach
        void utils.stripe.getActiveProductsWithPrices.invalidate();
        void utils.user.getActiveSubscription.invalidate();
      }, 3000);
    },
    onError: (error) => {
      showErrorNotification('Error Updating Subscription', error.message);
    },
  });
  const { push } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const buttonText = () => {
    if (isSubscribedProduct) {
      if (isSubscribedPrice) {
        return 'Current plan';
      } else {
        return frequency === 'monthly' ? 'Change to Monthly' : 'Change to Annual';
      }
    }
    return 'Subscribe';
  };

  // notifications
  const { notification, showErrorNotification, showSuccessNotification, showLoadingNotification } =
    useNotification();

  // handlers
  const handleClick = async () => {
    if (hasActiveSubscription) {
      setIsModalOpen(true);
    } else {
      const { checkoutUrl } = await createCheckoutSession({ priceId });
      if (checkoutUrl) {
        void push(checkoutUrl);
      }
    }
  };

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showLoadingNotification('Updating subscription...');

    changeSubscription({ priceId });

    setIsModalOpen(false);
  }

  return (
    <>
      {notification.show && (
        <Notification
          intent={notification.intent}
          message={notification.message}
          description={notification.description}
          show={notification.show}
          onClose={notification.onClose}
          timeout={notification.timeout}
        />
      )}
      <SubscribeModal modal={[isModalOpen, setIsModalOpen]} onSubmit={handleSubscribe} />
      <button
        className="mt-6 block w-full rounded-md bg-indigo-600 py-2 px-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
        onClick={handleClick}
        disabled={isSubscribedPrice}
      >
        {buttonText()}
      </button>
    </>
  );
};
