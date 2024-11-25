import axios from "axios";

import { token } from './token'

// 创建axios实例
const service = axios.create({
    // API的base_url
    baseURL: "http://192.168.21.218:48080",
    // 请求超时时间
    timeout: 5000
});


// 请求拦截器
service.interceptors.request.use(
    config => {
      // 获取本地存储的token
      if (token && !!token.length) {
        // 如果token存在，则统一在请求头加上token
        config.headers['Authorization'] = 'Bearer ' + token;
      }
      return config;
    },
    error => {
      // 请求错误处理
      return Promise.reject(error);
    }
);
   
export default service;
