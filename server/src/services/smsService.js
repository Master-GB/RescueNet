// server/src/services/smsService.js
const axios = require('axios');

const sendNgoTaskSMS = async (ngoPhoneNumber, taskName) => {
  try {
    // Notify.lk requires phone numbers in the 947XXXXXXXX format.
    // This is a quick formatter to ensure the number is correct even if passed as 07XXXXXXXX
    let formattedNumber = ngoPhoneNumber.toString().trim();
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '94' + formattedNumber.substring(1);
    } else if (formattedNumber.startsWith('+94')) {
      formattedNumber = formattedNumber.substring(1);
    }

    // Check required Notify.lk env vars; abort safely if any are missing
    const notifyUserId = process.env.NOTIFY_USER_ID;
    const notifyApiKey = process.env.NOTIFY_API_KEY;
    const notifySenderId = process.env.NOTIFY_SENDER_ID;

    // checking if env variables are not set (Notify.lk credentials) and logging warnings for each missing variable
    if (!notifyUserId || !notifyApiKey || !notifySenderId) {
      if (!notifyUserId) console.warn('ENV WARNING: NOTIFY_USER_ID is NOT SET. Set NOTIFY_USER_ID in your environment or .env file.');
      if (!notifyApiKey) console.warn('ENV WARNING: NOTIFY_API_KEY is NOT SET. Set NOTIFY_API_KEY in your environment or .env file.');
      if (!notifySenderId) console.warn('ENV WARNING: NOTIFY_SENDER_ID is NOT SET. Set NOTIFY_SENDER_ID in your environment or .env file.');
      console.warn('SMS API not set aborting attempt');
      return null;
    }

    // Send SMS via Notify.lk API
    const response = await axios.post('https://app.notify.lk/api/v1/send', {
      user_id: process.env.NOTIFY_USER_ID,
      api_key: process.env.NOTIFY_API_KEY,
      sender_id: process.env.NOTIFY_SENDER_ID,
      to: formattedNumber,
      message: `RescueNet Alert: You have been assigned a new task - ${taskName}. Please check the dashboard for details.`
    });
    
    console.log('SMS dispatched successfully to NGO:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send SMS via Notify.lk:', error.response?.data || error.message);
  }
};

module.exports = { sendNgoTaskSMS };