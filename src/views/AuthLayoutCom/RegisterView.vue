<script setup>
import { ref } from 'vue'
import { register } from '@/apis/frontend'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  username: '',
  email: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
  gender: 0,
  userType: 1, //用户类型，默认是用户端
})

const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { max: 8, message: '用户名长度不能超过8位', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: '请输入正确的邮箱格式',
      trigger: 'blur',
    },
  ],
  nickname: [{ max: 8, message: '昵称长度不能超过8位', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度在6-16位之间', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*\d)[a-z0-9]{6,16}$/,
      message: '密码至少包含小写字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }],
})

// 提交表单
const submitFormRef = ref(null)
const submitForm = async () => {
  if (!submitFormRef.value) {
    return
  }

  await submitFormRef.value.validate((valid) => {
    if (!valid) {
      return
    }

    const submitData = { ...formData.value }
    if (!submitData.phone) {
      delete submitData.phone
    }
    if (!submitData.nickname) {
      delete submitData.nickname
    }
    register(submitData)
      .then((res) => {
        console.log(res)

        if (!res) {
          ElMessage.error('注册失败，用户名或邮箱可能已存在,或者密码不一致')
          return
        }

        ElMessage.success('注册成功')
        router.push('/auth/login')
      })
      .catch((err) => {
        console.log(err)
        //优先使用后端返回的错误信息
        const errorMsg = err.msg || err.message || '注册失败，请稍后重试'
        ElMessage.error(errorMsg)
      })
  })
}
</script>

<template>
  <div class="container">
    <div class="title">
      <div class="back-login" @click="router.push('/auth/login')">
        <el-icon><Back /></el-icon>
        <span>返回登录页</span>
      </div>
      <div class="title-text">
        <h2>创建您的账户</h2>
        <p>请填写注册信息</p>
      </div>
    </div>
    <div class="form-container">
      <el-form label-position="top" :model="formData" :rules="rules" ref="submitFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" size="large"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" size="large"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="formData.nickname"
            placeholder="请输入昵称（可选）"
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号（可选）"
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            placeholder="请输入密码"
            type="password"
            show-password
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            placeholder="请再次输入密码"
            type="password"
            show-password
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="btn" type="primary" size="large" @click="submitForm">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 384px;
  .flex-box {
    display: flex;
    align-items: center;
  }
  .title {
    .back-login {
      margin-bottom: 60px;
      cursor: pointer;
      transition: color 0.2s;
      &:hover {
        color: rgb(74, 156, 140);
      }
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
    margin-top: 30px;
    .btn {
      margin-top: 40px;
      width: 100%;
    }
    .footer {
      padding: 30px;
      text-align: center;
    }
  }
}
</style>
