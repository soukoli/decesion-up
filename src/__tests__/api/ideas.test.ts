import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the server supabase module
const mockChainable = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
};

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(() => mockChainable),
};

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Import after mocking
import { POST, GET, PATCH, DELETE } from '@/app/api/ideas/route';

describe('/api/ideas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
  });

  describe('POST', () => {
    it('creates idea with correct columns only', async () => {
      mockChainable.single.mockResolvedValue({
        data: { id: 'idea-1', user_id: 'user-123', content: 'test', source: 'text', created_at: '2026-01-01' },
        error: null,
      });

      const request = new Request('http://localhost/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ content: 'Buy cake', source: 'text' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.idea).toBeDefined();

      // Verify only valid columns are sent to DB
      const insertCall = mockChainable.insert.mock.calls[0][0];
      expect(insertCall).toHaveProperty('user_id', 'user-123');
      expect(insertCall).toHaveProperty('content', 'Buy cake');
      expect(insertCall).toHaveProperty('source', 'text');
      expect(insertCall).not.toHaveProperty('voice_transcript');
      expect(insertCall).not.toHaveProperty('podcast_id');
      expect(insertCall).not.toHaveProperty('updated_at');
    });

    it('returns 401 without auth', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request('http://localhost/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ content: 'test' }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(401);
    });

    it('returns 400 without content', async () => {
      const request = new Request('http://localhost/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ content: '' }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(400);
    });

    it('returns 400 with whitespace-only content', async () => {
      const request = new Request('http://localhost/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ content: '   ' }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(400);
    });

    it('trims content before saving', async () => {
      mockChainable.single.mockResolvedValue({ data: { id: 'idea-1' }, error: null });

      const request = new Request('http://localhost/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ content: '  hello world  ' }),
      });

      await POST(request as any);
      const insertCall = mockChainable.insert.mock.calls[0][0];
      expect(insertCall.content).toBe('hello world');
    });

    it('includes podcast_name when source is podcast', async () => {
      mockChainable.single.mockResolvedValue({ data: { id: 'idea-1' }, error: null });

      const request = new Request('http://localhost/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ content: 'insight', source: 'podcast', podcast_name: 'Lex Fridman' }),
      });

      await POST(request as any);
      const insertCall = mockChainable.insert.mock.calls[0][0];
      expect(insertCall.podcast_name).toBe('Lex Fridman');
      expect(insertCall.source).toBe('podcast');
    });

    it('returns 500 on DB error', async () => {
      mockChainable.single.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      const request = new Request('http://localhost/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ content: 'test' }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);
    });
  });

  describe('GET', () => {
    it('returns 401 without auth', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new Request('http://localhost/api/ideas?status=active');
      const response = await GET(request as any);
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE', () => {
    it('returns 400 without id', async () => {
      const request = new Request('http://localhost/api/ideas');
      const response = await DELETE(request as any);
      expect(response.status).toBe(400);
    });
  });
});
