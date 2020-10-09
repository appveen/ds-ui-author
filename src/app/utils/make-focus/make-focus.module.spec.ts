import { MakeFocusModule } from './make-focus.module';

describe('MakeFocusModule', () => {
  let makeFocusModule: MakeFocusModule;

  beforeEach(() => {
    makeFocusModule = new MakeFocusModule();
  });

  it('should create an instance', () => {
    expect(makeFocusModule).toBeTruthy();
  });
});
