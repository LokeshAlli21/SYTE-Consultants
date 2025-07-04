// src/utils/navigation.js
let navigateFunction = null;

export const setNavigate = (navigate) => {
  navigateFunction = navigate;
};

export const getNavigate = () => navigateFunction;