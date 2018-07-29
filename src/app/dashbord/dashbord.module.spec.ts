import { DashbordModule } from './dashbord.module';

describe('DashbordModule', () => {
  let dashbordModule: DashbordModule;

  beforeEach(() => {
    dashbordModule = new DashbordModule();
  });

  it('should create an instance', () => {
    expect(dashbordModule).toBeTruthy();
  });
});
