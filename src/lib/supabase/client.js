import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

/**
 * Reusable Supabase client for client-side operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to handle Supabase errors in a consistent way
 * @param {object} error - The error object from Supabase
 * @returns {string} - A user-friendly error message
 */
export const handleSupabaseError = (error) => {
  if (!error) return null;
  console.error('Supabase Error:', error.message, error.details);
  
  // Custom mapping for common error codes
  const errorMap = {
    '23505': 'This record already exists.',
    '42501': 'You do not have permission to perform this action.',
    '23503': 'This operation violates a relationship constraint.',
  };

  return errorMap[error.code] || error.message || 'An unexpected database error occurred.';
};

/**
 * Common database helper methods for the Tuition Management System
 */
export const supabaseHelpers = {
  /**
   * Fetch a single row by ID
   */
  async getById(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(handleSupabaseError(error));
    return data;
  },

  /**
   * Fetch all rows from a table with optional filtering
   */
  async getAll(table, { filter = {}, orderBy = 'created_at', ascending = false } = {}) {
    let query = supabase.from(table).select('*');

    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.order(orderBy, { ascending });
    
    if (error) throw new Error(handleSupabaseError(error));
    return data;
  },

  /**
   * Insert a new record
   */
  async insert(table, payload) {
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single();
    
    if (error) throw new Error(handleSupabaseError(error));
    return data;
  },

  /**
   * Update an existing record
   */
  async update(table, id, payload) {
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(handleSupabaseError(error));
    return data;
  },

  /**
   * Soft delete (if deleted_at column exists) or hard delete
   */
  async delete(table, id, { soft = true } = {}) {
    let query;
    if (soft) {
      query = supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id);
    } else {
      query = supabase.from(table).delete().eq('id', id);
    }

    const { error } = await query;
    if (error) throw new Error(handleSupabaseError(error));
    return true;
  }
};
