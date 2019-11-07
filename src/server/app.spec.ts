import axios from "axios";
import { App } from "./app";

jest.mock("axios");

describe("App", () => {

  let res;

  beforeEach(() => {
    jest.clearAllMocks().resetModules();
    res = {
      status: jest.fn(() => res),
      set: jest.fn(() => res),
      send: jest.fn(() => res),
    } as any;
  });

  it("should be configured", () => {
    const app = new App(0, 10);
    expect(app.app).not.toBeNull();
    expect(app.wss).not.toBeNull();
  });

  it("should listen on chosen port", () => {
    const app = new App(1234, 10);
    app.app.listen = jest.fn();
    app.listen();
    expect(app.app.listen.mock.calls[0][0]).toBe(1234);
  });

  it("should proxy successful request and notify refresh", async () => {
    const app = new App(1234, 10);
    const refresh = app.refresh = jest.fn();

    const req = {
      method: "GET",
      url: "/proxy/example.com/api/v1",
      headers: [],
    } as any;

    (axios.request as jest.Mock).mockResolvedValue({
      status: 200,
      statusText: "OK",
    });

    await app.proxy(req, res);

    expect((axios.request as jest.Mock).mock.calls[0][0].method).toBe("get");
    expect((axios.request as jest.Mock).mock.calls[0][0].url).toBe("https://example.com/api/v1");
    expect(res.status.mock.calls[0][0]).toBe(200);
    expect(app.exchanges.length).toBe(1);
    expect(refresh.mock.calls.length).toBe(2);
  });

  it("should proxy unsuccessful request and notify refresh", async () => {
    const app = new App(1234, 10);
    const refresh = app.refresh = jest.fn();

    const req = {
      method: "GET",
      url: "/proxy/example.com/api/v1",
      headers: [],
    } as any;

    (axios.request as jest.Mock).mockRejectedValue({
      response: {
        status: 400,
        statusText: "Bad request",
      },
    });

    await app.proxy(req, res);

    expect((axios.request as jest.Mock).mock.calls[0][0].method).toBe("get");
    expect((axios.request as jest.Mock).mock.calls[0][0].url).toBe("https://example.com/api/v1");
    expect(res.status.mock.calls[0][0]).toBe(400);
    expect(app.exchanges.length).toBe(1);
    expect(refresh.mock.calls.length).toBe(2);
  });

  it("should proxy unhandled error and notify refresh", async () => {
    const app = new App(1234, 10);
    const refresh = app.refresh = jest.fn();

    const req = {
      method: "GET",
      url: "/proxy/example.com/api/v1",
      headers: [],
    } as any;

    (axios.request as jest.Mock).mockRejectedValue({ });

    await app.proxy(req, res);

    expect((axios.request as jest.Mock).mock.calls[0][0].method).toBe("get");
    expect((axios.request as jest.Mock).mock.calls[0][0].url).toBe("https://example.com/api/v1");
    expect(res.status.mock.calls[0][0]).toBe(500);
    expect(app.exchanges.length).toBe(1);
    expect(refresh.mock.calls.length).toBe(2);
  });

  it("should store no more exchanges than allowed by capacity", async () => {
    const app = new App(1234, 10);
    const refresh = app.refresh = jest.fn();

    const req = {
      method: "GET",
      url: "/proxy/example.com/api/v1",
      headers: [],
    } as any;

    (axios.request as jest.Mock).mockResolvedValue({ });

    for (let i = 0; i < 20; i++) {
      await app.proxy(req, res);
    }

    expect(app.exchanges.length).toBe(10);
    expect(refresh.mock.calls.length).toBe(40);
  });
});
