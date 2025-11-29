const memoryService = require('../index');

global.supabaseMocks = {};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => {
    const mockSingle = jest.fn();
    const mockEq = jest.fn(() => ({
      single: mockSingle,
    }));
    const mockSelect = jest.fn(() => ({
      eq: mockEq,
    }));
    const mockOrder = jest.fn(() => ({
      limit: jest.fn(),
    }));
    const mockInsert = jest.fn(() => ({
      select: jest.fn(),
    }));
    const mockFrom = jest.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
      limit: jest.fn(),
      insert: mockInsert,
    }));

    global.supabaseMocks = {
      mockFrom,
      mockSelect,
      mockEq,
      mockOrder,
      mockInsert,
      mockSingle,
    };

    return {
      from: mockFrom,
    };
  }),
}));

describe('memoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations for each test
    global.supabaseMocks.mockFrom.mockReset();
    global.supabaseMocks.mockSelect.mockReset();
    global.supabaseMocks.mockEq.mockReset();
    global.supabaseMocks.mockOrder.mockReset();
    global.supabaseMocks.mockInsert.mockReset();
    global.supabaseMocks.mockSingle.mockReset();
  });

  describe('storeConversation', () => {
    it('should store a conversation and return the data', async () => {
      const mockData = [{ id: 1, user_id: 'user1', agent_id: 'agent1', messages: ['hello'] }];
      global.supabaseMocks.mockInsert.mockReturnThis();
      global.supabaseMocks.mockInsert().select.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await memoryService.storeConversation('user1', 'agent1', ['hello']);
      expect(result).toEqual(mockData[0]);
    });

    it('should throw an error if storing conversation fails', async () => {
      const mockError = { message: 'Failed to store' };
      global.supabaseMocks.mockInsert.mockReturnThis();
      global.supabaseMocks.mockInsert().select.mockResolvedValueOnce({ data: null, error: mockError });

      await expect(memoryService.storeConversation('user1', 'agent1', ['hello'])).rejects.toThrow(mockError);
    });
  });

  describe('getConversationHistory', () => {
    it('should retrieve conversation history and return flattened messages', async () => {
      const mockData = [{ messages: ['msg1', 'msg2'] }, { messages: ['msg3'] }];
      global.supabaseMocks.mockSelect.mockReturnThis();
      global.supabaseMocks.mockEq.mockReturnThis();
      global.supabaseMocks.mockOrder.mockReturnThis();
      global.supabaseMocks.mockOrder().limit.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await memoryService.getConversationHistory('user1', 'agent1');
      expect(result).toEqual(['msg1', 'msg2', 'msg3']);
    });

    it('should throw an error if fetching conversation history fails', async () => {
      const mockError = { message: 'Failed to fetch' };
      global.supabaseMocks.mockSelect.mockReturnThis();
      global.supabaseMocks.mockEq.mockReturnThis();
      global.supabaseMocks.mockOrder.mockReturnThis();
      global.supabaseMocks.mockOrder().limit.mockResolvedValueOnce({ data: null, error: mockError });

      await expect(memoryService.getConversationHistory('user1', 'agent1')).rejects.toThrow(mockError);
    });
  });

  describe('storeForeverBrain', () => {
    it('should store Forever Brain memory and return the data', async () => {
      const mockData = [{ id: 1, user_id: 'user1', conversation_id: 'conv1', summary: 'summary', context: 'context' }];
      global.supabaseMocks.mockInsert.mockReturnThis();
      global.supabaseMocks.mockInsert().select.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await memoryService.storeForeverBrain('user1', 'conv1', 'summary', 'context');
      expect(result).toEqual(mockData[0]);
    });

    it('should throw an error if storing Forever Brain memory fails', async () => {
      const mockError = { message: 'Failed to store FB' };
      global.supabaseMocks.mockInsert.mockReturnThis();
      global.supabaseMocks.mockInsert().select.mockResolvedValueOnce({ data: null, error: mockError });

      await expect(memoryService.storeForeverBrain('user1', 'conv1', 'summary', 'context')).rejects.toThrow(mockError);
    });
  });

  describe('getForeverBrain', () => {
    it('should retrieve Forever Brain memories and return the data', async () => {
      const mockData = [{ summary: 'summary1', context: 'context1' }, { summary: 'summary2', context: 'context2' }];
      global.supabaseMocks.mockSelect.mockReturnThis();
      global.supabaseMocks.mockEq.mockReturnThis();
      global.supabaseMocks.mockOrder.mockReturnThis();
      global.supabaseMocks.mockOrder().limit.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await memoryService.getForeverBrain('user1');
      expect(result).toEqual(mockData);
    });

    it('should throw an error if fetching Forever Brain memories fails', async () => {
      const mockError = { message: 'Failed to fetch FB' };
      global.supabaseMocks.mockSelect.mockReturnThis();
      global.supabaseMocks.mockEq.mockReturnThis();
      global.supabaseMocks.mockOrder.mockReturnThis();
      global.supabaseMocks.mockOrder().limit.mockResolvedValueOnce({ data: null, error: mockError });

      await expect(memoryService.getForeverBrain('user1')).rejects.toThrow(mockError);
    });
  });
});