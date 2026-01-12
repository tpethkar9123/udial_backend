import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthGuard } from './auth.guard';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AuthGuard', () => {
    const guard = module.get<AuthGuard>(AuthGuard);
    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(AuthGuard);
  });
});
