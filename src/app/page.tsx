
"use client";

import type * as React from 'react';
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { Download, PlusCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import type { Service, ServiceFormData, ServiceWithId, PaymentAcceptedByType } from "@/types";
// ServiceForm is now only used for editing
// import { ServiceForm } from "@/components/ServiceForm";
import { ServiceTable } from "@/components/ServiceTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ServiceEntryItem, type ServiceEntry } from "@/components/ServiceEntryItem";
import { ServiceForm } from "@/components/ServiceForm"; // Keep for Edit Dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function ServiceTrackerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<ServiceWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceWithId | null>(null);
  const [serviceToDeleteId, setServiceToDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>("");
  const [selectedServiceDate, setSelectedServiceDate] = useState<Date | undefined>(undefined);
  const [serviceEntries, setServiceEntries] = useState<ServiceEntry[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const servicesCollection = collection(db, "services");
      const q = query(
        servicesCollection,
        where("userId", "==", user.uid),
        orderBy("serviceDate", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const servicesData = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              serviceDate: (data.serviceDate as Timestamp).toDate(),
              createdAt: data.createdAt as Timestamp,
            } as ServiceWithId;
          });
          setServices(servicesData);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching services:", error);
          toast({ title: "Error", description: "Failed to fetch services.", variant: "destructive" });
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setServices([]);
      setIsLoading(false);
    }
  }, [user, toast]);


  const handleUpdateService = async (data: ServiceFormData) => {
    if (!currentService || !user) return;
    try {
      const serviceDocRef = doc(db, "services", currentService.id);
      const updatedService: Partial<Service> = {
        ...data,
        serviceDate: data.serviceDate!,
        paymentAcceptedBy: data.paymentAcceptedBy, // Ensure this is included
      };
      await updateDoc(serviceDocRef, updatedService);
      toast({ title: "Success", description: "Service record updated." });
      setIsEditDialogOpen(false);
      setCurrentService(null);
    } catch (error) {
      console.error("Error updating service:", error);
      toast({ title: "Error", description: "Failed to update service record.", variant: "destructive" });
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDeleteId || !user) return;
    try {
      await deleteDoc(doc(db, "services", serviceToDeleteId));
      toast({ title: "Success", description: "Service record deleted." });
      setIsDeleteDialogOpen(false);
      setServiceToDeleteId(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({ title: "Error", description: "Failed to delete service record.", variant: "destructive" });
    }
  };

  const openEditDialog = (service: ServiceWithId) => {
    setCurrentService(service);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (serviceId: string) => {
    setServiceToDeleteId(serviceId);
    setIsDeleteDialogOpen(true);
  };

  const exportToCSV = useCallback(() => {
    if (services.length === 0) {
      toast({ title: "Info", description: "No data to export." });
      return;
    }
    const headers = ["Employee Name", "Service Type", "Service Date", "Payment Amount", "Payment Mode", "Payment Accepted By"];
    const csvRows = [
      headers.join(','),
      ...services.map(s => [
        `"${s.employeeName.replace(/"/g, '""')}"`,
        `"${s.serviceType.replace(/"/g, '""')}"`,
        s.serviceDate instanceof Date ? format(s.serviceDate, "yyyy-MM-dd") : 'Invalid Date',
        s.paymentAmount,
        s.paymentMode,
        `"${s.paymentAcceptedBy.replace(/"/g, '""')}"`
      ].join(','))
    ];
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `service_records_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Service data exported to CSV." });
    } else {
       toast({ title: "Error", description: "CSV export not supported by your browser.", variant: "destructive" });
    }
  }, [services, toast]);

  const handleAddServiceEntry = () => {
    setServiceEntries(prev => [...prev, {
      id: Date.now().toString(),
      serviceType: "",
      paymentAmount: 0,
      paymentMode: "Online",
      paymentAcceptedBy: "Car Heroz Account", // Default value
    }]);
  };

  const handleServiceEntryChange = (id: string, field: keyof Omit<ServiceEntry, 'id'>, value: string | number | Date) => {
    setServiceEntries(prev =>
      prev.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleRemoveServiceEntry = (id: string) => {
    setServiceEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleSaveAllServices = async () => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to save services.", variant: "destructive" });
      return;
    }
    if (!selectedEmployeeName.trim()) {
      toast({ title: "Validation Error", description: "Employee name is required.", variant: "destructive" });
      return;
    }
    if (!selectedServiceDate) {
      toast({ title: "Validation Error", description: "Service date is required.", variant: "destructive" });
      return;
    }
    if (serviceEntries.length === 0) {
      toast({ title: "Info", description: "No service entries to save." });
      return;
    }

    let allValid = true;
    for (const entry of serviceEntries) {
      if (!entry.serviceType.trim()) {
        allValid = false;
        toast({ title: "Validation Error", description: `Service type is required for all entries.`, variant: "destructive" });
        break;
      }
      if (entry.paymentAmount <= 0) {
        allValid = false;
        toast({ title: "Validation Error", description: `Payment amount must be positive for all entries.`, variant: "destructive" });
        break;
      }
      if (!entry.paymentAcceptedBy) {
         allValid = false;
        toast({ title: "Validation Error", description: `Payment accepted by is required for all entries.`, variant: "destructive" });
        break;
      }
    }

    if (!allValid) return;

    try {
      setIsLoading(true);
      for (const entry of serviceEntries) {
        const serviceWithDetails: Service = {
          employeeName: selectedEmployeeName,
          serviceDate: selectedServiceDate,
          serviceType: entry.serviceType,
          paymentAmount: Number(entry.paymentAmount),
          paymentMode: entry.paymentMode,
          paymentAcceptedBy: entry.paymentAcceptedBy,
          createdAt: serverTimestamp() as Timestamp,
          userId: user.uid,
        };
        await addDoc(collection(db, "services"), serviceWithDetails);
      }
      toast({ title: "Success", description: `${serviceEntries.length} service(s) added for ${selectedEmployeeName} on ${format(selectedServiceDate, "PPP")}.` });
      setServiceEntries([]);
      // Optionally reset employee name and date here if desired
      // setSelectedEmployeeName("");
      // setSelectedServiceDate(undefined);
    } catch (error) {
      console.error("Error adding services:", error);
      toast({ title: "Error", description: "Failed to add service records.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const canAddOrSave = selectedEmployeeName.trim() !== "" && selectedServiceDate !== undefined;

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading user authentication...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 font-body">
      

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
            <PlusCircle className="h-7 w-7 text-accent" />
            Add Multiple Service Entries
          </CardTitle>
          <CardDescription>Select an employee and date, then add service details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="employeeName" className="block text-sm font-medium text-foreground mb-1">Employee Name</label>
              <Input
                id="employeeName"
                placeholder="Enter employee name"
                value={selectedEmployeeName}
                onChange={(e) => setSelectedEmployeeName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="serviceDate" className="block text-sm font-medium text-foreground mb-1">Service Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    id="serviceDate"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedServiceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedServiceDate ? format(selectedServiceDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedServiceDate}
                    onSelect={setSelectedServiceDate}
                    initialFocus
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {canAddOrSave && (
            <Button onClick={handleAddServiceEntry} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Another Service
            </Button>
          )}

          {serviceEntries.length > 0 && (
            <div className="space-y-4 mt-4">
              {serviceEntries.map((entry, index) => (
                <ServiceEntryItem
                  key={entry.id}
                  entry={entry}
                  onChange={handleServiceEntryChange}
                  onRemove={handleRemoveServiceEntry}
                  entryIndex={index}
                />
              ))}
            </div>
          )}

          {serviceEntries.length > 0 && canAddOrSave && (
            <div className="flex justify-end mt-6">
              <Button onClick={handleSaveAllServices} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : `Save All ${serviceEntries.length} Service(s)`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline">My Service Records</CardTitle>
            <CardDescription>View and manage your recorded services.</CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && services.length === 0 ? (
            <p className="text-center py-8">Loading service records...</p>
          ) : (
            <ServiceTable
              services={services}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Edit Service Record</DialogTitle>
            <DialogDescription>
              Update the details for this service record. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          {currentService && (
            <ServiceForm
              onSubmit={handleUpdateService}
              initialData={{
                ...currentService,
                serviceDate: currentService.serviceDate instanceof Date ? currentService.serviceDate : undefined,
              }}
              isEditing={true}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
