import { verifyJwt } from './clerk';
import * as clerkBackend from '@clerk/backend';

jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
  createClerkClient: jest.fn(),
}));

describe('verifyJwt', () => {
  const mockToken = 'mock-token';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.CLERK_JWT_KEY = 'mock-jwt-key';
    process.env.CLERK_SECRET_KEY = 'mock-secret-key';
  });

  it('should return user details if token is valid', async () => {
    const mockVerifiedToken = { sub: 'user_123' } as any;
    const mockUser = { id: 'user_123', emailAddresses: [{ emailAddress: 'test@test.com' }] } as any;

    (clerkBackend.verifyToken as jest.Mock).mockResolvedValue(mockVerifiedToken);

    const mockClerkClient = {
      users: {
        getUser: jest.fn().mockResolvedValue(mockUser),
      },
    };
    (clerkBackend.createClerkClient as jest.Mock).mockReturnValue(mockClerkClient);

    const result = await verifyJwt(mockToken);

    expect(clerkBackend.verifyToken).toHaveBeenCalledWith(mockToken, {
      jwtKey: 'mock-jwt-key',
    });
    expect(mockClerkClient.users.getUser).toHaveBeenCalledWith('user_123');
    expect(result).toEqual({ verifiedToken: mockVerifiedToken, user: mockUser });
  });

  it('should return null if verifyToken fails', async () => {
    (clerkBackend.verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    const result = await verifyJwt(mockToken);

    expect(result).toBeNull();
  });

  it('should return null if sub is missing in verified token', async () => {
    (clerkBackend.verifyToken as jest.Mock).mockResolvedValue({} as any);

    const result = await verifyJwt(mockToken);

    expect(result).toBeNull();
  });

  it('should return null if getUser fails', async () => {
    const mockVerifiedToken = { sub: 'user_123' } as any;
    (clerkBackend.verifyToken as jest.Mock).mockResolvedValue(mockVerifiedToken);

    const mockClerkClient = {
      users: {
        getUser: jest.fn().mockRejectedValue(new Error('User not found')),
      },
    };
    (clerkBackend.createClerkClient as jest.Mock).mockReturnValue(mockClerkClient);

    const result = await verifyJwt(mockToken);

    expect(result).toBeNull();
  });
});
