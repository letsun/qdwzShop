import Vue from 'vue'
import Vuex from 'vuex'

import setUserSessionInfor from '@/util/setUserSessionInfor';
import setHeaderSessionInfor from '@/util/setHeaderSessionInfor';

Vue.use(Vuex);

let store = new Vuex.Store({
	state: {
		direction: '',
		keepAlList: false,
		path: [],
		tabName: '',
		companyId: 0, 				// 企业ID
		distributorId: 0, 			// 分销商ID
        goodsId: 0, 			// 分销商ID
        goodsId2: 0, 			// 分销商ID
		consumerId: 0, 				// 消费者ID
		containerId: 0,				// 货柜ID
		openid: '', 				// 微信openid
		timestamp: '',				// 时间戳
		keys: '',					// md5密钥
		nickname: '', 				// 用户昵称
		headimgurl: '',				// 用户头像
		sign: '',					// 我们约定好的密钥
		mallType: 0, 				// 商品类型
		balanceScore: 0,			// 我的积分
		companyInformation: ''		// 企业信息
	},
	getters: {
		getHeaders(state) {
			let header = {
				mt: state.mallType,
				oi: state.openid,
				cpi: state.companyId,
				csi: state.consumerId,
				times: state.timestamp,
				s: state.keys
			};

			return header;
		}
	},
	mutations: {
		updateDirection(state, newValue) {
			state.direction = newValue;
		},
		updateKeepAlList(state, newValue) {
			state.keepAlList = newValue;
		},
		updatePath(state, newValue) {
			state.path = newValue;
		},
		updateTabName(state, newValue) {
			state.tabName = newValue;
		},
		updateMallType(state, newValue) {
			state.mallType = newValue;
		},
		updateCompanyId(state, newValue) {
			state.companyId = newValue;
		},
		updateDistributorId(state, newValue) {
			state.distributorId = newValue;
		},
        updateGoodsId(state, newValue) {
            state.goodsId = newValue;
        },
        updateGoodsId2(state, newValue) {
            state.goodsId2 = newValue;
        },
		updateConsumerId(state, newValue) {
			state.consumerId = newValue;
		},
		updateOpenid(state, newValue) {
			state.openid = newValue;
		},
		updateContainerId(state, newValue) {
			state.containerId = newValue;
		},
		updateNickname(state, newValue) {
			state.nickname = newValue;
		},
		updateHeadimgurl(state, newValue) {
			state.headimgurl = newValue;
		},
		updateSign(state, newValue) {
			state.sign = newValue;
		},
		updateTimestamp(state, newValue) {
			state.timestamp = newValue;
		},
		updateKeys(state, newValue) {
			state.keys = newValue;
		},
		updateBalanceScore(state, newValue) {
			state.balanceScore = newValue;
		},
		updateCompanyInformation(state, newValue) {
			state.companyInformation = newValue;
		}
	},
	actions: {
		async getInfor (context, isClearSession = false) {

			// 重置session
			if (isClearSession) {
				let session = window.sessionStorage;
				session.clear();
			}
			
			// 设置头部全局信息
			let headerSessionInfor = setHeaderSessionInfor(context);
			
		}
	}
});

export default store;