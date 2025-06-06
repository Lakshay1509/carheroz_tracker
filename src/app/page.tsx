
"use client";

import type * as React from 'react';
import { useState, useEffect, useCallback } from "react";
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
} from "firebase/firestore";
import { Download, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import type { Service, ServiceFormData, ServiceWithId } from "@/types";
import { ServiceForm } from "@/components/ServiceForm";
import { ServiceTable } from "@/components/ServiceTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function ServiceTrackerPage() {
  const [services, setServices] = useState<ServiceWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceWithId | null>(null);
  const [serviceToDeleteId, setServiceToDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const servicesCollection = collection(db, "services");
    const q = query(servicesCollection, orderBy("serviceDate", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const servicesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            serviceDate: (data.serviceDate as Timestamp).toDate(), // Convert Firestore Timestamp to Date
            createdAt: data.createdAt as Timestamp,
          } as ServiceWithId; // ServiceWithId type is updated, will expect paymentMode
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
  }, [toast]);

  const handleAddService = async (data: ServiceFormData) => { // ServiceFormData type is updated
    try {
      const serviceWithTimestamp: Service = { // Service type is updated
        ...data, // data now contains paymentMode instead of paymentStatus
        serviceDate: data.serviceDate!, 
        createdAt: serverTimestamp() as Timestamp,
      };
      await addDoc(collection(db, "services"), serviceWithTimestamp);
      toast({ title: "Success", description: "Service record added." });
    } catch (error) {
      console.error("Error adding service:", error);
      toast({ title: "Error", description: "Failed to add service record.", variant: "destructive" });
    }
  };

  const handleUpdateService = async (data: ServiceFormData) => { // ServiceFormData type is updated
    if (!currentService) return;
    try {
      const serviceDocRef = doc(db, "services", currentService.id);
      const updatedService: Partial<Service> = { // Service type is updated
        ...data, // data now contains paymentMode
        serviceDate: data.serviceDate!,
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
    if (!serviceToDeleteId) return;
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

  const openEditDialog = (service: ServiceWithId) => { // ServiceWithId type is updated
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
    // Updated headers and data access for paymentMode
    const headers = ["Employee Name", "Customer Name", "Customer Email", "Service Type", "Service Date", "Payment Amount", "Payment Mode"];
    const csvRows = [
      headers.join(','),
      ...services.map(s => [
        `"${s.employeeName.replace(/"/g, '""')}"`,
        `"${s.customerName.replace(/"/g, '""')}"`,
        `"${s.customerEmail.replace(/"/g, '""')}"`,
        `"${s.serviceType.replace(/"/g, '""')}"`,
        s.serviceDate.toISOString().split('T')[0], 
        s.paymentAmount,
        s.paymentMode // Changed from s.paymentStatus
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

  return (
    <div className="container mx-auto p-4 md:p-8 font-body">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold text-primary-foreground">Service Tracker</h1>
        <p className="text-muted-foreground">Manage and track your service records efficiently.</p>
      </header>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
            <PlusCircle className="h-7 w-7 text-accent" />
            Add New Service Record
          </CardTitle>
          <CardDescription>Fill in the details below to create a new service entry.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm onSubmit={handleAddService} />
        </CardContent>
      </Card>
      
      <Separator className="my-8" />

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline">Service Records</CardTitle>
            <CardDescription>View and manage all recorded services.</CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="ml-auto">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Edit Service Record</DialogTitle>
            <DialogDescription>
              Update the details for this service record. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {currentService && ( // currentService is ServiceWithId, which now has paymentMode
            <ServiceForm
              onSubmit={handleUpdateService}
              initialData={{ // initialData is ServiceFormData, which now expects paymentMode
                ...currentService,
                serviceDate: currentService.serviceDate, 
              }}
              isEditing={true}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
