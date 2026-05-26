import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockChainable = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

const mockSupabase = {
  auth: { getUser: vi.fn(), getSession: vi.fn() },
  from: vi.fn(() => mockChainable),
};

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import { GET, POST, PUT } from '@/app/api/backup/route';

describe('/api/backup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
  });

  describe('GET', () => {
    it('returns 401 without authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request('http://localhost/api/backup');
      const response = await GET(request as any);
      expect(response.status).toBe(401);
    });

    it('returns exists:false when no google_token in DB', async () => {
      mockChainable.single.mockResolvedValue({ data: { google_token: null }, error: null });

      const request = new Request('http://localhost/api/backup');
      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.exists).toBe(false);
      expect(data.lastBackup).toBeNull();
    });
  });

  describe('POST', () => {
    it('returns 401 without authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request('http://localhost/api/backup', { method: 'POST' });
      const response = await POST(request as any);
      expect(response.status).toBe(401);
    });

    it('returns 401 when no google_token in DB', async () => {
      mockChainable.single.mockResolvedValue({ data: { google_token: null }, error: null });

      const request = new Request('http://localhost/api/backup', { method: 'POST' });
      const response = await POST(request as any);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain('Google token');
    });
  });

  describe('PUT', () => {
    it('returns 401 without authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request('http://localhost/api/backup', { method: 'PUT' });
      const response = await PUT(request as any);
      expect(response.status).toBe(401);
    });

    it('returns 401 when no google_token in DB', async () => {
      mockChainable.single.mockResolvedValue({ data: { google_token: null }, error: null });

      const request = new Request('http://localhost/api/backup', { method: 'PUT' });
      const response = await PUT(request as any);
      expect(response.status).toBe(401);
    });
  });
});
