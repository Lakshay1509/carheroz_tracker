# **App Name**: Service Tracker

## Core Features:

- Service Entry Form: Interactive form to input service details like employee name, customer details, service type, and payment information.
- Service Data Table: Table view to display submitted service records, grouped by date, with key information such as employee, customer, and service details.
- CSV Export: Downloadable CSV export of the service data for offline analysis and record-keeping.
- Create Service Record: Functionality to add new service records to the database upon form submission.
- Read Service Data: Real-time reading of service data from Firebase Firestore to display in the table view.
- Update Service Record: Ability to edit existing service records with an edit icon/button in each row, triggering an edit modal.
- Delete Service Record: Option to delete service records with a confirmation dialog for data integrity.
- Firebase Integration: Integration with Firebase Firestore for data storage and retrieval.

## Style Guidelines:

- Primary color: Soft blue (#A0C4FF) to convey trustworthiness and efficiency in service management.
- Background color: Light grey (#F0F4F8) to provide a clean and unobtrusive backdrop.
- Accent color: Warm orange (#FFAD60) for interactive elements, indicating action and focus.
- Body and headline font: 'PT Sans', sans-serif, combines a modern look and a little warmth; suitable for both headlines and body text.
- Use minimalist, clear icons for actions (edit, delete, download) to ensure usability.
- Utilize Tailwind's grid or flex utilities for a responsive layout, ensuring a seamless experience across devices.
- Subtle animations on interactions (e.g., row highlighting on hover, confirmation dialog slide-in) to provide visual feedback.