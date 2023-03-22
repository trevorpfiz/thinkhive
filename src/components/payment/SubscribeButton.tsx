import { api } from '@/utils/api';
import { useRouter } from 'next/router';

interface SubscribeButtonProps {
  priceId: string;
  isSubscribedPrice: boolean;
  isSubscribedProduct: boolean;
  frequency: string;
}

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  priceId,
  isSubscribedPrice,
  isSubscribedProduct,
  frequency,
}) => {
  const { mutateAsync: createCheckoutSession } = api.stripe.createCheckoutSession.useMutation();
  const { push } = useRouter();

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

  return (
    <button
      className="mt-6 block w-full rounded-md bg-indigo-600 py-2 px-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-30"
      onClick={async () => {
        const { checkoutUrl } = await createCheckoutSession({ priceId });
        if (checkoutUrl) {
          void push(checkoutUrl);
        }
      }}
      disabled={isSubscribedPrice}
    >
      {buttonText()}
    </button>
  );
};
