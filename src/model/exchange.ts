import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";

export interface Exchange {
  id: string;
  request: {
    time: number;
    method: string;
    url: string;
    headers: IncomingHttpHeaders;
    data: string;
  };
  response?: {
    time: number;
    status: number;
    text: string;
    headers: OutgoingHttpHeaders;
    data?: string;
  };
}
