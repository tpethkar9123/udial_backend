import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import * as clerk from './clerk';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no auth header is present', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    jest.spyOn(clerk, 'verifyJwt').mockResolvedValue(null);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true and attach user to request if token is valid', async () => {
    const mockUser = {
      verifiedToken: { sub: 'user_123' },
      user: { id: 'user_123', email: 'test@test.com' },
    } as any;
    jest.spyOn(clerk, 'verifyJwt').mockResolvedValue(mockUser);

    const request = {
      headers: {
        authorization: 'Bearer valid-token',
      },
      user: null,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual(mockUser);
  });
});
