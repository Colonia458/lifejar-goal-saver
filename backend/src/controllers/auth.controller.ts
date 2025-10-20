import { Request, Response } from 'express';
import { supabaseAuth } from '../config/supabase';
import { LoginRequest, SignupRequest } from '../types/auth';
import { success, badRequest, serverError } from '../utils/response';

export class AuthController {
  /**
   * User login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validate required fields
      if (!email || !password) {
        badRequest(res, 'Email and password are required');
        return;
      }

      // Attempt login with Supabase
      const { data, error: authError } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Login error:', authError);
        badRequest(res, 'Invalid email or password');
        return;
      }

      if (!data.user || !data.session) {
        badRequest(res, 'Login failed - no session created');
        return;
      }

      // Return user data and tokens
      const response = {
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata
        },
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      };

      success(res, response, 'Login successful');
    } catch (err) {
      console.error('Login error:', err);
      serverError(res, 'Login failed');
    }
  }

  /**
   * User signup
   */
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName }: SignupRequest = req.body;

      // Validate required fields
      if (!email || !password) {
        badRequest(res, 'Email and password are required');
        return;
      }

      // Prepare user metadata
      const userMetadata: any = {};
      if (firstName) userMetadata.first_name = firstName;
      if (lastName) userMetadata.last_name = lastName;

      // Attempt signup with Supabase
      const { data, error: authError } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata
        }
      });

      if (authError) {
        console.error('Signup error:', authError);
        badRequest(res, authError.message);
        return;
      }

      if (!data.user) {
        badRequest(res, 'Signup failed - user not created');
        return;
      }

      // Check if email confirmation is required
      if (!data.session) {
        success(res, {
          user: {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata
          },
          message: 'Please check your email to confirm your account'
        }, 'Signup successful - please confirm your email');
        return;
      }

      // Return user data and tokens if session is available
      const response = {
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata
        },
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      };

      success(res, response, 'Signup successful');
    } catch (err) {
      console.error('Signup error:', err);
      serverError(res, 'Signup failed');
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        badRequest(res, 'Missing or invalid authorization header');
        return;
      }

      const token = authHeader.substring(7);

      const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

      if (error || !user) {
        badRequest(res, 'Invalid token');
        return;
      }

      const response = {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      success(res, response, 'Profile retrieved successfully');
    } catch (err) {
      console.error('Get profile error:', err);
      serverError(res, 'Failed to get profile');
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Sign out the user
        const { error } = await supabaseAuth.auth.signOut();

        if (error) {
          console.error('Logout error:', error);
        }
      }

      success(res, null, 'Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      serverError(res, 'Logout failed');
    }
  }
}
