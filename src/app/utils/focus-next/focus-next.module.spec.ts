import { FocusNextModule } from './focus-next.module';

describe('FocusNextModule', () => {
  let focusNextModule: FocusNextModule;

  beforeEach(() => {
    focusNextModule = new FocusNextModule();
  });

  it('should create an instance', () => {
    expect(focusNextModule).toBeTruthy();
  });
});
