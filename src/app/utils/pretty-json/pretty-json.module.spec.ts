import { PrettyJsonModule } from './pretty-json.module';

describe('PrettyJsonModule', () => {
  let prettyJsonModule: PrettyJsonModule;

  beforeEach(() => {
    prettyJsonModule = new PrettyJsonModule();
  });

  it('should create an instance', () => {
    expect(prettyJsonModule).toBeTruthy();
  });
});
