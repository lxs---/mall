// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import VueLazyload from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'
import {currency} from './util/money'

Vue.use(Vuex);
Vue.use(infiniteScroll);
Vue.config.productionTip = false;
Vue.use(VueLazyload, {
  loading: 'static/loading-svg/loading-bars.svg'
});
Vue.filter('currency', currency);

const store = new Vuex.Store({
  state: {
    nickName: '',
    cartCount: 0
  },
  mutations: {
    updateNickName(state, nickName) {
      state.nickName = nickName;
    },
    updateCartCount(state, num) {
      state.cartCount += num;
    }
  }
});
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: {App}
})
