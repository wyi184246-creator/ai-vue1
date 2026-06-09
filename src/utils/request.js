import axios from "axios";
import { ElMessage } from "element-plus";
import { useUserStore } from "../stores/user";
const service = axios.create({
  baseURL: '/api',
  timeout: 5000,
  withCredentials: true,
});
service.interceptors.request.use((config) => {
   const userStore = useUserStore();
   if (userStore.token) {
     config.headers['token'] = userStore.token;
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
        useUserStore().clearUser();
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
