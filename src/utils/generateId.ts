import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique ID with a prefix
 * Format: prefix_timestamp_randomString
 * Example: prod_1732377600000_xyz123
 */
export const generateId = (prefix: string = 'id'): string => {
  const timestamp = Date.now();
  const randomString = uuidv4().split('-')[0];
  return `${prefix}_${timestamp}_${randomString}`;
};

/**
 * Generate multiple IDs at once
 */
export const generateIds = (prefix: string, count: number): string[] => {
  return Array.from({ length: count }, () => generateId(prefix));
};
