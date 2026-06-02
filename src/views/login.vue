<template>
<div class="container">
   <div class="title">
      <div class="back-home">
        <el-icon><Back/></el-icon>返回首页
      </div>
      <div class="title-text">
        <h2>登录您的账户</h2>
        <p>输入您的登录信息</p>
      </div>
    </div>
    <div class="form-container">
     <el-form
     ref="ruleFormRef"
     :model="formData"
     :rules="rules"
     label-position="top"
     >
     <el-form-item label="用户名或邮箱" prop="username">
       <el-input v-model="formData.username" size="large" placeholder="请输入用户名" />
     </el-form-item>
     <el-form-item label="密码" prop="password">
       <el-input v-model="formData.password" size="large" type="password" placeholder="请输入密码" show-password />
     </el-form-item>
     <el-button class="btn" size="large" type="primary" @click="submitForm">登录</el-button>
     </el-form>
     <div class="footer">
      <p>还没有账户？<router-link to="/auth/register">去注册</router-link></p>
     </div>
    </div>
</div>
</template>
<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { login } from '../api/admin';
import { useRouter } from 'vue-router';

const router = useRouter();
const ruleFormRef = ref(null);
const formData = reactive({
  username:'',
  password:''
});
const rules = reactive({
  username:[
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password:[
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
});
const submitForm = async () => {
  if (!ruleFormRef.value) return;

  const valid = await ruleFormRef.value.validate().catch(() => false);
  if (!valid) return;

  const data = await login(formData);
  if (!data.token) {
    ElMessage.error('登录失败');
    return;
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('userInfo', JSON.stringify(data.userInfo));
  if(data.userInfo.userType === 2) {
    router.push('/back/dashboard');
  } else {
    router.push('/user');
  }
};

      

</script>
<style lang="scss" scoped>
.container {
  width: 384px;
  .title {
    margin-bottom: 30px;
    .back-home {
      margin-bottom: 60px;
    }
    .title-text {
      text-align: center;
      h2 {
        font-size: 36px;
        margin-bottom: 10px;
      }
      p {
        font-size: 18px;
        color: #6b7280;
      }
    }
    
  }
  .form-container {
    margin-top:30px;
      .btn {
        width: 100%;
        margin-top: 40px;
      }
      .footer {
        padding: 30px;
        text-align: center;
       
    }
}
}
</style>
