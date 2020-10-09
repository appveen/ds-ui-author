import { ReadWsdlModule } from './read-wsdl.module';

describe('ReadWsdlModule', () => {
  let readWsdlModule: ReadWsdlModule;

  beforeEach(() => {
    readWsdlModule = new ReadWsdlModule();
  });

  it('should create an instance', () => {
    expect(readWsdlModule).toBeTruthy();
  });
});
