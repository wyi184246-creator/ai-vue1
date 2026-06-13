<template>
    <div class="frontend-layout">
    <div class="navbar-container">
     <div class="brand-section">
        <el-image style="width: 50px; height: 50px;" :src="iconUrl" alt="品牌logo" class="brand-logo"/>
        <h1 class="brand-name">心理健康AI助手</h1>
     </div>
     <div class="nav-section">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/consultation" class="nav-link" v-if="isLoggedIn">AI咨询</router-link>
        <router-link to="/emotion-diary" class="nav-link" v-if="isLoggedIn">情绪日记</router-link>
        <router-link to="/knowledge" class="nav-link">知识库</router-link>
        <el-button v-if="isLoggedIn" class="logout-btn" @click="handleLogout">退出登录</el-button>
        <template v-else>
          <router-link to="/auth/login" class="nav-link">登录</router-link>
          <router-link to="/auth/register" class="nav-link">
            <el-button type="primary">注册</el-button>
          </router-link>
        </template>
     </div>
    </div>
    <main class="frontend-main">
        <router-view/>
    </main>
    <div class="footer-container">
        <div class="footer-bottom">
            <p>&copy; 2026 心理健康AI助手. 保留所有权利</p>
        </div>
    </div>
    </div>
</template>
<script setup>
import { logout } from '../api/admin';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { storeToRefs } from 'pinia';
const  iconUrl =new URL('../assets/images/机器人.png',import.meta.url).href;

const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);

const router = useRouter();
const handleLogout = () => {
  logout().then(() => {
    userStore.clearUser();

   router.push('/auth/login');
  })
  
};

</script>
<style lang="scss" scoped>
.frontend-layout {
        background-color: #fff;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        .navbar-container {
            width: 100%;
            min-height: 70px;
            box-sizing: border-box;
            padding: 10px 48px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .brand-section {
                display: flex;
                align-items: center;
                flex-shrink: 0;
                .brand-name {
                    margin-left: 10px;
                    font-size: 24px;
                    font-weight: 600;
                    color: #333;
                }
            }
            .nav-section {
                display: flex;
                align-items: center;
                gap: 40px;
                margin-left: auto;
                .nav-link {
                    color: #4b5563;
                    font-size: 16px;
                    font-weight: 500;
                    &:hover {
                        color: #4A90E2;
                    }
                }
            }
        }
        .frontend-main {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .footer-container {
            background: #1f2937;
            color: white;
            padding: 15px 0;
            margin-top: auto;
            .footer-bottom {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 10px;
                text-align: center;
            }
        }
    }
</style>
