import { StructureFieldPropertiesModule } from './structure-field-properties.module';

describe('StructureFieldPropertiesModule', () => {
  let structureFieldPropertiesModule: StructureFieldPropertiesModule;

  beforeEach(() => {
    structureFieldPropertiesModule = new StructureFieldPropertiesModule();
  });

  it('should create an instance', () => {
    expect(structureFieldPropertiesModule).toBeTruthy();
  });
});
