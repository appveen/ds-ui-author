import { BasicInfoModule } from './basic-info.module';

describe('BasicInfoModule', () => {
  let basicInfoModule: BasicInfoModule;

  beforeEach(() => {
    basicInfoModule = new BasicInfoModule();
  });

  it('should create an instance', () => {
    expect(basicInfoModule).toBeTruthy();
  });
});
