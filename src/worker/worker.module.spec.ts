import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { WorkerModule } from './worker.module';
import { UserProcessor } from './worker.processor';

describe('WorkerModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [WorkerModule],
    })
      .overrideProvider(getQueueToken('logs-queue'))
      .useValue({
        add: jest.fn(),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide UserProcessor', () => {
    const processor = module.get<UserProcessor>(UserProcessor);
    expect(processor).toBeDefined();
  });
});
