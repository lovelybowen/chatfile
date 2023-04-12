/**
 * Api 响应包装对象
 */
export class ApiResponse<T> {
  code: number
  message: string
  data: T
  constructor(code: number, message: string, data: T) {
    this.code = code
    this.message = message
    this.data = data
  }
}

export function successResponse(data: any): ApiResponse<any> {
  return new ApiResponse(200, 'success', data)
}

export function failResponse(code: number, message: string, data: any): ApiResponse<any> {
  return new ApiResponse(code, message, data)
}
