import { supabase } from '../config/supabase';
import { Jar, CreateJarRequest, UpdateJarRequest, JarWithContributions } from '../types/jar';
import { Contribution } from '../types/contribution';

export class JarService {
  /**
   * Create a new jar for a user
   */
  static async createJar(userId: string, jarData: CreateJarRequest): Promise<Jar> {
    console.log('JarService.createJar - userId:', userId);
    console.log('JarService.createJar - jarData:', JSON.stringify(jarData, null, 2));
    
    // Normalize currency - handle common variations
    let currency = jarData.currency || 'KSH';
    if (currency === 'KES') {
      currency = 'KSH'; // KES is the same as KSH for Kenyan Shilling
    }
    
    console.log('JarService.createJar - currency normalized:', currency);
    
    const insertData = {
      user_id: userId,
      title: jarData.title,
      description: jarData.description || null,
      target_amount: jarData.target_amount,
      current_amount: 0,
      currency: currency,
      is_public: jarData.is_public || false,
      is_active: true,
      deadline: jarData.deadline || null,
      category: jarData.category || null,
      image_url: jarData.image_url || null
    };

    console.log('JarService.createJar - insertData:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase
      .from('jars')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('JarService.createJar - Supabase error:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to create jar: ${error.message} (Code: ${error.code})`);
    }

    console.log('JarService.createJar - success, created jar:', data?.id);
    return data as Jar;
  }

  /**
   * Get all jars for a specific user
   */
  static async getUserJars(userId: string): Promise<Jar[]> {
    const { data, error } = await supabase
      .from('jars')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user jars: ${error.message}`);
    }

    return data as Jar[];
  }

  /**
   * Get a single jar by ID with contributions
   */
  static async getJarById(jarId: string): Promise<JarWithContributions | null> {
    // First get the jar
    const { data: jar, error: jarError } = await supabase
      .from('jars')
      .select('*')
      .eq('id', jarId)
      .single();

    if (jarError || !jar) {
      return null;
    }

    // Then get contributions for this jar
    const { data: contributions, error: contributionsError } = await supabase
      .from('contributions')
      .select('*')
      .eq('jar_id', jarId)
      .order('created_at', { ascending: false });

    if (contributionsError) {
      throw new Error(`Failed to fetch contributions: ${contributionsError.message}`);
    }

    return {
      ...jar as Jar,
      contributions: contributions as Contribution[]
    };
  }

  /**
   * Update a jar
   */
  static async updateJar(jarId: string, userId: string, updateData: UpdateJarRequest): Promise<Jar> {
    const { data, error } = await supabase
      .from('jars')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', jarId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update jar: ${error.message}`);
    }

    if (!data) {
      throw new Error('Jar not found or you do not have permission to update it');
    }

    return data as Jar;
  }

  /**
   * Delete a jar
   */
  static async deleteJar(jarId: string, userId: string): Promise<void> {
    // First delete all contributions
    const { error: contributionsError } = await supabase
      .from('contributions')
      .delete()
      .eq('jar_id', jarId);

    if (contributionsError) {
      throw new Error(`Failed to delete contributions: ${contributionsError.message}`);
    }

    // Then delete the jar
    const { error } = await supabase
      .from('jars')
      .delete()
      .eq('id', jarId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete jar: ${error.message}`);
    }
  }

  /**
   * Add contribution to a jar
   */
  static async addContribution(jarId: string, contributionData: {
    contributor_name?: string;
    contributor_email?: string;
    amount: number;
    currency?: string;
    message?: string;
    is_anonymous?: boolean;
  }): Promise<Contribution> {
    // Start a transaction-like operation
    // First, add the contribution
    const { data: contribution, error: contributionError } = await supabase
      .from('contributions')
      .insert({
        jar_id: jarId,
        contributor_name: contributionData.contributor_name || null,
        contributor_email: contributionData.contributor_email || null,
        amount: contributionData.amount,
        currency: contributionData.currency || 'USD',
        payment_status: 'succeeded',
        message: contributionData.message || null,
        is_anonymous: contributionData.is_anonymous || false
      })
      .select()
      .single();

    if (contributionError) {
      throw new Error(`Failed to add contribution: ${contributionError.message}`);
    }

    // Then update the jar's current_amount
    const { error: updateError } = await supabase.rpc('increment_jar_amount', {
      jar_id: jarId,
      amount: contributionData.amount
    });

    if (updateError) {
      // If updating the jar fails, we should rollback the contribution
      await supabase
        .from('contributions')
        .delete()
        .eq('id', contribution.id);
      
      throw new Error(`Failed to update jar amount: ${updateError.message}`);
    }

    return contribution as Contribution;
  }

  /**
   * Get public jar (for non-authenticated users to view and contribute)
   */
  static async getPublicJar(jarId: string): Promise<JarWithContributions | null> {
    const { data, error } = await supabase
      .from('jars')
      .select(`
        *,
        contributions (*)
      `)
      .eq('id', jarId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      ...data as Jar,
      contributions: data.contributions as Contribution[]
    };
  }
}

