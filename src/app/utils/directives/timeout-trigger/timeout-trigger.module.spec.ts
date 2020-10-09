import { TimeoutTriggerModule } from './timeout-trigger.module';

describe('TimeoutTriggerModule', () => {
  let timeoutTriggerModule: TimeoutTriggerModule;

  beforeEach(() => {
    timeoutTriggerModule = new TimeoutTriggerModule();
  });

  it('should create an instance', () => {
    expect(timeoutTriggerModule).toBeTruthy();
  });
});
