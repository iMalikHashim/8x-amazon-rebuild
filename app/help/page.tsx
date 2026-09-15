interface Faq {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  faqs: Faq[];
}

const SECTIONS: FaqSection[] = [
  {
    title: "Shipping",
    faqs: [
      {
        question: "How much does shipping cost?",
        answer:
          "Shipping is free on orders of $35 or more. Orders under $35 have a flat $5.99 shipping charge, shown at checkout before you place your order.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Standard delivery is estimated at 2 business days from when you place your order. The exact estimated delivery date for your order is shown on the checkout and order confirmation pages.",
      },
      {
        question: "Can I change my shipping address after ordering?",
        answer:
          "Orders on this rebuild are finalized once placed and can't be edited afterward - this mirrors the scope of the take-home, which focuses on the checkout loop rather than post-purchase order management.",
      },
    ],
  },
  {
    title: "Returns",
    faqs: [
      {
        question: "What's the return policy?",
        answer:
          "Real amazon.com offers a 30-day return window on most items. This rebuild doesn't process real payments or shipments, so there's nothing to physically return - your order history is there so you can see exactly what you \"bought.\"",
      },
      {
        question: "How do I request a refund?",
        answer:
          "Since no real payment is ever charged (checkout only stores the last 4 digits of the card number you enter, for display), there's no refund flow to build or use here.",
      },
    ],
  },
  {
    title: "Your account",
    faqs: [
      {
        question: "How do I change my password?",
        answer:
          "Account settings beyond sign-up and sign-in weren't part of this build's scope. Your password is bcrypt-hashed and stored securely, but there's currently no self-service way to change it.",
      },
      {
        question: "Can I delete my account?",
        answer: "Account deletion wasn't built out for this rebuild - see the README for what is and isn't real.",
      },
      {
        question: "Why do I need an account to check out?",
        answer:
          "So your orders and reviews are tied to you specifically, and stay visible across devices and browsers - the same reason any real store asks you to sign in before checkout.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-[800px] mx-auto px-2 sm:px-3 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl text-text">Customer Service</h1>
        <p className="text-text-secondary mt-1">Answers to the questions people ask most.</p>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-text">{section.title}</h2>
          <div className="bg-white border border-border rounded-sm divide-y divide-border">
            {section.faqs.map((faq) => (
              <details key={faq.question} className="group p-4">
                <summary className="cursor-pointer list-none font-medium text-text flex items-center justify-between gap-3">
                  {faq.question}
                  <span aria-hidden="true" className="text-text-secondary shrink-0 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
