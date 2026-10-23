import {
  UserProfile,
  InternshipApplication,
  PlatformStats,
  OfferLetterTemplate,
  AdminPayment,
  AdminUser,
} from '@/lib/types';

export const adminUser: AdminUser = {
  name: 'InternJourneys Admin',
  initials: 'AD',
  email: 'admin@careerai.in',
  role: 'Super Administrator',
  password: 'admin123',
};

export const adminStats: PlatformStats = {
  totalStudents: 1284,
  activeInterns: 412,
  completedInterns: 768,
  pendingApplications: 27,
  totalApplications: 356,
  totalRevenue: 384600,
  pendingRevenue: 27100,
  completedPayments: 3575,
  pendingPayments: 271,
  issuedCertificates: 641,
};

export const adminApplications: InternshipApplication[] = [
  { id: 'app-101', studentName: 'Priya Sharma', studentInitials: 'PS', email: 'priya@example.com', domain: 'Frontend Development', appliedOn: '22 Aug 2026', status: 'Pending' },
  { id: 'app-102', studentName: 'Anand Kumar', studentInitials: 'AK', email: 'anand@example.com', domain: 'AI & Machine Learning', appliedOn: '23 Aug 2026', status: 'In Review' },
  { id: 'app-103', studentName: 'Rahul Verma', studentInitials: 'RV', email: 'rahul@example.com', domain: 'Backend Development', appliedOn: '24 Aug 2026', status: 'Pending' },
  { id: 'app-104', studentName: 'Sneha Reddy', studentInitials: 'SR', email: 'sneha@example.com', domain: 'Data Science', appliedOn: '25 Aug 2026', status: 'Approved' },
  { id: 'app-105', studentName: 'Manoj Pillai', studentInitials: 'MP', email: 'manoj@example.com', domain: 'Cyber Security', appliedOn: '25 Aug 2026', status: 'Rejected' },
  { id: 'app-106', studentName: 'Kavya Nair', studentInitials: 'KN', email: 'kavya@example.com', domain: 'UI/UX Design', appliedOn: '26 Aug 2026', status: 'Pending' },
  { id: 'app-107', studentName: 'Arjun Mehta', studentInitials: 'AM', email: 'arjun@example.com', domain: 'Full Stack Development', appliedOn: '26 Aug 2026', status: 'In Review' },
  { id: 'app-108', studentName: 'Divya Rao', studentInitials: 'DR', email: 'divya@example.com', domain: 'Digital Marketing', appliedOn: '27 Aug 2026', status: 'Pending' },
  { id: 'app-109', studentName: 'Vikram Singh', studentInitials: 'VS', email: 'vikram@example.com', domain: 'Cloud & DevOps', appliedOn: '27 Aug 2026', status: 'Approved' },
  { id: 'app-110', studentName: 'Meera Iyer', studentInitials: 'MI', email: 'meera@example.com', domain: 'Python Development', appliedOn: '28 Aug 2026', status: 'Pending' },
];

export const adminStudents: UserProfile[] = [
  { name: 'Hari Narayan S', initials: 'HN', internId: 'CAI45872', domain: 'Full Stack Development', joinedOn: '12 Aug 2026', status: 'Active', totalInternships: 1, completedInternships: 1, email: 'hari@example.com', phone: '+91 98765 43210', college: 'Indian Institute of Technology', graduationYear: '2026' },
  { name: 'Priya Sharma', initials: 'PS', internId: 'CAI45873', domain: 'Frontend Development', joinedOn: '12 Aug 2026', status: 'Active', totalInternships: 1, completedInternships: 0, email: 'priya@example.com', phone: '+91 98765 43211', college: 'Delhi Technological University', graduationYear: '2026' },
  { name: 'Anand Kumar', initials: 'AK', internId: 'CAI45874', domain: 'AI & Machine Learning', joinedOn: '13 Aug 2026', status: 'Active', totalInternships: 1, completedInternships: 0, email: 'anand@example.com', phone: '+91 98765 43212', college: 'VIT Vellore', graduationYear: '2025' },
  { name: 'Sneha Reddy', initials: 'SR', internId: 'CAI45875', domain: 'Data Science', joinedOn: '10 Aug 2026', status: 'Completed', totalInternships: 1, completedInternships: 1, email: 'sneha@example.com', phone: '+91 98765 43213', college: 'Anna University', graduationYear: '2026' },
  { name: 'Rahul Verma', initials: 'RV', internId: 'CAI45876', domain: 'Backend Development', joinedOn: '14 Aug 2026', status: 'Active', totalInternships: 1, completedInternships: 0, email: 'rahul@example.com', phone: '+91 98765 43214', college: 'BITS Pilani', graduationYear: '2027' },
  { name: 'Kavya Nair', initials: 'KN', internId: 'CAI45877', domain: 'UI/UX Design', joinedOn: '15 Aug 2026', status: 'Inactive', totalInternships: 1, completedInternships: 0, email: 'kavya@example.com', phone: '+91 98765 43215', college: 'NID Ahmedabad', graduationYear: '2026' },
  { name: 'Manoj Pillai', initials: 'MP', internId: 'CAI45878', domain: 'Cyber Security', joinedOn: '09 Aug 2026', status: 'Completed', totalInternships: 1, completedInternships: 1, email: 'manoj@example.com', phone: '+91 98765 43216', college: 'NIT Trichy', graduationYear: '2025' },
];

export const offerLetterTemplates: OfferLetterTemplate[] = [
  { id: 'ol-1', name: 'Standard Full Stack Offer Letter', status: 'Active', updatedAt: '18 Aug 2026' },
  { id: 'ol-2', name: 'AI & ML Program Offer Letter', status: 'Active', updatedAt: '18 Aug 2026' },
  { id: 'ol-3', name: 'Internship Completion Certificate', status: 'Active', updatedAt: '20 Aug 2026' },
  { id: 'ol-4', name: 'Appreciation Letter Template', status: 'Draft', updatedAt: '22 Aug 2026' },
];

export const adminPayments: AdminPayment[] = [
  { id: 'pay-201', studentName: 'Hari Narayan S', internId: 'CAI45872', purpose: 'Certificate fee', amount: 199, currency: 'INR', status: 'Completed', date: '26 Aug 2026', transactionId: 'TXN-88231' },
  { id: 'pay-202', studentName: 'Sneha Reddy', internId: 'CAI45875', purpose: 'Certificate fee', amount: 199, currency: 'INR', status: 'Completed', date: '25 Aug 2026', transactionId: 'TXN-88197' },
  { id: 'pay-203', studentName: 'Priya Sharma', internId: 'CAI45873', purpose: 'Certificate fee', amount: 199, currency: 'INR', status: 'Pending', date: '24 Aug 2026' },
  { id: 'pay-204', studentName: 'Anand Kumar', internId: 'CAI45874', purpose: 'Certificate fee', amount: 199, currency: 'INR', status: 'Failed', date: '23 Aug 2026', transactionId: 'TXN-88045' },
  { id: 'pay-205', studentName: 'Rahul Verma', internId: 'CAI45876', purpose: 'Certificate fee', amount: 199, currency: 'INR', status: 'Completed', date: '22 Aug 2026', transactionId: 'TXN-87966' },
  { id: 'pay-206', studentName: 'Manoj Pillai', internId: 'CAI45878', purpose: 'Certificate fee', amount: 199, currency: 'INR', status: 'Refunded', date: '20 Aug 2026', transactionId: 'TXN-87720' },
];
