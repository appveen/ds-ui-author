import { AppsModule } from './apps.module';

describe('AppsModule', () => {
  let appsModule: AppsModule;

  beforeEach(() => {
    appsModule = new AppsModule();
  });

  it('should create an instance', () => {
    expect(appsModule).toBeTruthy();
  });
});
