// server/src/services/smsService.js
import axios from "axios";

export const sendNgoTaskSMS = async (ngoPhoneNumber, taskName) => {
  try {
    let formattedNumber = String(ngoPhoneNumber).trim();
    if (formattedNumber.startsWith("0")) {
      formattedNumber = "94" + formattedNumber.substring(1);
    } else if (formattedNumber.startsWith("+94")) {
      formattedNumber = formattedNumber.substring(1);
    }

    const notifyUserId = process.env.NOTIFY_USER_ID;
    const notifyApiKey = process.env.NOTIFY_API_KEY;
    const notifySenderId = process.env.NOTIFY_SENDER_ID;

    if (!notifyUserId || !notifyApiKey || !notifySenderId) {
      if (!notifyUserId) console.warn("ENV WARNING: NOTIFY_USER_ID is NOT SET.");
      if (!notifyApiKey) console.warn("ENV WARNING: NOTIFY_API_KEY is NOT SET.");
      if (!notifySenderId) console.warn("ENV WARNING: NOTIFY_SENDER_ID is NOT SET.");
      console.warn("SMS API not set - aborting attempt");
      return null;
    }

    const response = await axios.post("https://app.notify.lk/api/v1/send", {
      user_id: notifyUserId,
      api_key: notifyApiKey,
      sender_id: notifySenderId,
      to: formattedNumber,
      message: `RescueNet Alert: You have been assigned a new task - ${taskName}. Please check the dashboard for details.`,
    });

    console.log("SMS dispatched successfully to NGO:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to send SMS via Notify.lk:", error.response?.data || error.message);
    return null;
  }
};