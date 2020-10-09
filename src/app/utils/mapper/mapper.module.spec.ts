import { MapperModule } from './mapper.module';

describe('MapperModule', () => {
  let mapperModule: MapperModule;

  beforeEach(() => {
    mapperModule = new MapperModule();
  });

  it('should create an instance', () => {
    expect(mapperModule).toBeTruthy();
  });
});
