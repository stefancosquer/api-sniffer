import axios, { AxiosError, Method } from "axios";
import * as bodyParser from "body-parser";
import express, { Request, Response } from "express";
import expressWs from "express-ws";
import { performance } from "perf_hooks";
import { Exchange } from "../model/exchange";

export class App {

  public wss;
  public app;

  public exchanges = new Array<Exchange>();

  public constructor(private port, private capacity) {
    this.wss = expressWs(express());
    this.app = this.wss.app;

    this.initializeMiddlewares();
    this.initializeProxy();
    this.initializeWebsocket();
  }

  public listen() {
    this.app.listen(this.port);
    process.stdout.write(`Server listening on ${this.port}\n`);
  }

  public proxy(req: Request, res: Response) {
    const exchange: Exchange = {
      id: performance.now().toString(16).replace(".", ""),
      request: {
        time: Date.now(),
        method: req.method.toLowerCase(),
        url: req.url.replace("/proxy/", "https://"),
        headers: req.headers,
        data: typeof req.body === "string" ?
          (req.header("content-type") === "application/json" ? JSON.parse(req.body) : req.body) :
          null,
      },
    };
    delete exchange.request.headers.host;
    delete exchange.request.headers.connection;
    delete exchange.request.headers["accept-encoding"];
    this.exchanges.unshift(exchange);
    this.exchanges.length = Math.min(this.exchanges.length, this.capacity);
    this.refresh();
    return axios.request({
      method: exchange.request.method as Method,
      headers: exchange.request.headers,
      url: exchange.request.url,
      data: exchange.request.data,
    }).then((pResp) => {
      exchange.response = {
        time: Date.now(),
        status: pResp.status,
        text: pResp.statusText,
        headers: pResp.headers,
        data: pResp.data,
      };
    }).catch((reason: AxiosError) => {
      exchange.response = {
        time: Date.now(),
        status: (reason.response && reason.response.status) || 500,
        text: (reason.response && reason.response.statusText) || "Internal error",
        headers: (reason.response && reason.response.headers) || {},
        data: (reason.response && reason.response.data) || null,
      };
    }).finally(() => {
      res.status(exchange.response.status).set(exchange.response.headers).send(exchange.response.data);
      this.refresh();
    });
  }

  public refresh() {
    this.wss.getWss().clients.forEach((ws) => this.notify(ws));
  }

  private notify(ws) {
    ws.send(JSON.stringify(this.exchanges));
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.text({ type: "*/*"}));
    this.app.use(express.static("dist"));
  }

  private initializeProxy() {
    this.app.all("/proxy/*", (req: Request, res: Response) => this.proxy(req, res));
  }

  private initializeWebsocket() {
    this.app.ws("/", (ws) => this.notify(ws));
  }
}
