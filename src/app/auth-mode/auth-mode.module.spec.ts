import { AuthModeModule } from './auth-mode.module';

describe('AuthModeModule', () => {
  let authModeModule: AuthModeModule;

  beforeEach(() => {
    authModeModule = new AuthModeModule();
  });

  it('should create an instance', () => {
    expect(authModeModule).toBeTruthy();
  });
});
