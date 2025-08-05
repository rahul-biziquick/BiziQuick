// // middleware/otpRateLimiter.js
// const rateLimitStore = {};

// const otpRateLimiter = (req, res, next) => {
//   const email = req.body?.email?.toLowerCase();
//   if (!email) {
//     return res
//       .status(400)
//       .json({ error: "Email is required for rate limiting." });
//   }

//   const key = `otp:${email}`;
//   const now = Date.now();

//   if (!rateLimitStore[key]) {
//     rateLimitStore[key] = [];
//   }

//   // Keep only timestamps from last 5 minutes (300000ms)
//   rateLimitStore[key] = rateLimitStore[key].filter((ts) => now - ts < 300000);

//   if (rateLimitStore[key].length >= 5) {
//     return res.status(429).json({
//       error: "Too many OTP requests. Please try again later.",
//     });
//   }

//   rateLimitStore[key].push(now);
//   next();
// };

// module.exports = { otpRateLimiter };
