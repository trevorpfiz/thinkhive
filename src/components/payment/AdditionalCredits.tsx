import { api } from '@/utils/api';
import { Card, Text, Metric, Flex } from '@tremor/react';
import { useRouter } from 'next/router';
import Button from '../ui/Button';
import LoadingBars from '../ui/LoadingBars';

export default function AdditionalCredits() {
  const { isLoading, data, error } = api.user.getAdditionalCredits.useQuery();
  const { mutateAsync: createCheckoutSession } = api.stripe.createCheckoutSession.useMutation();

  const { push } = useRouter();

  const handleClick = async () => {
    if (data?.additionalPriceId) {
      const { checkoutUrl } = await createCheckoutSession({
        selectedPriceId: data.additionalPriceId,
        isSubscription: false,
      });
      if (checkoutUrl) {
        void push(checkoutUrl);
      }
    }
  };

  if (error) {
    return <Text>Something went wrong</Text>;
  }

  return (
    <div className="">
      {isLoading ? (
        <LoadingBars />
      ) : (
        <Card className="mx-auto max-w-xs bg-gray-100 px-4 py-2 shadow-none">
          <Flex className="flex-wrap justify-between gap-4">
            <div>
              <Text>Additional Credits</Text>
              <Metric className="text-lg">{data.additionalCredits}</Metric>
            </div>
            <Button onClick={handleClick}>Purchase</Button>
          </Flex>
        </Card>
      )}
    </div>
  );
}
