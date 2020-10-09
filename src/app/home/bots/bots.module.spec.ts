import { BotsModule } from './bots.module';

describe('BotsModule', () => {
  let botsModule: BotsModule;

  beforeEach(() => {
    botsModule = new BotsModule();
  });

  it('should create an instance', () => {
    expect(botsModule).toBeTruthy();
  });
});
