import md5 from '@/util/md5';
import util from '@/util/util';
import ip from '@/util/ipAddress';

/**
 * 设置头部信息
 * @param object context vuex上下文
 */
const setHeaderSessionInfor = (context, isClearSession = false) => {
	
	let sign = 'apiGugwe#kin23568'; 								// 约定密钥
	let companyId = util.getUrlParam('companyId'); 					// 企业ID
	let consumerId = util.getUrlParam('consumerId'); 				// 消费者ID
	let openid = util.getUrlParam('openid'); 						// 微信openid
	let companyOpenid = util.getUrlParam('companyOpenid'); 			// 企业openid
	let mallType = util.getUrlParam('mallType'); 					// 商品类型
	let containerId = util.getUrlParam('containerId'); 				// 商品类型
	let distributorId = util.getUrlParam('distributorId') || 0; 	// 分销商ID
	let goodsId = util.getUrlParam('goodsId'); 	// 商品id

	let session = window.sessionStorage;
	let localCookie = window.localStorage;
	let headerInfor = {};
	let timestamp = '';
	let url = `${ip}/shop/wx`;
	let redirectUri = `${url}/${mallType}/${companyId}?disId=${distributorId}`;

	// 重置headerInfor
	if (isClearSession) {
		session.removeItem('headerInfor');
	}

	/* 微信授权 start */
	
	if (!util.isWeixinPage()) {
		alert('请使用微信客户端浏览');
		return false;
	}

	// 问有没有钥匙
	// if (localCookie.getItem('companyOpenid')) {
		
	// 	// 要是有，再问钥匙是不是我给你的临时钥匙，或钥匙是不是专配的
	// 	if (localCookie.getItem('companyOpenid') == 1 || localCookie.getItem('companyOpenid') == companyOpenid) {
			
	// 		// 是临时或是专配的
	// 		timestamp = +(new Date());

	// 		headerInfor.mallType = mallType;
	// 		headerInfor.companyId = companyId;
	// 		headerInfor.consumerId = consumerId;
	// 		headerInfor.containerId = containerId;
	// 		headerInfor.openid = openid;
	// 		headerInfor.distributorId = distributorId;

	// 		headerInfor.sign = sign;
	// 		headerInfor.timestamp = timestamp;
	// 		headerInfor.keys = md5(headerInfor.openid + headerInfor.companyId + headerInfor.consumerId + headerInfor.sign + timestamp).toUpperCase();

	// 		session.setItem('headerInfor', JSON.stringify(headerInfor));
			
	// 		// 无论是临时钥匙还是专配钥匙，都变成专配的钥匙，以便下次进来不用去拿临时钥匙
	// 		localCookie.setItem('companyOpenid', companyOpenid);

	// 	} else {
			
	// 		// 即不是临时钥匙，也不是专配钥匙
	// 		window.location.href = redirectUri;
	// 	}
	// } else {

	// 	// 没有钥匙，给它一把临时钥匙
	// 	localCookie.setItem('companyOpenid', 1);
	// 	window.location.href = redirectUri;	
	// }

	/* 微信授权 end */

	/* 开发环境 start */
	
	timestamp = +(new Date());
	if (window.location.href.indexOf('signature') != -1) {
        headerInfor.mallType = mallType;
        headerInfor.companyId = companyId;
        headerInfor.consumerId = consumerId;
        headerInfor.containerId = containerId;
        headerInfor.openid = openid;
        headerInfor.distributorId = distributorId;
        headerInfor.goodsId = goodsId;

        headerInfor.sign = sign;
        headerInfor.timestamp = timestamp;
        headerInfor.keys = md5(headerInfor.openid + headerInfor.companyId + headerInfor.consumerId + headerInfor.sign + timestamp).toUpperCase();
        session.setItem('headerInfor', JSON.stringify(headerInfor));
	} else {
		var getHeader = JSON.parse(session.getItem('headerInfor'));
        headerInfor.mallType = getHeader.mallType;
        headerInfor.companyId = getHeader.companyId;
        headerInfor.consumerId = getHeader.consumerId;
        headerInfor.containerId = getHeader.containerId;
        headerInfor.openid = getHeader.openid;
        headerInfor.distributorId = getHeader.distributorId;
        headerInfor.goodsId = getHeader.goodsId;

        headerInfor.sign = getHeader.sign;
        headerInfor.timestamp = timestamp;
        headerInfor.keys = md5(getHeader.openid + getHeader.companyId + getHeader.consumerId + getHeader.sign + timestamp).toUpperCase();
        session.setItem('headerInfor', JSON.stringify(headerInfor));
	}

	/* 开发环境 end */


	context.commit('updateMallType', headerInfor.mallType);
	context.commit('updateCompanyId', headerInfor.companyId);
	context.commit('updateConsumerId', headerInfor.consumerId);
	context.commit('updateOpenid', headerInfor.openid);
	context.commit('updateContainerId', headerInfor.containerId);
	context.commit('updateDistributorId', headerInfor.distributorId);
	context.commit('updateGoodsId', headerInfor.goodsId);

	context.commit('updateSign', headerInfor.sign);
	context.commit('updateTimestamp', headerInfor.timestamp);
	context.commit('updateKeys', headerInfor.keys);

    var href = window.location.href.split('?');
    if (window.sessionStorage.getItem('headerInfor')) {
        if (href[1]) {
        	if (goodsId) {
                window.location.href = href[0] + '#/productDetail?goodsId=' + goodsId;
			} else {
                window.location.href = href[0];
			}
        }
    }
};

export default setHeaderSessionInfor;