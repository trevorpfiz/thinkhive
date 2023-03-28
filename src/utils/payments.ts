export function getProrationAmountMonthly(
  credits: number,
  currentProductCredits: number,
  currentPriceAmount: number
) {
  // credits/CurrentProductCredits * CurrentPrice
  const prorationAmount = (credits / currentProductCredits) * currentPriceAmount; //proration algo

  return Math.round(prorationAmount * 100) / 100;
}

export function getProrationAmountAnnual(
  credits: number,
  currentProductCredits: number,
  currentPriceAmount: number,
  monthsLeft: number
) {
  // (CurrentPrice/12) * (credits/CurrentProductCredits + (MonthsLeft - 1))
  const prorationAmount =
    (currentPriceAmount / 12) * (credits / currentProductCredits + (monthsLeft - 1)); //proration algo

  return Math.round(prorationAmount * 100) / 100;
}
