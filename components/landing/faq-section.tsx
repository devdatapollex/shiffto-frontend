'use client';

import { Phone } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ_ITEMS = [
  {
    id: 'item-1',
    question: '1. How does Shiftto work?',
    answer:
      'Shiftto connects people who need to send items internationally with verified travelers already heading to the same destination. Simply create a shipment request, receive offers from travelers, choose the best option, and track the delivery until it reaches its destination.',
  },
  {
    id: 'item-2',
    question: '2. How are travelers verified?',
    answer:
      'All travelers complete identity verification, including government ID checks and contact verification, before they can make offers on shipments.',
  },
  {
    id: 'item-3',
    question: '3. What items can I send through Shiftto?',
    answer:
      'You can send a wide variety of personal items, electronics, documents, and gifts, provided they comply with airline safety standards and customs regulations.',
  },
  {
    id: 'item-4',
    question: '4. How is the delivery price determined?',
    answer:
      'Travelers submit offers with their proposed delivery fee. You can accept an offer or make a counter-offer to negotiate a price that works for both parties.',
  },
  {
    id: 'item-5',
    question: '5. Can I track my package during transit?',
    answer:
      'Yes! Real-time status updates are provided from package handover, departure, transit, to final delivery receipt.',
  },
];

export function FAQSection() {
  return (
    <section className="container mx-auto px-4 py-12 max-w-4xl flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Your Questions. Answered.</h2>
        <p className="text-base text-muted-foreground">
          Answers to all your questions, quickly and clearly
        </p>
      </div>

      {/* FAQ Accordion List using shadcn Accordion */}
      <Accordion
        type="single"
        collapsible
        defaultValue="item-1"
        className="w-full flex flex-col gap-3"
      >
        {FAQ_ITEMS.map((item) => (
          <AccordionItem key={item.id} value={item.id} className="border rounded-xl px-6 py-1">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Still Have Questions Banner / Card */}
      <div className="border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h3 className="text-lg font-bold">Still have a question in mind?</h3>
          <p className="text-sm text-muted-foreground">
            Contact us if you have any other questions.
          </p>
        </div>
        <button className="border rounded-xl px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 shrink-0">
          <Phone className="h-4 w-4" />
          Contact us
        </button>
      </div>
    </section>
  );
}
