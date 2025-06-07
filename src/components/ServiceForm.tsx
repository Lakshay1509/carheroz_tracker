
"use client";

import type * as React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import CurrencyInput from 'react-currency-input-field';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ServiceFormData, PaymentAcceptedByType } from "@/types";

const paymentAcceptedByEnum = z.enum(["Car Heroz Account", "Employee"]);

const serviceFormSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  serviceType: z.string().min(1, "Service type is required"),
  serviceDate: z.date({ required_error: "Service date is required" }),
  paymentAmount: z.coerce.number().min(0, "Payment amount must be 0 or greater"),
  paymentMode: z.enum(["Online", "Cash"], { required_error: "Payment mode is required" }),
  paymentAcceptedBy: paymentAcceptedByEnum,
});

interface ServiceFormProps {
  onSubmit: (data: ServiceFormData) => Promise<void>;
  initialData?: ServiceFormData;
  isEditing?: boolean;
  onClose?: () => void;
}

export function ServiceForm({ onSubmit, initialData, isEditing = false, onClose }: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: initialData || {
      employeeName: "",
      serviceType: "",
      serviceDate: undefined,
      paymentAmount: 0,
      paymentMode: "Online",
      paymentAcceptedBy: "Car Heroz Account",
    },
  });

  const paymentModeOptions: Array<ServiceFormData["paymentMode"]> = ["Online", "Cash"];
  const paymentAcceptedByOptions: PaymentAcceptedByType[] = ["Car Heroz Account", "Employee"];
  const serviceTypeOptions = ["Deep clean", "One time", "Car Spa", "Other"];


  async function handleSubmit(data: ServiceFormData) {
    await onSubmit(data);
    if (!isEditing) {
      form.reset({
        employeeName: "",
        serviceType: "",
        serviceDate: undefined,
        paymentAmount: 0,
        paymentMode: "Online",
        paymentAcceptedBy: "Car Heroz Account",
      });
    }
  }

  const handleReset = () => {
    form.reset({
      employeeName: "",
      serviceType: "",
      serviceDate: undefined,
      paymentAmount: 0,
      paymentMode: "Online",
      paymentAcceptedBy: "Car Heroz Account",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="employeeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. John Doe" {...field} spellCheck={false} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {serviceTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serviceDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Service Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Amount </FormLabel>
                <FormControl>
                  <CurrencyInput
                    name={field.name}
                    placeholder="Enter amount"
                    value={field.value}
                    decimalsLimit={2}
                    prefix=""
                    groupSeparator=","
                    decimalSeparator="."
                    onValueChange={(value) => field.onChange(parseFloat(value || '0'))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentModeOptions.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentAcceptedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Accepted By</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select who accepted payment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paymentAcceptedByOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2">
          {!isEditing && (
             <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
          )}
          {isEditing && onClose && (
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {form.formState.isSubmitting ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save Changes" : "Add Service")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
