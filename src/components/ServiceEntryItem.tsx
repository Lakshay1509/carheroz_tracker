
"use client";

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CurrencyInput from 'react-currency-input-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Service, PaymentAcceptedByType } from '@/types';

export interface ServiceEntry {
  id: string;
  serviceType: string;
  paymentAmount: number;
  paymentMode: Service["paymentMode"];
  paymentAcceptedBy: PaymentAcceptedByType;
}

interface ServiceEntryItemProps {
  entry: ServiceEntry;
  onChange: (id: string, field: keyof Omit<ServiceEntry, 'id'>, value: string | number) => void;
  onRemove: (id: string) => void;
  entryIndex: number;
}

export function ServiceEntryItem({ entry, onChange, onRemove, entryIndex }: ServiceEntryItemProps) {
  const paymentModeOptions: Array<Service["paymentMode"]> = ["Online", "Cash"];
  const paymentAcceptedByOptions: PaymentAcceptedByType[] = ["Car Heroz Account", "Employee"];
  const serviceTypeOptions = ["Deep clean", "One time", "Car Spa"];

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-lg font-medium">Service Entry #{entryIndex + 1}</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => onRemove(entry.id)} aria-label="Remove service entry" className="text-destructive hover:text-destructive/90">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor={`serviceType-${entry.id}`}>Service Type</Label>
            <Select
              value={entry.serviceType}
              onValueChange={(value) => onChange(entry.id, 'serviceType', value)}
            >
              <SelectTrigger id={`serviceType-${entry.id}`}>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`paymentAmount-${entry.id}`}>Payment Amount</Label>
            <CurrencyInput
              id={`paymentAmount-${entry.id}`}
              name={`paymentAmount-${entry.id}`}
              placeholder="Enter amount"
              value={entry.paymentAmount}
              decimalsLimit={2}
              prefix=""
              groupSeparator=","
              decimalSeparator="."
              onValueChange={(value) => onChange(entry.id, 'paymentAmount', parseFloat(value || '0'))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor={`paymentMode-${entry.id}`}>Payment Mode</Label>
            <Select
              value={entry.paymentMode}
              onValueChange={(value: Service["paymentMode"]) => onChange(entry.id, 'paymentMode', value)}
            >
              <SelectTrigger id={`paymentMode-${entry.id}`}>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                {paymentModeOptions.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`paymentAcceptedBy-${entry.id}`}>Payment Accepted By</Label>
            <Select
              value={entry.paymentAcceptedBy}
              onValueChange={(value: PaymentAcceptedByType) => onChange(entry.id, 'paymentAcceptedBy', value)}
            >
              <SelectTrigger id={`paymentAcceptedBy-${entry.id}`}>
                <SelectValue placeholder="Select who accepted payment" />
              </SelectTrigger>
              <SelectContent>
                {paymentAcceptedByOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
