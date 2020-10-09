import { NanoServiceListingModule } from './nano-service-listing.module';

describe('NanoserviceListingModule', () => {
  let nanoserviceListingModule: NanoServiceListingModule;

  beforeEach(() => {
    nanoserviceListingModule = new NanoServiceListingModule();
  });

  it('should create an instance', () => {
    expect(nanoserviceListingModule).toBeTruthy();
  });
});
