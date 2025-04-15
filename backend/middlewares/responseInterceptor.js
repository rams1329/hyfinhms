import { maskPhoneNumber } from "../utils/maskPhone.js";

/**
 * Middleware to intercept responses containing user data 
 * and ensure phone numbers are masked
 */
const responseInterceptor = (req, res, next) => {
  // Store the original send function
  const originalSend = res.send;

  // Override the send function
  res.send = function (data) {
    // Try to parse the data if it's a string
    let responseData = data;
    if (typeof data === 'string') {
      try {
        responseData = JSON.parse(data);
      } catch (e) {
        // Not JSON, leave as is
      }
    }

    // Check if the response contains user data with a phone number
    if (responseData && responseData.userData && responseData.userData.phone) {
      // Ensure phone is masked
      responseData.userData.phone = maskPhoneNumber(responseData.userData.phone);
      
      // Convert back to string if needed
      if (typeof data === 'string') {
        data = JSON.stringify(responseData);
      } else {
        data = responseData;
      }
    }

    // Call the original send function
    originalSend.call(this, data);
  };

  next();
};

export default responseInterceptor; 