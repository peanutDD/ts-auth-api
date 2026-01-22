/**
 * 自定义 HTTP 异常类
 * 
 * 用于统一处理应用中的错误响应
 * 继承自 Error 类，可以携带 HTTP 状态码和详细错误信息
 * 
 * @class HttpException
 * @extends Error
 * 
 * @property {number} status - HTTP 状态码（如 400, 404, 500）
 * @property {string} message - 错误消息
 * @property {any} errors - 可选的详细错误对象，用于字段验证错误等场景
 * 
 * @example
 * throw new HttpException(400, "Invalid input", { username: "Username is required" });
 */
class HttpException extends Error {
  status: number;
  message: string;
  errors?: any;

  /**
   * 创建 HTTP 异常实例
   * 
   * @param {number} status - HTTP 状态码
   * @param {string} message - 错误消息
   * @param {any} errors - 可选的详细错误信息（通常用于表单验证错误）
   */
  constructor(status: number, message: string, errors?: any) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
    
    // 保持正确的原型链，确保 instanceof 操作符正常工作
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}

export default HttpException;
