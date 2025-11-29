import { Request } from 'express';
import { JWTPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface ErrorResponse {
  error: string;
  details?: any;
}

export interface SuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
