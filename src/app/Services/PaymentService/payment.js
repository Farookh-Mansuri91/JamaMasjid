import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { amount, upiId } = req.body; // Get amount, UPI ID or Phone number from request

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID, 
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      payment_capture: 1, // Auto capture payment
      method: "upi",
      upi: {
        vpa: upiId, // User's UPI ID
      },
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Payment failed", error });
  }
}
