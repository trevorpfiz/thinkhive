export function getProrationAmount(
  credits: number,
  currentProductCredits: number,
  currentPriceAmount: number
) {
  console.log(credits, currentProductCredits, currentPriceAmount);
  const prorationAmount = (credits / currentProductCredits) * currentPriceAmount; //proration algo
  console.log(prorationAmount);
  return prorationAmount;
}
