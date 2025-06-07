
import type { Timestamp } from "firebase/firestore";

export interface Service {
  employeeName: string;
  serviceType: string;
  serviceDate: Date; // Stored as Date object, converted to/from Firestore Timestamp
  paymentAmount: number;
  paymentMode: "Online" | "Cash";
  createdAt?: Timestamp; // Firestore Timestamp for sorting
}

export interface ServiceWithId extends Service {
  id: string;
}

// For form handling, serviceDate might be string initially or Date
// ServiceFormData will now implicitly include paymentMode from Service
export type ServiceFormData = Omit<Service, 'createdAt' | 'serviceDate'> & {
  serviceDate: Date | undefined;
};
