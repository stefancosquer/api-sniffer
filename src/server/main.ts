import axios, { AxiosError, Method } from "axios";
import * as bodyParser from "body-parser";
import express, { Request, Response } from "express";
import expressWs from "express-ws";
import { Exchange } from "../model/exchange";

const wss = expressWs(express());
const app = wss.app;
const port: number = 8080;

// Body parsing

app.use(bodyParser.text({ type: "*/*"}));

// Statics

app.use(express.static("dist"));

// Database

const exchanges = new Array<Exchange>();

const refresh = () => {
  wss.getWss().clients.forEach((ws) => {
    ws.send(JSON.stringify(exchanges));
  });
};

app.all("/proxy/*", (req: Request, res: Response) => {
  const exchange: Exchange = {
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
  exchanges.unshift(exchange);
  exchanges.length = Math.min(exchanges.length, 50);
  refresh();
  axios.request({
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
    refresh();
  });
});

// Websocket

app.ws("/", (ws) => {
  ws.send(JSON.stringify(exchanges));
});

app.listen(port);
console.log(`Server listening on ${port}`);
