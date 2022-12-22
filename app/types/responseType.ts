export interface ResponseType<T> {
  data: T | T[] | null;
  status: number;
  errors?: [
    {
      message: string;
      status: number;
    },
  ];
}

export function getSuccessResponse<T>(data: T, status): ResponseType<T> {
  return {
    data,
    status: 200,
  };
}

export function getErrorResponse(error) {
  return {
    data: null,
    status: error.status,
    errors: [
      {
        message: error.message,
        status: error.status,
      },
    ],
  };
}
