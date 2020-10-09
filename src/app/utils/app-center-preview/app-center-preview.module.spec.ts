import { AppCenterPreviewModule } from './app-center-preview.module';

describe('AppCenterPreviewModule', () => {
  let appCenterPreviewModule: AppCenterPreviewModule;

  beforeEach(() => {
    appCenterPreviewModule = new AppCenterPreviewModule();
  });

  it('should create an instance', () => {
    expect(appCenterPreviewModule).toBeTruthy();
  });
});
