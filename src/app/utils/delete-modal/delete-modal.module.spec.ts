import { DeleteModalModule } from './delete-modal.module';

describe('DeleteModalModule', () => {
  let deleteModalModule: DeleteModalModule;

  beforeEach(() => {
    deleteModalModule = new DeleteModalModule();
  });

  it('should create an instance', () => {
    expect(deleteModalModule).toBeTruthy();
  });
});
