import { AuthUsersModule } from './auth-users.module';

describe('AuthUsersModule', () => {
  let authUsersModule: AuthUsersModule;

  beforeEach(() => {
    authUsersModule = new AuthUsersModule();
  });

  it('should create an instance', () => {
    expect(authUsersModule).toBeTruthy();
  });
});
