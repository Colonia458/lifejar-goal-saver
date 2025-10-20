import { Request, Response } from 'express';
import { JarService } from '../services/jar.service';
import { CreateJarRequest, UpdateJarRequest } from '../types/jar';
import { success, serverError, notFound, badRequest } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export class JarController {
  /**
   * Create a new jar
   */
  static async createJar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const jarData: CreateJarRequest = req.body;

      // Validate required fields
      if (!jarData.title || !jarData.target_amount) {
        badRequest(res, 'Title and target amount are required');
        return;
      }

      if (jarData.target_amount <= 0) {
        badRequest(res, 'Target amount must be greater than 0');
        return;
      }

      const jar = await JarService.createJar(userId, jarData);
      success(res, jar, 'Jar created successfully', 201);
    } catch (err) {
      console.error('Create jar error:', err);
      serverError(res, 'Failed to create jar');
    }
  }

  /**
   * Get all jars for the authenticated user
   */
  static async getUserJars(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const jars = await JarService.getUserJars(userId);
      success(res, jars, 'Jars retrieved successfully');
    } catch (err) {
      console.error('Get user jars error:', err);
      serverError(res, 'Failed to retrieve jars');
    }
  }

  /**
   * Get a single jar by ID
   */
  static async getJarById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!id) {
        badRequest(res, 'Jar ID is required');
        return;
      }

      const jar = await JarService.getJarById(id);
      
      if (!jar) {
        notFound(res, 'Jar not found');
        return;
      }

      // Check if the jar belongs to the user
      if (jar.user_id !== userId) {
        notFound(res, 'Jar not found');
        return;
      }

      success(res, jar, 'Jar retrieved successfully');
    } catch (err) {
      console.error('Get jar error:', err);
      serverError(res, 'Failed to retrieve jar');
    }
  }

  /**
   * Update a jar
   */
  static async updateJar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updateData: UpdateJarRequest = req.body;

      if (!id) {
        badRequest(res, 'Jar ID is required');
        return;
      }

      if (updateData.target_amount && updateData.target_amount <= 0) {
        badRequest(res, 'Target amount must be greater than 0');
        return;
      }

      const jar = await JarService.updateJar(id, userId, updateData);
      success(res, jar, 'Jar updated successfully');
    } catch (err) {
      console.error('Update jar error:', err);
      if (err instanceof Error && err.message.includes('not found')) {
        notFound(res, 'Jar not found or you do not have permission to update it');
      } else {
        serverError(res, 'Failed to update jar');
      }
    }
  }

  /**
   * Delete a jar
   */
  static async deleteJar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!id) {
        badRequest(res, 'Jar ID is required');
        return;
      }

      await JarService.deleteJar(id, userId);
      success(res, null, 'Jar deleted successfully');
    } catch (err) {
      console.error('Delete jar error:', err);
      if (err instanceof Error && err.message.includes('not found')) {
        notFound(res, 'Jar not found or you do not have permission to delete it');
      } else {
        serverError(res, 'Failed to delete jar');
      }
    }
  }

  /**
   * Get public jar (for viewing without authentication)
   */
  static async getPublicJar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        badRequest(res, 'Jar ID is required');
        return;
      }

      const jar = await JarService.getPublicJar(id);
      
      if (!jar) {
        notFound(res, 'Jar not found');
        return;
      }

      success(res, jar, 'Jar retrieved successfully');
    } catch (err) {
      console.error('Get public jar error:', err);
      serverError(res, 'Failed to retrieve jar');
    }
  }
}

