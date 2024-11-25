<template>
  <!-- 注册 -->
  <div class="container">
    <div class="login">
      <div class="goBack">
        <ElLink href="#" :underline="false"> &#60; 返回 </ElLink>
      </div>
      <div class="title">
        <span>登录</span>
      </div>
      <div class="form">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="验证码" prop="code">
            <el-input v-model="form.code" placeholder="请输入图形验证码" style="width: 50%" />
            <!-- 图形验证码 -->
            <div class="validateCode" @click="getCodeCaptcha" v-html="validateCodeUrl"></div>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              placeholder="请输入密码"
              show-password
              clearable
              type="password"
            />
          </el-form-item>

          <!-- 居中 -->
          <div class="login-box">
            <el-button type="primary" size="large" @click="handleLogin">登录</el-button>
            <!-- 去注册 -->
            <el-link class="register" :underline="false" @click="router.push('/signup')">
              去注册
            </el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElLink, ElMessage } from 'element-plus'
import { getCaptcha, login } from '@/api/user'

const formRef = ref<InstanceType<typeof ElForm>>()

const router = useRouter()
const validateCodeUrl = ref('')

onMounted(() => {
  // 获取图形验证码
  getCodeCaptcha()
})

const form = reactive({
  username: '',
  code: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  validateCode: [{ required: true, message: '验证码不能为空', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 12 个字符', trigger: 'blur' }
  ]
}

const getCodeCaptcha = () => {
  // 获取图形验证码
  getCaptcha().then((res) => {
    console.log(res)
    validateCodeUrl.value = res.data
  })
}

const handleLogin = () => {
  if (!formRef.value) return
  // 登录
  formRef.value?.validate(async (valid) => {
    if (valid) {
      // TODO: 登录
      console.log('form', form)

      try {
        const { data } = await login(form)
        if (data.code == 200) {
          // 登录成功
          console.log('登录成功')
          ElMessage.success('登录成功')
          // 跳转到首页
          router.push({
            path: '/login',
            query: {
              t: data.data.access_token
            }
          })
        } else {
          // 登录失败
          ElMessage.error(`${data.message}, ${data.data}`)
        }
      } catch (error) {
        console.log(error)
        ElMessage.error('登录失败')
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;

  box-sizing: border-box;
  padding: 20px;

  display: flex;
  justify-content: center;
  align-items: center;

  .login {
    width: 400px;
    min-height: 300px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px #ccc;
    padding: 30px;
    display: flex;
    flex-direction: column;

    .title {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      margin-bottom: 30px;

      img {
        width: 60px;
        height: 60px;
        margin-bottom: 10px;
      }
    }

    .form {
      width: 100%;

      .validateCode {
        margin-left: 10px;
        width: 150px;
        height: 40px;
      }

      .login-box {
        display: flex;
        width: 100%;
        flex-direction: column;
        justify-content: center;

        .register {
          margin-top: 10px;
        }
      }
    }
  }
}
</style>
