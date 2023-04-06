import { useRouter } from 'next/router';

import { api } from '@/utils/api';
import SubscribeModal from './SubscribeModal';
import Notification from '../ui/Notification';
import useNotification from '@/hooks/useNotification';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  buttonDisabledAtom,
  frequencyAtom,
  selectedAmountAtom,
  selectedPriceIdAtom,
  selectedTierAtom,
  type Interval,
  type Metadata,
  type Tier,
} from './Plans';
import { useEffect } from 'react';

interface SubscribeButtonProps {
  tier: Tier;
  hasActiveSubscription: boolean;
}

export const modalStageAtom = atom(0);
export const swapImmediatelyAtom = atom(true);

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  tier,
  hasActiveSubscription,
}) => {
  const setModalStage = useSetAtom(modalStageAtom);
  const swapImmediately = useAtomValue(swapImmediatelyAtom);
  const setSelectedTier = useSetAtom(selectedTierAtom);
  const setSelectedAmount = useSetAtom(selectedAmountAtom);
  const frequency = useAtomValue(frequencyAtom);
  const [selectedPriceId, setSelectedPriceId] = useAtom(selectedPriceIdAtom);
  const [buttonDisabled, setButtonDisabled] = useAtom(buttonDisabledAtom);

  const { data, isLoading: isLoadingSubscription } = api.user.getActiveSubscription.useQuery();
  const activeSubscription = data?.activeSubscription?.[0];
  const subscriptionStatus = activeSubscription?.status;
  const subscriptionPriceId = activeSubscription?.price_id;
  const subscribedMetadata = activeSubscription?.price?.product.metadata as Metadata;

  const isSubscribedPrice = tier?.isSubscribedPrice[frequency?.value as keyof Interval] || false;
  const amount = tier?.price[frequency?.value as keyof Interval]?.amount || 0;
  const disableMonthly =
    activeSubscription?.price?.interval === 'year' && frequency?.value === 'monthly';
  const disableDowngrade =
    parseInt(tier.metadata.index || '0', 10) < parseInt(subscribedMetadata?.index || '0', 10);

  const utils = api.useContext();
  const { mutateAsync: createCheckoutSession } = api.stripe.createCheckoutSession.useMutation();
  const { mutate: changeSubscription, isLoading: isChangingSubscription } =
    api.stripe.upgradeOrDowngradeSubscription.useMutation({
      onSuccess() {
        // FIXME - need to wait for Stripe webhook to update the subscription
        setTimeout(() => {
          setButtonDisabled(false);
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

  // dynamic button state
  const getButtonState = () => {
    if (!subscriptionStatus) return 'Subscribe';
    if (subscriptionPriceId === tier?.price[frequency?.value as keyof Interval]?.priceId) {
      return 'Current plan';
    }
    if (disableMonthly) return 'Annual active';
    if (tier.isSubscribedProduct) {
      return frequency?.value === 'monthly' ? 'Change to Monthly' : 'Change to Annual';
    }
    if (parseInt(tier.metadata.index || '0', 10) > parseInt(subscribedMetadata?.index || '0', 10)) {
      return 'Upgrade';
    }
    return 'Contact us';
  };

  // notifications
  const { notification, showErrorNotification, showSuccessNotification, showLoadingNotification } =
    useNotification();

  // handlers
  const handleClick = async () => {
    const newSelectedPriceId = tier.price[frequency.value as keyof Interval]?.priceId || '';
    setSelectedPriceId(newSelectedPriceId);

    if (hasActiveSubscription) {
      setSelectedTier(tier);
      setSelectedAmount(amount);
      setModalStage(3);
    } else if (newSelectedPriceId) {
      const { checkoutUrl } = await createCheckoutSession({
        selectedPriceId: newSelectedPriceId,
        isSubscription: true,
      });
      if (checkoutUrl) {
        void push(checkoutUrl);
      }
    }
  };

  function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    showLoadingNotification('Updating subscription...');

    changeSubscription({ selectedPriceId, swapImmediately });

    setModalStage(0);
  }

  useEffect(() => {
    if (isChangingSubscription) {
      setButtonDisabled(true);
    }
  }, [isChangingSubscription, setButtonDisabled]);

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
      <SubscribeModal onSubmit={handleSubscribe} />
      <button
        className="mt-6 block w-full rounded-md bg-indigo-600 py-2 px-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
        onClick={handleClick}
        disabled={
          isSubscribedPrice ||
          disableMonthly ||
          buttonDisabled ||
          isLoadingSubscription ||
          disableDowngrade
        }
      >
        {getButtonState()}
      </button>
    </>
  );
};
