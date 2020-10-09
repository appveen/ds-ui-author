import { FieldTypeModule } from './field-type.module';

describe('FieldTypeModule', () => {
  let fieldTypeModule: FieldTypeModule;

  beforeEach(() => {
    fieldTypeModule = new FieldTypeModule();
  });

  it('should create an instance', () => {
    expect(fieldTypeModule).toBeTruthy();
  });
});
