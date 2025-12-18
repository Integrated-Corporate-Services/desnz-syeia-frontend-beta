// User-related type definitions
export interface User {
  id: string;
  fullName: string;
  email: string;
  organisation: string;
  role: string;
  status: string;
  lastLogin: string | null;
  createdAt?: string;
  phone?: string;
  location?: string;
}

export interface CreateUserData {
  fullName: string;
  email: string;
  organisation: string;
  applicantType: string;
  sendWelcomeEmail: boolean;
  accessReason: string;
  phone?: string;
  location?: string;
  status: string;
  createdBy: string;
  submittedAt: string;
  welcomeEmailSent: boolean;
}

export interface UserCreatedData {
  userName: string;
  userEmail: string;
  organisation: string;
  welcomeEmailSent: boolean;
}
