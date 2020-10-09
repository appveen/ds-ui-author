import { OrderByModule } from './order-by.module';

describe('OrderByModule', () => {
  let orderByModule: OrderByModule;

  beforeEach(() => {
    orderByModule = new OrderByModule();
  });

  it('should create an instance', () => {
    expect(orderByModule).toBeTruthy();
  });
});
