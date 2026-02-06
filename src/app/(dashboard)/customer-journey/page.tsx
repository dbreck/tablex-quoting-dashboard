"use client";

import { Header } from "@/components/layout/Header";
import { JourneyBoard } from "@/components/customer-journey/JourneyBoard";

export default function CustomerJourneyPage() {
  return (
    <>
      <Header
        title="Customer Journey"
        subtitle="Map the end-to-end quoting experience across customers, dealers, and staff"
      />
      <JourneyBoard />
    </>
  );
}
