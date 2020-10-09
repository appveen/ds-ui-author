import { FormatSelectorModule } from './format-selector.module';

describe('FormatSelectorModule', () => {
  let formatSelectorModule: FormatSelectorModule;

  beforeEach(() => {
    formatSelectorModule = new FormatSelectorModule();
  });

  it('should create an instance', () => {
    expect(formatSelectorModule).toBeTruthy();
  });
});
