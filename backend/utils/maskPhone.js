/**
 * Masks a phone number showing only first 3 and last 2 digits
 * @param {string} phone - The phone number to mask
 * @returns {string} - The masked phone number
 */
export const maskPhoneNumber = (phone) => {
  // If no phone number or empty, return as is
  if (!phone || phone.length === 0) {
    return phone;
  }
  
  let maskedPhone;
  
  if (phone.length >= 5) {
    // For longer numbers, show first 3 and last 2
    maskedPhone = 
      phone.substring(0, 3) + 
      '*'.repeat(phone.length - 5) + 
      phone.substring(phone.length - 2);
  } else if (phone.length > 2) {
    // For shorter numbers, show first 1 and last 1
    maskedPhone = 
      phone.substring(0, 1) + 
      '*'.repeat(phone.length - 2) + 
      phone.substring(phone.length - 1);
  } else {
    // For very short numbers, mask all
    maskedPhone = '*'.repeat(phone.length);
  }
  
  return maskedPhone;
}; 