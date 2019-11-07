import { ListComponent } from "./list";

describe("List", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should indicate success", () => {
    const comp = new ListComponent();
    const indicator = comp.getIndicator({
      id: "",
      request: { time: 0, url: "", method: "", data: "", headers: [] },
      response: { time: 0, status: 200, text: "", data: "", headers: [] },
    });
    expect(indicator).toBe("ok");
  });

  it("should indicate failure", () => {
    const comp = new ListComponent();
    const indicator = comp.getIndicator({
      id: "",
      request: { time: 0, url: "", method: "", data: "", headers: [] },
      response: { time: 0, status: 404, text: "", data: "", headers: [] },
    });
    expect(indicator).toBe("ko");
  });

  it("should dispatch selected event", () => {
    const comp = new ListComponent();
    comp.onSelect({
      id: "1234",
      request: { time: 0, url: "", method: "", data: "", headers: [] },
      response: { time: 0, status: 200, text: "", data: "", headers: [] },
    });
    expect((comp.dispatchEvent as jest.Mock).mock.calls.length).toBe(1);
    expect(comp.selected).toBe("1234");
  });

  it("should display exchange time with correct time zone", () => {
    const comp = new ListComponent();
    comp.offset = -60 * 60000;
    const time = comp.getRequestTime({
      id: "1234",
      request: { time: 0, url: "", method: "", data: "", headers: [] },
      response: { time: 0, status: 200, text: "", data: "", headers: [] },
    });
    expect(time).toBe("01:00");
  });
});
