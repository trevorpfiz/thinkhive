import { useRouter } from 'next/router';

import { api } from '@/utils/api';
import Button from '../ui/Button';

export const ManageBilling = ({ disabled }: { disabled: boolean }) => {
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
      size="large"
      className="rounded-md"
      disabled={disabled}
    >
      Billing Portal
    </Button>
  );
};
