/**
 * 工具类方法
 */
import md5 from '@/util/md5';
import statusCode from '@/util/statusCode';
import ip from '@/util/ipAddress';
import setUserSessionInfor from '@/util/setUserSessionInfor';


const util = {}

/**
 * 获取地址栏的参数
 * @param  string name 		参数名
 * @return string      		参数值
 */
util.getUrlParam = (name) => {
	let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
	let r = window.location.search.substr(1).match(reg); // 匹配目标参数
	if (r != null) return decodeURI(unescape(r[2]));
	return null; // 返回参数值
}

/**
 * 通过标签名获取标签对象
 * @param  string 		curElement 		当前元素对象
 * @param  string 		tagName    		需要获取的元素对象的data-tagname的值
 * @return null
 */
util.getParentElementByTagName = (curElement, tagName) => {
	let element = null;

	while (true) {

		element = curElement.parentNode;

		if (element.dataset.tagname && element.dataset.tagname.toLowerCase() === tagName.toLowerCase()) {
			
			break;

		} else {
			curElement = element;
		}
	}

	return element;
}

/**
 * 更新session数据
 * @return 	string 			信息
 */
util.updateSessionKeys = (context) => {
	let session = window.sessionStorage;
	let headerInfor = {};

	if (session.getItem('headerInfor') !== null) {
		headerInfor = JSON.parse(session.getItem('headerInfor'));
		let timestamp = +(new Date());

		headerInfor.timestamp = timestamp;
		headerInfor.keys = md5(headerInfor.openid + headerInfor.companyId + headerInfor.consumerId + headerInfor.sign + headerInfor.timestamp).toUpperCase();
		session.setItem('headerInfor', JSON.stringify(headerInfor));

		context.commit('updateKeys', headerInfor.keys);
		context.commit('updateTimestamp', headerInfor.timestamp);

		return '密钥更新成功';
	} else {
		return '没有用户信息！';
	}
}

/**
 * 重新跳转更新微信用户信息
 * @return null
 */
util.updateWechatInfor = () => {
	let url = `${ip}/shop/wx`;

	let companyId = util.getUrlParam('companyId'); // 企业ID
	let mallType = util.getUrlParam('mallType'); // 商品类型
	let distributorId = util.getUrlParam('distributorId') || 0; // 分销商ID
	let redirectUri = `${url}/${mallType}/${companyId}?disId=${distributorId}`;

	window.location.href = redirectUri;
}

/**
 * 判断是否是微信客户端
 * @return boolean
 */
util.isWeixinPage = () => {
	let ua = navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == "micromessenger") {
		return true;
	} else {
		
		if (process.env.NODE_ENV === 'development') {
			return true;
		} else {
			return false;
		}
		
	}
}

/**
 * 如果不是微信客户端，则跳到提示页
 * @param  object router 路由
 * @return null
 */
util.goErrorPage = (router) => {

	if (!util.isWeixinPage()) {
		router.push({
			path: '/error',
			query: {
				errorMsg: '请使用微信客户端浏览'
			}
		});
	}
}

/**
 * 添加当前页到路径
 * @param  object that 当前组件
 * @param  string path 当前页路径
 * @param  number type 类型，1为添加路径到数组，0为清空当前路径数组
 * @return null
 */
util.addPath = (path, type) => {
	let session = window.sessionStorage;
	let pathArr = [];
	// debugger;
	
	if (type === 1) {
		if (session.getItem('path')) {
			
			pathArr = JSON.parse(session.getItem('path'));

			if (!pathArr.includes(path)) {
				pathArr.push(path);
				session.setItem('path', JSON.stringify(pathArr));
			}

		} else {

			pathArr.push(path);
			session.setItem('path', JSON.stringify(pathArr));
		}
	} else if (type === 0) {

		session.removeItem('path');
		
		pathArr.push(path);
		session.setItem('path', JSON.stringify(pathArr));
		
	}
}

util.arrLen = (arr, element) => {
	let length = 0;

	for (let i = 0 ,len = arr.length; i < len; i++) {
		if (arr[i] === element) {
			length++;
		}
	}

	return length;
}

/**
 * 获取路径数组
 * @return stromg 	当前路径
 */
util.getPath = () => {
	let session = window.sessionStorage;
	let pathArr = []
	let path = '';

	if (session.getItem('path')) {
		pathArr = JSON.parse(session.getItem('path'));
		path = pathArr[pathArr.length - 2];
		pathArr.pop();

		session.setItem('path', JSON.stringify(pathArr));
	}

	// debugger;

	return path;
}

util.transformDirection = (that, direction, keepAlive) => {
	let timer = null;

	that.$store.commit('updateDirection', direction);
	that.$store.commit('updateKeepAlList', keepAlive);

	return new Promise((resolve, reject) => {
		timer = setTimeout(() => {
			resolve();
		}, 1);
	});
}


util.commonFunc = async (that) => {

	// 设置用户信息
	await setUserSessionInfor(that, that.$store);

	util.goErrorPage(that.$router);

}

/**
 * 加载图片
 * @param  object 	dom 	dom元素
 * @return null
 */
util.loadImage = (src) => {
	return new Promise((resolve, reject) => {
		var image = new Image();
		image.onload = () => {
			resolve();
		}
		image.src = src;
	});
}

/**
 * 检查接口，处理不同状态的行为
 * @param  object    	that     		组件对象
 * @param  object    	res      		接口响应的数据
 * @param  object    	object     		其它参数
 * @param  function  	callback 		超时回调
 * @param  {...type} 	args     		参数
 * @return null
 */
util.checkStatus = (that, res, object, callback, ...args) => {

	if (res.code === statusCode.TIME_INVALID) {

		// 更新时间
		util.updateSessionKeys(that.$store);
		callback(args[0], args[1], args[2], args[3]);

	} else if (res.code === statusCode.USER_DATA_INVALID || res.code === statusCode.USER_DATA_ABNORMAL) {

		// 重定向重新获取微信信息

		if (object.isComponent) {
			let isConfirm = true;
			let okType = util.updateWechatInfor;
			that.$emit('errorEvent', res.msg, okType, isConfirm);
		} else {
			that.showModel = true;
			that.isConfirm = true;
			that.okType = util.updateWechatInfor;
			that.errorTip = res.msg;
		}

		if (object.page === 'productDetail') {
			that.cancelBtnText = '取消';
			that.okBtnText = '确定';
		}

	} else if (res.code !== statusCode.NO_ERROR) {

		// 其它情况只提示信息

		if (object.isComponent) {
			that.$emit('errorEvent', res.msg);
		} else {
			that.showModel = true;
			that.isConfirm = false;
			that.errorTip = res.msg ? res.msg : res.content;
		}
	}
}

// 导出
export default util;