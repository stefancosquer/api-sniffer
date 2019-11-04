export interface Exchange {
  request: {
    time: number;
    method: string;
    url: string;
    headers: any;
    data: string;
  };
  response?: {
    time: number;
    status: number;
    text: string;
    headers: any;
    data?: string;
  };
}
