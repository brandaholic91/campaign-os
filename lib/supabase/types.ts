// Stub type for Database - should be generated from Supabase schema
// This is a minimal stub to allow builds to succeed

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  campaign_os: {
    Tables: {
      campaigns: {
        Row: any
        Insert: any
        Update: any
      }
      goals: {
        Row: any
        Insert: any
        Update: any
      }
      segments: {
        Row: any
        Insert: any
        Update: any
      }
      topics: {
        Row: any
        Insert: any
        Update: any
      }
      narratives: {
        Row: any
        Insert: any
        Update: any
      }
      segment_topic_matrix: {
        Row: any
        Insert: any
        Update: any
      }
      messages: {
        Row: any
        Insert: any
        Update: any
      }
      message_strategies: {
        Row: any
        Insert: any
        Update: any
      }
    }
  }
}
