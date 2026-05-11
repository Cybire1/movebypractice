/**
 * Database TypeScript Types
 * Generated from Supabase schema
 * Run: npx supabase gen types typescript --local > app/lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          wallet_address: string | null
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          wallet_address?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          wallet_address?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          xp: number
          level: number
          streak: number
          last_active_date: string | null
          total_lessons_completed: number
          total_time_spent_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          xp?: number
          level?: number
          streak?: number
          last_active_date?: string | null
          total_lessons_completed?: number
          total_time_spent_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          xp?: number
          level?: number
          streak?: number
          last_active_date?: string | null
          total_lessons_completed?: number
          total_time_spent_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          time_spent_minutes: number
          attempts: number
          code_submitted: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          time_spent_minutes?: number
          attempts?: number
          code_submitted?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          time_spent_minutes?: number
          attempts?: number
          code_submitted?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          created_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          metadata: Json | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          metadata?: Json | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          metadata?: Json | null
          timestamp?: string
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          instructor_id: string
          title: string
          description: string | null
          scheduled_at: string
          duration_minutes: number
          max_students: number
          price: number
          status: 'scheduled' | 'live' | 'completed' | 'cancelled'
          room_url: string | null
          recording_url: string | null
          livekit_room_name: string | null
          livekit_metadata: Json | null
          chat_enabled: boolean
          qa_enabled: boolean
          donations_enabled: boolean
          participant_count: number
          started_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          title: string
          description?: string | null
          scheduled_at: string
          duration_minutes?: number
          max_students?: number
          price?: number
          status?: 'scheduled' | 'live' | 'completed' | 'cancelled'
          room_url?: string | null
          recording_url?: string | null
          livekit_room_name?: string | null
          livekit_metadata?: Json | null
          chat_enabled?: boolean
          qa_enabled?: boolean
          donations_enabled?: boolean
          participant_count?: number
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          title?: string
          description?: string | null
          scheduled_at?: string
          duration_minutes?: number
          max_students?: number
          price?: number
          status?: 'scheduled' | 'live' | 'completed' | 'cancelled'
          room_url?: string | null
          recording_url?: string | null
          livekit_room_name?: string | null
          livekit_metadata?: Json | null
          chat_enabled?: boolean
          qa_enabled?: boolean
          donations_enabled?: boolean
          participant_count?: number
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      class_bookings: {
        Row: {
          id: string
          user_id: string
          class_id: string
          status: 'booked' | 'attended' | 'cancelled'
          booked_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          class_id: string
          status?: 'booked' | 'attended' | 'cancelled'
          booked_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          class_id?: string
          status?: 'booked' | 'attended' | 'cancelled'
          booked_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      class_messages: {
        Row: {
          id: string
          class_id: string
          user_id: string
          message_type: 'chat' | 'question' | 'answer'
          content: string
          parent_id: string | null
          is_instructor_reply: boolean
          upvotes: number
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          user_id: string
          message_type: 'chat' | 'question' | 'answer'
          content: string
          parent_id?: string | null
          is_instructor_reply?: boolean
          upvotes?: number
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          user_id?: string
          message_type?: 'chat' | 'question' | 'answer'
          content?: string
          parent_id?: string | null
          is_instructor_reply?: boolean
          upvotes?: number
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      class_donations: {
        Row: {
          id: string
          class_id: string
          donor_id: string | null
          donor_wallet_address: string
          recipient_wallet_address: string
          amount_sui: number
          transaction_digest: string
          message: string | null
          status: 'pending' | 'confirmed' | 'failed'
          created_at: string
          confirmed_at: string | null
        }
        Insert: {
          id?: string
          class_id: string
          donor_id?: string | null
          donor_wallet_address: string
          recipient_wallet_address: string
          amount_sui: number
          transaction_digest: string
          message?: string | null
          status?: 'pending' | 'confirmed' | 'failed'
          created_at?: string
          confirmed_at?: string | null
        }
        Update: {
          id?: string
          class_id?: string
          donor_id?: string | null
          donor_wallet_address?: string
          recipient_wallet_address?: string
          amount_sui?: number
          transaction_digest?: string
          message?: string | null
          status?: 'pending' | 'confirmed' | 'failed'
          created_at?: string
          confirmed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
