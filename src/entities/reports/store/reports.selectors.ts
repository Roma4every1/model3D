export const reportsSelector = (state: WState) => {
  return Object.values<Report>(state.reports).reverse();
};
