import { NanoServiceManageModule } from './nano-service-manage.module';

describe('NanoserviceManageModule', () => {
  let nanoServiceManageModule: NanoServiceManageModule;

  beforeEach(() => {
    nanoServiceManageModule = new NanoServiceManageModule();
  });

  it('should create an instance', () => {
    expect(nanoServiceManageModule).toBeTruthy();
  });
});
