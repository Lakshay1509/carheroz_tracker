
import type { Timestamp } from "firebase/firestore";

export type PaymentAcceptedByType = "Car Heroz Account" | "Employee";

export interface Service {
  employeeName: string;
  serviceType: string;
  serviceDate: Date; // Stored as Date object, converted to/from Firestore Timestamp
  paymentAmount: number;
  paymentMode: "Online" | "Cash";
  paymentAcceptedBy: PaymentAcceptedByType;
  createdAt?: Timestamp; // Firestore Timestamp for sorting
  userId?: string; // Added to associate service with a user
}

export interface ServiceWithId extends Service {
  id: string;
}

// For form handling, serviceDate might be string initially or Date
export type ServiceFormData = Omit<Service, 'createdAt' | 'serviceDate' | 'userId'> & {
  serviceDate: Date | undefined;
};
