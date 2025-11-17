export const validateEmail = (email) => {
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateCardNumber = (cardNumber) => {
  const re = /^[0-9]{13,19}$/
  return re.test(cardNumber.replace(/\s/g, ''))
}

export const validateCVV = (cvv) => {
  const re = /^[0-9]{3,4}$/
  return re.test(cvv)
}

export const validateExpiry = (expiry) => {
  const re = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
  return re.test(expiry)
}