import { Check } from "lucide-react";
import "./paymentSuccess.css";

export default function PaymentSuccess() {
  return (
    <main className="wp-payment-success">
      <section
        className="wp-payment-success__card"
        aria-labelledby="wp-payment-success-title"
      >
        <div className="wp-payment-success__icon" aria-hidden="true">
          <Check size={34} strokeWidth={2.5} />
        </div>
        <p className="wp-payment-success__eyebrow">Payment confirmed</p>
        <h1 id="wp-payment-success-title">Thank you!</h1>
        <p className="wp-payment-success__message">
          Your payment was received successfully. You can safely close this
          page.
        </p>
      </section>
    </main>
  );
}
