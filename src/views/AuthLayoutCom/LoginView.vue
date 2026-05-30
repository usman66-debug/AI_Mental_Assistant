<script setup>
import { ref } from 'vue'
import { loginApi } from '@/apis/admin'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})

const formData = ref({
  username: '',
  password: '',
})
const ruleFormRef = ref(null)

//表单提交
const submitForm = async () => {
  if (!ruleFormRef.value) {
    return
  }
  //validate方法会返回一个Promise，Promise的resolve方法会传递valid参数，valid表示当前表单校验状态
  await ruleFormRef.value.validate((valid) => {
    if (valid) {
      loginApi(formData.value).then((data) => {
        //如果后端未返回token，提示用户登录失败
        console.log(data)
        if (!data.token) {
          ElMessage.error(data.msg || '登录失败，请检查用户名或密码')
          return Promise.reject('登录失败')
        } else {
          ElMessage.success(data.msg || '登录成功')
          //将token存储到localStorage中
          localStorage.setItem('token', data.token)
          localStorage.setItem('userinfo', JSON.stringify(data.userInfo))
          if (data.userInfo.userType === 2) {
            router.push('/back')
          } else {
            router.push('/')
          }
          return Promise.resolve('登录成功')
        }
      })
    }
  })
}
</script>

<template>
  <div class="container">
    <div class="title">
      <div class="back-home">
        <el-icon><Back /></el-icon>
        <span>返回首页</span>
      </div>
      <div class="title-text">
        <h2>登录您的账户</h2>
        <p>请输入您的登录信息</p>
      </div>
    </div>
    <div class="form-container">
      <el-form :model="formData" ref="ruleFormRef" :rules="rules" label-position="top">
        <el-form-item label="用户名或邮箱" prop="username">
          <el-input
            v-model="formData.username"
            size="large"
            placeholder="请输入用户名或邮箱"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            size="large"
            placeholder="请输入密码"
            type="password"
            show-password
          ></el-input>
        </el-form-item>
        <el-button class="btn" size="large" type="primary" @click="submitForm">点击登录</el-button>
      </el-form>
      <div class="footer">
        <p>还没有账户？<router-link to="/auth/register">去注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 384px;
  .title {
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
    margin-top: 30px;
    .btn {
      margin-top: 40px;
      width: 100%;
    }
    .footer {
      text-align: center;
      padding: 30px;
    }
  }
}
</style>
