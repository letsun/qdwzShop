import api from '@/util/api';

const setUserSessionInfor = (that, store, isClearSession = true) => {
	return new Promise((resolve, reject) => {

		that.$http.get(api.users.userInfor,{
            headers: store.getters.getHeaders,
		}).then((response) => {
			let res = response.data;

			if (res.code === 200) {
				let session = window.sessionStorage;
				let userInfor = {};
				let user = res.data;

				// 重置headerInfor
				if (isClearSession) {
					session.removeItem('userInfor');
				}
				
				if (session.getItem('userInfor') !== null) {
					userInfor = JSON.parse(session.getItem('userInfor'));	
				} else {	
					userInfor.nickname = user.nickname;
					userInfor.headimgurl = user.headimgurl;
					userInfor.balanceScore = user.balanceScore;
					session.setItem('userInfor', JSON.stringify(userInfor));
				}

				store.commit('updateNickname', userInfor.nickname);
				store.commit('updateHeadimgurl', userInfor.headimgurl);
				store.commit('updateBalanceScore', userInfor.balanceScore);

				resolve();
				
			} else {
				// alert(res.msg);
				resolve(res.msg);
			}
		});


	});
}

export default setUserSessionInfor;