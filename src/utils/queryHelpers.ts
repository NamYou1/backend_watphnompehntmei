import { Request } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface SortOptions {
  column: string;
  direction: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Parse ?page=1&limit=20 from query string */
export function parsePagination(req: Request, defaultLimit = 20): PaginationOptions {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

/**
 * Parse ?sort=column&order=asc|desc
 * allowedColumns must be explicitly provided to prevent SQL injection.
 */
export function parseSort(
  req: Request,
  allowedColumns: string[],
  defaultColumn: string,
  defaultDirection: 'ASC' | 'DESC' = 'DESC'
): SortOptions {
  const rawCol = (req.query.sort as string) ?? '';
  const rawDir = ((req.query.order as string) ?? '').toUpperCase();

  const column    = allowedColumns.includes(rawCol) ? rawCol : defaultColumn;
  const direction = rawDir === 'ASC' || rawDir === 'DESC' ? rawDir : defaultDirection;

  return { column, direction };
}

/** Parse ?search=term */
export function parseSearch(req: Request): string {
  return ((req.query.search as string) ?? '').trim();
}

/** Build paginated response object */
export function buildPaginatedResult<T>(
  rows: T[],
  total: number,
  opts: PaginationOptions
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / opts.limit);
  return {
    data: rows,
    pagination: {
      total,
      page:       opts.page,
      limit:      opts.limit,
      totalPages,
      hasNext: opts.page < totalPages,
      hasPrev: opts.page > 1,
    },
  };
}
