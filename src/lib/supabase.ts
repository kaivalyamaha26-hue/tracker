import { createClient } from '@supabase/supabase-js';
import { Patient } from '../types';

export const SUPABASE_PROJECT_ID = 'psnbiesvvwbbemsjksly';
export const SUPABASE_URL = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://psnbiesvvwbbemsjksly.supabase.co';
export const SUPABASE_ANON_KEY = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kVuHItuA-LYouLtYKHGz2A_xBkYcw1a';


// Create and export singleton Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export interface SupabaseHealth {
  connected: boolean;
  latencyMs: number;
  projectId: string;
  url: string;
  table: string;
  recordsCount?: number;
  error?: string | null;
  lastChecked: string;
}

/**
 * Health check to verify real-time connectivity to Supabase
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const startTime = Date.now();
  try {
    const { data, count, error } = await supabase
      .from('patients')
      .select('id', { count: 'exact', head: false })
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      return {
        connected: false,
        latencyMs,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        table: 'patients',
        error: error.message,
        lastChecked: new Date().toLocaleTimeString()
      };
    }

    return {
      connected: true,
      latencyMs,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      table: 'patients',
      recordsCount: count ?? (data ? data.length : 0),
      error: null,
      lastChecked: new Date().toLocaleTimeString()
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      table: 'patients',
      error: err.message || 'Network error connecting to Supabase',
      lastChecked: new Date().toLocaleTimeString()
    };
  }
}

/**
 * Fetch all patients ordered by created_at desc
 */
export async function fetchPatientsFromSupabase(): Promise<{ data: Patient[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }
    return { data: (data as Patient[]) || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || 'Error fetching patients from Supabase' };
  }
}

/**
 * Insert a new patient into Supabase
 */
export async function insertPatientToSupabase(patient: Partial<Patient>): Promise<{ data: Patient | null; error: string | null }> {
  try {
    // Clean and validate payload
    const payload = {
      full_name: (patient.full_name || '').trim(),
      email: (patient.email || '').trim().toLowerCase(),
      phone: patient.phone || null,
      dob: patient.dob || null,
      gender: patient.gender || 'Not Specified',
      height_cm: patient.height_cm ? Number(patient.height_cm) : null,
      weight_kg: patient.weight_kg ? Number(patient.weight_kg) : null,
      blood_group: patient.blood_group || null,
      medical_conditions: patient.medical_conditions || null,
      allergies: patient.allergies || null,
      fitness_goal: patient.fitness_goal || 'General Fitness',
      experience_level: patient.experience_level || 'Beginner',
      available_days: patient.available_days ? Number(patient.available_days) : 4,
      equipment_access: patient.equipment_access || 'Gym',
      emergency_contact_name: patient.emergency_contact_name || null,
      emergency_contact_phone: patient.emergency_contact_phone || null,
      notes: patient.notes || null
    };

    const { data, error } = await supabase
      .from('patients')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Patient, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error creating patient in Supabase' };
  }
}

/**
 * Update an existing patient in Supabase
 */
export async function updatePatientInSupabase(id: string, updates: Partial<Patient>): Promise<{ data: Patient | null; error: string | null }> {
  try {
    const { id: _, created_at: __, ...cleanUpdates } = updates as any;
    cleanUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('patients')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }
    return { data: data as Patient, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error updating patient in Supabase' };
  }
}

/**
 * Delete a patient from Supabase
 */
export async function deletePatientFromSupabase(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error deleting patient from Supabase' };
  }
}
