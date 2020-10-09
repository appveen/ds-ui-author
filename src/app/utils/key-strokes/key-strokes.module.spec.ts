import { KeyStrokesModule } from './key-strokes.module';

describe('KeyStrokesModule', () => {
  let keyStrokesModule: KeyStrokesModule;

  beforeEach(() => {
    keyStrokesModule = new KeyStrokesModule();
  });

  it('should create an instance', () => {
    expect(keyStrokesModule).toBeTruthy();
  });
});
