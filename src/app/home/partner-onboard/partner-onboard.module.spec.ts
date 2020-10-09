import { PartnerOnboardModule } from './partner-onboard.module';

describe('PartnerOnboardModule', () => {
  let partnerOnboardModule: PartnerOnboardModule;

  beforeEach(() => {
    partnerOnboardModule = new PartnerOnboardModule();
  });

  it('should create an instance', () => {
    expect(partnerOnboardModule).toBeTruthy();
  });
});
