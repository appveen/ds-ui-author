import { StructureFieldModule } from './structure-field.module';

describe('StructureFieldModule', () => {
  let structureFieldModule: StructureFieldModule;

  beforeEach(() => {
    structureFieldModule = new StructureFieldModule();
  });

  it('should create an instance', () => {
    expect(structureFieldModule).toBeTruthy();
  });
});
