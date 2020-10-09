import { TableCheckboxModule } from './table-checkbox.module';

describe('TableCheckboxModule', () => {
  let tableCheckboxModule: TableCheckboxModule;

  beforeEach(() => {
    tableCheckboxModule = new TableCheckboxModule();
  });

  it('should create an instance', () => {
    expect(tableCheckboxModule).toBeTruthy();
  });
});
