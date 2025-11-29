const userService = require('../index');

// Create a global object to hold our mocks
global.supabaseMocks = {};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => {
    // Define all mocks directly within this factory function
    const mockSingle = jest.fn();
    const mockEq = jest.fn(() => ({
      single: mockSingle,
    }));
    const mockSelect = jest.fn(() => ({
      eq: mockEq,
    }));
    const mockFrom = jest.fn(() => ({
      select: mockSelect,
    }));

    const mockAuth = {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    };

    // Store these mocks globally so tests can access them
    global.supabaseMocks = {
      mockAuth,
      mockFrom,
      mockSelect,
      mockEq,
      mockSingle,
    };

    return {
      auth: mockAuth,
      from: mockFrom,
    };
  }),
}));

describe('userService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset mock implementations for each test to avoid interference
    global.supabaseMocks.mockAuth.signUp.mockReset();
    global.supabaseMocks.mockAuth.signInWithPassword.mockReset();
    global.supabaseMocks.mockFrom.mockReset();
    global.supabaseMocks.mockSelect.mockReset();
    global.supabaseMocks.mockEq.mockReset();
    global.supabaseMocks.mockSingle.mockReset();
  });

  describe('registerUser', () => {
    it('should call supabase.auth.signUp with correct arguments', async () => {
      global.supabaseMocks.mockAuth.signUp.mockResolvedValueOnce({ data: { user: { id: '123' } }, error: null });
      const phoneNumber = '1234567890';
      const password = 'password123';
      await userService.registerUser(phoneNumber, password);
      expect(global.supabaseMocks.mockAuth.signUp).toHaveBeenCalledWith({ phone: phoneNumber, password: password });
    });

    it('should return a success message on successful registration', async () => {
      global.supabaseMocks.mockAuth.signUp.mockResolvedValueOnce({ data: { user: { id: '123' } }, error: null });
      const result = await userService.registerUser('1234567890', 'password123');
      expect(result).toEqual({ message: 'User registration (placeholder)' });
    });

    it('should handle registration errors', async () => {
      const error = { message: 'Registration failed' };
      global.supabaseMocks.mockAuth.signUp.mockResolvedValueOnce({ data: { user: null }, error });
      const result = await userService.registerUser('1234567890', 'password123');
      expect(result).toEqual({ message: 'User registration (placeholder)' }); // Current placeholder behavior
    });
  });

  describe('loginUser', () => {
    it('should call supabase.auth.signInWithPassword with correct arguments', async () => {
      global.supabaseMocks.mockAuth.signInWithPassword.mockResolvedValueOnce({ data: { user: { id: '123' } }, error: null });
      const phoneNumber = '1234567890';
      const password = 'password123';
      await userService.loginUser(phoneNumber, password);
      expect(global.supabaseMocks.mockAuth.signInWithPassword).toHaveBeenCalledWith({ phone: phoneNumber, password: password });
    });

    it('should return a success message on successful login', async () => {
      global.supabaseMocks.mockAuth.signInWithPassword.mockResolvedValueOnce({ data: { user: { id: '123' } }, error: null });
      const result = await userService.loginUser('1234567890', 'password123');
      expect(result).toEqual({ message: 'User login (placeholder)' });
    });

    it('should handle login errors', async () => {
      const error = { message: 'Login failed' };
      global.supabaseMocks.mockAuth.signInWithPassword.mockResolvedValueOnce({ data: { user: null }, error });
      const result = await userService.loginUser('1234567890', 'password123');
      expect(result).toEqual({ message: 'User login (placeholder)' }); // Current placeholder behavior
    });
  });

  describe('getUserProfile', () => {
    it('should call supabase.from().select().eq().single() with correct arguments', async () => {
      global.supabaseMocks.mockSingle.mockResolvedValueOnce({ data: { id: 'some-user-id', name: 'Test User' }, error: null });
      const userId = 'some-user-id';
      await userService.getUserProfile(userId);
      expect(global.supabaseMocks.mockFrom).toHaveBeenCalledWith('users');
      expect(global.supabaseMocks.mockSelect).toHaveBeenCalledWith('*');
      expect(global.supabaseMocks.mockEq).toHaveBeenCalledWith('id', userId);
      expect(global.supabaseMocks.mockSingle).toHaveBeenCalled();
    });

    it('should return a user profile on successful retrieval', async () => {
      const userProfile = { id: 'some-user-id', name: 'Test User' };
      global.supabaseMocks.mockSingle.mockResolvedValueOnce({ data: userProfile, error: null });
      const result = await userService.getUserProfile('some-user-id');
      expect(result).toEqual({ message: 'User profile (placeholder)' }); // Current placeholder behavior
    });

    it('should handle profile retrieval errors', async () => {
      const error = { message: 'Profile not found' };
      global.supabaseMocks.mockSingle.mockResolvedValueOnce({ data: null, error });
      const result = await userService.getUserProfile('some-user-id');
      expect(result).toEqual({ message: 'User profile (placeholder)' }); // Current placeholder behavior
    });
  });
});