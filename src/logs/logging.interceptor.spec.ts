import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { LogsService } from './logs.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  const mockLogsService = {
    logAction: jest.fn().mockResolvedValue(undefined),
  };

  const mockRequest = {
    method: 'GET',
    url: '/api/leads',
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'Jest Test Agent',
    },
  };

  const mockResponse = {
    statusCode: 200,
  };

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        {
          provide: LogsService,
          useValue: mockLogsService,
        },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should NOT log successful GET requests (filtered out)', (done) => {
      const mockCallHandler: CallHandler = {
        handle: () => of({ data: 'test' }),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (data) => {
          expect(data).toEqual({ data: 'test' });
        },
        complete: () => {
          setTimeout(() => {
            expect(mockLogsService.logAction).not.toHaveBeenCalled();
            done();
          }, 10);
        },
      });
    });

    it('should log successful POST requests', (done) => {
      const postRequest = { ...mockRequest, method: 'POST' };
      const postContext = {
        switchToHttp: () => ({
          getRequest: () => postRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ data: 'created' }),
      };

      interceptor.intercept(postContext, mockCallHandler).subscribe({
        complete: () => {
          setTimeout(() => {
            expect(mockLogsService.logAction).toHaveBeenCalledWith(
              'HTTP_REQUEST',
              'SYSTEM',
              expect.objectContaining({
                method: 'POST',
                url: '/api/leads',
                statusCode: 200,
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should log HTTP errors even for GET requests', (done) => {
      const testError = new Error('Test error');
      const mockCallHandler: CallHandler = {
        handle: () => throwError(() => testError),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          setTimeout(() => {
            expect(mockLogsService.logAction).toHaveBeenCalledWith(
              'HTTP_ERROR',
              'SYSTEM',
              expect.objectContaining({
                method: 'GET',
                error: 'Test error',
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should handle missing user-agent header on POST', (done) => {
      const requestWithoutAgent = {
        ...mockRequest,
        method: 'POST', // Use POST to ensure it is not filtered
        headers: {},
      };

      const contextWithoutAgent = {
        switchToHttp: () => ({
          getRequest: () => requestWithoutAgent,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler: CallHandler = {
        handle: () => of({ success: true }),
      };

      interceptor.intercept(contextWithoutAgent, mockCallHandler).subscribe({
        complete: () => {
          setTimeout(() => {
            expect(mockLogsService.logAction).toHaveBeenCalled();
            done();
          }, 10);
        },
      });
    });

    it('should handle logAction failures gracefully', (done) => {
      mockLogsService.logAction.mockRejectedValueOnce(new Error('Queue failed'));

      const mockCallHandler: CallHandler = {
        handle: () => of({ data: 'test' }),
      };

      // Should not throw even if logAction fails
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (data) => {
          expect(data).toEqual({ data: 'test' });
        },
        complete: () => {
          done();
        },
      });
    });
  });
});
