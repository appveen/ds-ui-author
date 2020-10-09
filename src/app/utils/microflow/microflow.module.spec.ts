import { MicroflowModule } from './microflow.module';

describe('MicroflowModule', () => {
  let microflowModule: MicroflowModule;

  beforeEach(() => {
    microflowModule = new MicroflowModule();
  });

  it('should create an instance', () => {
    expect(microflowModule).toBeTruthy();
  });
});
