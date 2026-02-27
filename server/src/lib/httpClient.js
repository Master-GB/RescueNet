//Create a shared HTTP client
import axios from "axios";

export const http = axios.create({
  timeout: 50000,
  headers: {
    "User-Agent": "RescueNet/1.0 (Student Project; contact: your@email.com)",
    "Accept": "application/json,text/plain,*/*",
  },
});
