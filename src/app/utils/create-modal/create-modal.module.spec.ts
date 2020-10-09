import { CreateModalModule } from './create-modal.module';

describe('CreateModalModule', () => {
  let createModalModule: CreateModalModule;

  beforeEach(() => {
    createModalModule = new CreateModalModule();
  });

  it('should create an instance', () => {
    expect(createModalModule).toBeTruthy();
  });
});
