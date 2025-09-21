"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BrainCog } from "lucide-react"

export function ThinkResponse({ children }: { children: React.ReactNode }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1" className="border-b-0">
        <AccordionTrigger className="py-2 hover:no-underline">
            <div className="flex items-center gap-2">
                <BrainCog className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Deep Dive</span>
            </div>
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
