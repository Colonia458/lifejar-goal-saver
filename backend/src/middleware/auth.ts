import { Request, Response, NextFunction } from 'express';
import { supabaseAuth } from '../config/supabase';
import { unauthorized, serverError } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    user_metadata?: any;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      unauthorized(res, 'Missing or invalid authorization header');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      unauthorized(res, 'Invalid or expired token');
      return;
    }

    // Attach user information to the request
    req.user = {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    serverError(res, 'Authentication failed');
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      };
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

