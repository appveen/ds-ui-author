import { CommonFilterModule } from './common-filter.module';

describe('CommonFilterModule', () => {
  let commonFilterModule: CommonFilterModule;

  beforeEach(() => {
    commonFilterModule = new CommonFilterModule();
  });

  it('should create an instance', () => {
    expect(commonFilterModule).toBeTruthy();
  });
});
