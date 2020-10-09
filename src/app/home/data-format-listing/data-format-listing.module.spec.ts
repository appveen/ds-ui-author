import { DataFormatListingModule } from './data-format-listing.module';

describe('DataFormatListingModule', () => {
  let dataFormatListingModule: DataFormatListingModule;

  beforeEach(() => {
    dataFormatListingModule = new DataFormatListingModule();
  });

  it('should create an instance', () => {
    expect(dataFormatListingModule).toBeTruthy();
  });
});
