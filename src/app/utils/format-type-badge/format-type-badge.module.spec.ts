import { FormatTypeBadgeModule } from './format-type-badge.module';

describe('FormatTypeBadgeModule', () => {
  let formatTypeBadgeModule: FormatTypeBadgeModule;

  beforeEach(() => {
    formatTypeBadgeModule = new FormatTypeBadgeModule();
  });

  it('should create an instance', () => {
    expect(formatTypeBadgeModule).toBeTruthy();
  });
});
