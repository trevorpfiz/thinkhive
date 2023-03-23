import { api } from '@/utils/api';
import { useRouter } from 'next/router';
import Button from '../ui/Button';

export const ManageBilling = () => {
  const { mutateAsync: createBillingPortalSession } =
    api.stripe.createBillingPortalSession.useMutation();
  const { push } = useRouter();
  return (
    <Button
      onClick={async () => {
        const { billingPortalUrl } = await createBillingPortalSession();
        if (billingPortalUrl) {
          void push(billingPortalUrl);
        }
      }}
      intent="solidIndigo"
      className="rounded-md"
    >
      Billing Portal
    </Button>
  );
};
