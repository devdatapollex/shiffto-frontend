'use client';

import { Phone, Plus, Minus } from 'lucide-react';
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
    <section className="w-full bg-white flex flex-col items-center gap-10 md:gap-16 lg:gap-[80px] px-6 md:px-16 lg:px-[128px] py-16 md:py-24 lg:py-[128px] rounded-b-[40px] md:rounded-b-[60px] lg:rounded-b-[100px]">
      {/* Main Container */}
      <div className="w-full max-w-[768px] flex flex-col items-center gap-[40px]">
        {/* Title Section */}
        <div className="flex flex-col items-center text-center gap-[12px]">
          <h2 className="font-medium text-[32px] sm:text-[40px] leading-[40px] sm:leading-[48px] tracking-[-2px] text-primary align-middle">
            Your Questions. Answered.
          </h2>
          <p className="font-normal text-sm leading-5 tracking-normal text-center align-middle text-[#71717A]">
            Answers to all your questions, quickly and clearly
          </p>
        </div>

        {/* Accordion Section */}
        <Accordion type="single" collapsible className="w-full flex flex-col gap-[4px]">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="w-full bg-[#FFF8F0] rounded-[12px] border-none overflow-hidden"
            >
              <AccordionTrigger
                hideChevron
                className="group w-full flex items-center justify-between gap-4 p-[24px] text-left font-medium text-base leading-[24px] tracking-[0px] text-foreground hover:no-underline cursor-pointer"
              >
                <span>{item.question}</span>
                <div className="shrink-0">
                  <Plus className="w-5 h-5 text-foreground group-data-[state=open]:hidden" />
                  <Minus className="w-5 h-5 text-foreground group-data-[state=closed]:hidden" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-[24px] pb-[24px] pt-0">
                <div className="font-normal text-sm leading-[20px] tracking-[0px] text-[#71717A]">
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Contact Section */}
      <div className="w-full max-w-[768px] p-[24px] gap-[8px] sm:gap-[16px] rounded-[12px] border border-[#FCE7F0] bg-[#FFF0F3] flex flex-col sm:flex-row items-center justify-between">
        {/* Left side text section */}
        <div className="flex flex-col gap-[8px] text-center sm:text-left">
          <h3 className="font-medium text-base leading-6 tracking-[0px] text-foreground">
            Still have a question in mind?
          </h3>
          <p className="font-normal text-sm leading-5 tracking-[0px] align-middle text-[#71717A]">
            Contact us if you have any other questions.
          </p>
        </div>

        {/* Right side button */}
        <button
          type="button"
          className="flex items-center justify-center gap-[8px] py-[12px] px-[16px] rounded-[6px] bg-foreground text-white hover:bg-foreground/90 transition-colors cursor-pointer shrink-0"
        >
          <Phone className="w-3.5 h-3.5 stroke-[2] text-white" />
          <span className="font-medium text-sm leading-5 tracking-[0px] text-white">
            Contact us
          </span>
        </button>
      </div>
    </section>
  );
}
