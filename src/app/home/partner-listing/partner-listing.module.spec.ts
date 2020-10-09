import { PartnerListingModule } from './partner-listing.module';

describe('PartnerListingModule', () => {
  let partnerListingModule: PartnerListingModule;

  beforeEach(() => {
    partnerListingModule = new PartnerListingModule();
  });

  it('should create an instance', () => {
    expect(partnerListingModule).toBeTruthy();
  });
});
