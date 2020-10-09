import { InsightModule } from './insight.module';

describe('InsightModule', () => {
  let insightModule: InsightModule;

  beforeEach(() => {
    insightModule = new InsightModule();
  });

  it('should create an instance', () => {
    expect(insightModule).toBeTruthy();
  });
});
