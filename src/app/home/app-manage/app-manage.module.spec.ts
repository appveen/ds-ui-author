import { AppManageModule } from './app-manage.module';

describe('AppManageModule', () => {
  let appManageModule: AppManageModule;

  beforeEach(() => {
    appManageModule = new AppManageModule();
  });

  it('should create an instance', () => {
    expect(appManageModule).toBeTruthy();
  });
});
