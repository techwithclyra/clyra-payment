// Hand-authored to match supabase/migrations/*.sql exactly, in the shape the Supabase CLI's
// generated types use (including `Relationships`, required by @supabase/postgrest-js's
// select-query type parser). Once the Supabase project is linked, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > src/lib/db/types.ts
// and this file becomes the source of truth again automatically.

export type UserRole = "admin" | "student";

export type InstallmentStatus =
  | "locked"
  | "pending"
  | "pending_verification"
  | "paid"
  | "overdue"
  | "rejected";

export type PaymentVerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "reupload_requested";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          student_code: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          course: string;
          batch: string;
          joining_date: string;
          original_fee: number;
          scholarship: number;
          final_fee: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_code?: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          course: string;
          batch: string;
          joining_date?: string;
          original_fee: number;
          scholarship?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          student_code: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          course: string;
          batch: string;
          joining_date: string;
          original_fee: number;
          scholarship: number;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      installments: {
        Row: {
          id: string;
          student_id: string;
          installment_name: string;
          amount: number;
          due_date: string;
          sequence_no: number;
          status: InstallmentStatus;
          current_payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          installment_name: string;
          amount: number;
          due_date: string;
          sequence_no: number;
          status?: InstallmentStatus;
          current_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          student_id: string;
          installment_name: string;
          amount: number;
          due_date: string;
          sequence_no: number;
          status: InstallmentStatus;
          current_payment_id: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "installments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_installments_current_payment";
            columns: ["current_payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          student_id: string;
          installment_id: string;
          amount: number;
          screenshot_path: string | null;
          transaction_id: string | null;
          note: string | null;
          verification_status: PaymentVerificationStatus;
          verified_by: string | null;
          verified_at: string | null;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          installment_id: string;
          amount: number;
          screenshot_path?: string | null;
          transaction_id?: string | null;
          note?: string | null;
          verification_status?: PaymentVerificationStatus;
          verified_by?: string | null;
          verified_at?: string | null;
          remarks?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          student_id: string;
          installment_id: string;
          amount: number;
          screenshot_path: string | null;
          transaction_id: string | null;
          note: string | null;
          verification_status: PaymentVerificationStatus;
          verified_by: string | null;
          verified_at: string | null;
          remarks: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_installment_id_fkey";
            columns: ["installment_id"];
            isOneToOne: false;
            referencedRelation: "installments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      installments_with_effective_status: {
        Row: {
          id: string;
          student_id: string;
          installment_name: string;
          amount: number;
          due_date: string;
          sequence_no: number;
          status: InstallmentStatus;
          current_payment_id: string | null;
          created_at: string;
          updated_at: string;
          is_overdue: boolean;
          effective_status: InstallmentStatus;
        };
        Relationships: [
          {
            foreignKeyName: "installments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      owns_student_row: {
        Args: { p_student_id: string };
        Returns: boolean;
      };
      is_installment_overdue: {
        Args: { p_status: InstallmentStatus; p_due_date: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      installment_status: InstallmentStatus;
      payment_verification_status: PaymentVerificationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
