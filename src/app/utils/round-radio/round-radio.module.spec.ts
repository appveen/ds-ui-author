import { RoundRadioModule } from './round-radio.module';

describe('RoundRadioModule', () => {
  let roundRadioModule: RoundRadioModule;

  beforeEach(() => {
    roundRadioModule = new RoundRadioModule();
  });

  it('should create an instance', () => {
    expect(roundRadioModule).toBeTruthy();
  });
});
