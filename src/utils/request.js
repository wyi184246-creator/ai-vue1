import axios from "axios";
import { ElMessage } from "element-plus";
const service = axios.create({
  baseURL: '/api',
  timeout: 5000,
  withCredentials: true,
});
service.interceptors.request.use((config) => {
   const token = localStorage.getItem('token');
   if (token) {
     config.headers['token'] = token;
   }
  return config;
}, (error) => {
  // 处理请求错误
  return Promise.reject(error);
});

service.interceptors.response.use((response) => {
  // 处理响应数据
  const {data,config} = response;
  if(data.code ==='200'){return data.data;}
  else{
    if(data.code === '-1'){
      if(!config.url?.includes('/login')){
        ElMessage.error(data.msg || '登录过期，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/auth/login';
      }else{        ElMessage.error(data.msg || '登录失败');
        return Promise.reject('网络请求失败');
      }
    }
  }
  return response;
}, (error) => {
  // 处理响应错误
  return Promise.reject(error);
});
export default service;