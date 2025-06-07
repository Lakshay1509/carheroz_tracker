
"use client";

import type * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { ServiceWithId } from "@/types";
import { format } from "date-fns";

interface ServiceTableProps {
  services: ServiceWithId[];
  onEdit: (service: ServiceWithId) => void;
  onDelete: (serviceId: string) => void;
}

export function ServiceTable({ services, onEdit, onDelete }: ServiceTableProps) {
  if (services.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No services recorded yet.</p>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Payment Mode</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id} className="hover:bg-muted/50 transition-colors">
              <TableCell>{service.employeeName}</TableCell>
              <TableCell>{service.serviceType}</TableCell>
              <TableCell>{format(service.serviceDate, "MMM d, yyyy")}</TableCell>
              <TableCell className="text-right">₹{service.paymentAmount.toFixed(2)}</TableCell>
              <TableCell>
                {service.paymentMode}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(service)} aria-label="Edit service">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(service.id)} aria-label="Delete service" className="text-destructive hover:text-destructive/90">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
