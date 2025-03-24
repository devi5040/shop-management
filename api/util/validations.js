export const isEmpty = value => {
  return value.trim () === '';
};

export const isValidUsername = username => {
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
  return usernameRegex.test (username);
};

export const isValidEmail = email => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test (email);
};

export const isValidPassword = password => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test (password);
};

export const isValidNumber = value => {
  const numRegex = /^\d+$/;
  return numRegex.test (value);
};

export const isValidProductName = value => {
  const productNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
  return productNameRegex.test (value);
};

export const isValidDescription = description => {
  const descriptionRegex = /^[\s\S]{1,500}$/;
  return descriptionRegex.test (description);
};
