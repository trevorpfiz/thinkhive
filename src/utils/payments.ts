import dayjs from 'dayjs';

export function getProrationAmountsMonthly(
  credits: number,
  currentProductCredits: number,
  currentPriceAmount: number,
  newPriceAmount: number
) {
  // credits/CurrentProductCredits * CurrentPrice
  const prorationAmount = (credits / currentProductCredits) * currentPriceAmount;

  // NewPrice - (credits/CurrentProductCredits * CurrentPrice)
  const totalAmount = newPriceAmount - (credits / currentProductCredits) * currentPriceAmount;

  return {
    proration: Math.round(prorationAmount * 100) / 100,
    total: Math.round(totalAmount * 100) / 100,
  };
}

export function getProrationAmountsAnnual(
  credits: number,
  currentProductCredits: number,
  currentPriceAmount: number,
  currentPeriodEnd: number,
  newPriceAmount: number
) {
  // get months left
  const monthsLeft = dayjs(currentPeriodEnd).diff(dayjs(), 'month');

  // (CurrentPrice/12) * (credits/CurrentProductCredits + (MonthsLeft))
  const prorationAmount =
    (currentPriceAmount / 12) * (credits / currentProductCredits + monthsLeft);

  // NewPrice/12*(MonthsLeft+1) - (CurrentPrice/12) * (credits/CurrentProductCredits + (MonthsLeft))
  const totalAmount =
    (newPriceAmount / 12) * (monthsLeft + 1) -
    (currentPriceAmount / 12) * (credits / currentProductCredits + monthsLeft);

  return {
    proration: Math.round(prorationAmount * 100) / 100,
    total: Math.round(totalAmount * 100) / 100,
  };
}
