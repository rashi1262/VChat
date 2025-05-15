"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PlansPage from "../../components/PlansPage"; // Import your page component

const stripePromise = loadStripe(
  "pk_test_51R670dPqjLJEAu5pP6DSMUXUGK535oEdgQ9Xy1Qs0THarwksxbnRyz9OKghZIm34i1CqPYqIPs9R7Ed5lAkGX9DF00lZQhDIVu"
);

export default function PlansWrapper() {
  return (
    <Elements stripe={stripePromise}>
      <PlansPage />
    </Elements>
  );
}
