/**
 * 状态码类
 */

var status = {};

 // 查询成功
status.SUCCESS = 200

// 不弹出错误
status.NO_ERROR = 400;

// 服务器出错
status.SERVER_ERROR = 500;

// 必须传的头信息不能空
status.NO_HEADER = 501;

// 签名错误
status.SIGINING_ERROR = 503;

// 时间失效
status.TIME_INVALID = 502;

// 用户数据失效，请重新微信授权登录
status.USER_DATA_INVALID = 504;

// 用户数据异常，可能被篡改
status.USER_DATA_ABNORMAL = 505;


export default status;