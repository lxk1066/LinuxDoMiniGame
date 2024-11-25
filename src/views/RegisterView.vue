<template>
  <!-- 注册 -->
  <div class="container">
    <div class="register">
      <div class="title">
        <span>注册</span>
      </div>
      <div class="form">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              @input="form.nickname = form.username"
            />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="form.nickname" placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="邀请码" prop="invitationKey">
            <el-input
              v-model="form.invitationKey"
              placeholder="请先获取邀请码"
              readonly
              style="width: 70%"
            />
            <el-button type="primary" size="small" style="margin-left: 10px" @click="goInviteCode"
              >获取</el-button
            >
          </el-form-item>
          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="验证码" prop="emailCode">
            <el-input v-model="form.emailCode" placeholder="请输入邮箱验证码" style="width: 70%" />
            <el-button type="primary" size="small" style="margin-left: 10px" @click="sendEmailCode">
              发送
            </el-button>
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
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              placeholder="请再次输入密码"
              show-password
              clearable
              type="password"
            />
          </el-form-item>

          <!-- 居中 -->
          <div class="register-box">
            <el-button type="primary" size="large" @click="register">注册</el-button>
            <!-- 去登录 -->
            <el-link class="login" :underline="false" @click="router.push('/signin')">
              去登录
            </el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElMessage } from 'element-plus'
import { register as registerApi, getRegisterEmailCode } from '@/api/user'

const formRef = ref<InstanceType<typeof ElForm>>()
const route = useRoute()
const router = useRouter()

const form = reactive({
  username: '',
  nickname: '',
  invitationKey: route.query.inviteCode as string,
  email: '',
  emailCode: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { validator: validatorUsername, trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 5, max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur' }
  ],
  invitationKey: [{ required: true, message: '邀请码不能为空', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validatorEmail, message: '请输入正确格式的邮箱', trigger: 'blur' }
  ],
  emailCode: [{ required: true, message: '邮箱验证码不能为空', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 12 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatorPassword, message: '两次输入的密码不一致', trigger: 'blur' }
  ]
}

function validatorUsername(rule: any, value: string, callback: any) {
  const reg = /^[a-zA-Z][a-zA-Z0-9]{4,19}$/
  if (!reg.test(value)) {
    return callback(new Error('用户名以字母开头，5-20位，可包含大小写字母和数字'))
  }
  callback()
}
function validatorEmail(rule: any, value: string, callback: any) {
  const reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
  if (!reg.test(value)) {
    return callback(new Error('请输入正确格式的邮箱'))
  }
  callback()
}
function validatorPassword(rule: any, value: string, callback: any) {
  if (value !== form.password) {
    return callback(new Error('两次输入的密码不一致'))
  }
  callback()
}

const goInviteCode = () => {
  router.push('/invite')
}

const sendEmailCode = async () => {
  // 发送邮箱验证码
  if (form.email && form.email.trim()) {
    const { data } = await getRegisterEmailCode({ email: form.email })
    if (data.code == 200) {
      ElMessage.success('邮箱验证码发送中，请注意查收')
    } else {
      if (data.message === '验证字段错误') {
        data.data.forEach((item: any) => {
          ElMessage.error(Object.values<string>(item.constraints)[0])
        })
      } else {
        ElMessage.error('邮箱验证码发送失败')
      }
    }
  } else {
    ElMessage.error('请输入邮箱地址')
  }
}

const register = () => {
  if (!formRef.value) return
  // 注册
  formRef.value?.validate(async (valid) => {
    if (valid) {
      // TODO: 注册
      console.log('form', form)

      try {
        const { data } = await registerApi(form)
        if (data.code == 200) {
          // 注册成功
          console.log('注册成功')
          ElMessage.success('注册成功')
          // 跳转到首页
          router.push('/signin')
        } else {
          // 注册失败
          if (data.message === '验证字段错误') {
            data.data.forEach((item: any) => {
              ElMessage.error(Object.values<string>(item.constraints)[0])
            })
          }
          ElMessage.error(data.message)
        }
      } catch (error) {
        console.log(error)
        ElMessage.error('注册失败')
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

  .register {
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

      .register-box {
        display: flex;
        width: 100%;
        flex-direction: column;
        justify-content: center;

        .login {
          margin-top: 10px;
        }
      }
    }
  }
}
</style>
