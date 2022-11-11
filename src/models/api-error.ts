export default class ApiError extends Error {
  status?: number;
  message: string;
  error?: string | null;
  extra_info?: any;

  constructor(message: string, status: number = 500, extraInfo?: any) {
    super(message);

    this.status = status;
    this.message = message;
    this.extra_info = extraInfo;
  }
}
