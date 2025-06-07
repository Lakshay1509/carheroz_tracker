
"use client";

import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Service } from '@/types'; // Re-use PaymentMode type

export interface ServiceEntry {
  id: string;
  serviceType: string;
  paymentAmount: number;
  paymentMode: Service["paymentMode"];
}

interface ServiceEntryItemProps {
  entry: ServiceEntry;
  onChange: (id: string, field: keyof Omit<ServiceEntry, 'id'>, value: string | number) => void;
  onRemove: (id: string) => void;
  entryIndex: number;
}

export function ServiceEntryItem({ entry, onChange, onRemove, entryIndex }: ServiceEntryItemProps) {
  const paymentModeOptions: Array<Service["paymentMode"]> = ["Online", "Cash"];

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-lg font-medium">Service Entry #{entryIndex + 1}</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => onRemove(entry.id)} aria-label="Remove service entry" className="text-destructive hover:text-destructive/90">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor={`serviceType-${entry.id}`}>Service Type</Label>
            <Input
              id={`serviceType-${entry.id}`}
              placeholder="e.g. Consultation, Repair"
              value={entry.serviceType}
              onChange={(e) => onChange(entry.id, 'serviceType', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`paymentAmount-${entry.id}`}>Payment Amount (₹)</Label>
            <Input
              id={`paymentAmount-${entry.id}`}
              type="number"
              step="0.01"
              value={entry.paymentAmount}
              onChange={(e) => onChange(entry.id, 'paymentAmount', parseFloat(e.target.value) || 0)}
            />
          </div>
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
        </div>
      </CardContent>
    </Card>
  );
}

    