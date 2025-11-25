import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email?: string;
  role?: 'admin' | 'user';
}

/**
 * Generate a JWT token for a payload. Uses admin secret when payload.role === 'admin'.
 */
export const generateToken = (
  payload: TokenPayload,
  expiresIn?: string,
): string => {
  const secretEnv = payload.role === 'admin'
    ? process.env.JWT_ADMIN_SECRET
    : process.env.JWT_SECRET;

  const secret = secretEnv as jwt.Secret | undefined;

  if (!secret) {
    throw new Error('JWT secret is not defined');
  }

  const expiry = expiresIn || process.env.JWT_EXPIRE || '7d';

  return jwt.sign(payload as jwt.JwtPayload, secret as jwt.Secret, { expiresIn: expiry } as any);
};

/**
 * Verify JWT token. If `isAdmin` is true, admin secret is used.
 * Returns the decoded payload as TokenPayload or throws on failure.
 */
const verifyToken = (token: string, isAdmin: boolean = false): TokenPayload => {
  const secretEnv = isAdmin ? process.env.JWT_ADMIN_SECRET : process.env.JWT_SECRET;
  const secret = secretEnv as jwt.Secret | undefined;

  if (!secret) {
    throw new Error('JWT secret is not defined');
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export default verifyToken;

/**
 * Decode token without verification (useful for debugging).
 */
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};
