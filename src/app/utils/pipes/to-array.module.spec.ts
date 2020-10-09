import { ToArrayPipeModule } from './to-array.module';

describe('ToArrayModule', () => {
  let toArrayModule: ToArrayPipeModule;

  beforeEach(() => {
    toArrayModule = new ToArrayPipeModule();
  });

  it('should create an instance', () => {
    expect(toArrayModule).toBeTruthy();
  });
});
