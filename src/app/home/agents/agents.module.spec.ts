import { AgentsModule } from './agents.module';

describe('AgentsModule', () => {
  let agentsModule: AgentsModule;

  beforeEach(() => {
    agentsModule = new AgentsModule();
  });

  it('should create an instance', () => {
    expect(agentsModule).toBeTruthy();
  });
});
