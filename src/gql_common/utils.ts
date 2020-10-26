export const PRICE_ADDITIONAL_RATE = 1.2; //120%

//not used, insted used mongoose-float only in history schema
export const trueRound = (value: number, digits = 2) => {
  const str_res = (
    Math.round(Number((value * Math.pow(10, digits)).toFixed(digits - 1))) /
    Math.pow(10, digits)
  ).toFixed(digits);
  return Number(str_res);
};
