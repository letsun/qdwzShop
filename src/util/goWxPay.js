import api from '@/util/api';

function goWxPay(http, orderId, headers) {

	return new Promise((resolve, reject) => {
		
		if (typeof WeixinJSBridge == "undefined") {
			
			if (document.addEventListener) {
				document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
			} else if (document.attachEvent) {
				document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
				document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
			}
		} else {
			
			http({
				url: `${api.order.payMent}/${orderId}`,
				method: 'post',
				headers: headers
			}).then((response) => {

				let res = response.data;
				if (res.code === 200) {
					onBridgeReady(res.data.appId, res.data.timeStamp, res.data.nonceStr, res.data.package, res.data.paySign, resolve, orderId);
				} else {
					reject(res.msg);
				}

			});
		}
	})
}


function onBridgeReady(appId, timeStamp, nonceStr, packagepra, paySign, resolve, orderId) {
	WeixinJSBridge.invoke(
		'getBrandWCPayRequest', {
			"appId": appId, 			//公众号名称，由商户传入     
			"timeStamp": timeStamp, 	//时间戳，自1970年以来的秒数     
			"nonceStr": nonceStr, 		//随机串     
			"package": packagepra, 		//"prepay_id=u802345jgfjsdfgsdg888"订单详情扩展字符串 统一下单接口返回的prepay_id参数值，提交格式如：prepay_id=*** 
			"signType": "MD5", 			//微信签名方式:     
			"paySign": paySign 			//微信签名 
		},
		function(res) {
			if (res.err_msg == "get_brand_wcpay_request:ok") {
				// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
				//支付成功进入订单记录
				resolve('ok');
			} else if (res.err_msg == "get_brand_wcpay_request:cancel") {
				//支付过程中用户取消
				resolve('cancel');
			} else if (res.err_msg == "get_brand_wcpay_request:fail") {
				//支付失败
				resolve('fail');
			} else {
				//其他未知异常
				resolve('exception');
			}
		});
}

export default goWxPay;