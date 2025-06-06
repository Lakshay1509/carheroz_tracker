import type { Timestamp } from "firebase/firestore";

export interface Service {
  employeeName: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  serviceDate: Date; // Stored as Date object, converted to/from Firestore Timestamp
  paymentAmount: number;
  paymentStatus: "Paid" | "Pending" | "Overdue";
  createdAt?: Timestamp; // Firestore Timestamp for sorting
}

export interface ServiceWithId extends Service {
  id: string;
}

// For form handling, serviceDate might be string initially or Date
export type ServiceFormData = Omit<Service, 'createdAt' | 'serviceDate'> & {
  serviceDate: Date | undefined;
};
