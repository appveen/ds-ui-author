import { FormulaBuilderModule } from './formula-builder.module';

describe('FormulaBuilderModule', () => {
  let formulaBuilderModule: FormulaBuilderModule;

  beforeEach(() => {
    formulaBuilderModule = new FormulaBuilderModule();
  });

  it('should create an instance', () => {
    expect(formulaBuilderModule).toBeTruthy();
  });
});
