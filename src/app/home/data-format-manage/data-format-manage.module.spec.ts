import { DataFormatManageModule } from './data-format-manage.module';

describe('DataFormatManageModule', () => {
  let dataFormatManageModule: DataFormatManageModule;

  beforeEach(() => {
    dataFormatManageModule = new DataFormatManageModule();
  });

  it('should create an instance', () => {
    expect(dataFormatManageModule).toBeTruthy();
  });
});
