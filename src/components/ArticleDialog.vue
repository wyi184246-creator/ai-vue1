<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEidt ? '编辑文章' : '新增文章'"
    width="900px"
    @close="handleClose"
    >
   <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
     <el-form-item label="文章标题" prop="title">
       <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="200" show-word-limit clearable/>
     </el-form-item>
     <el-form-item label="所属分类" prop="categoryId">
       <el-select v-model="formData.categoryId" placeholder="请选择所属分类">
         <el-option
           v-for="category in props.categories"
           :key="category.value"
           :label="category.label"
           :value="category.value"
         />
       </el-select>
     </el-form-item>
     <el-form-item label="文章摘要" prop="summary">
       <el-input v-model="formData.summary" type="textarea" placeholder="请输入文章摘要(可选)" maxlength="1000" show-word-limit :rows="4"/>
     </el-form-item>
      <el-form-item label="标签" prop="tags">
        <el-select v-model="formData.tagArray"  placeholder="请输入文章标签(逗号分隔)" multiple filterable allow-create style="width: 100%;">
        <el-option v-for="tag in commonTags" :key="tag" :label="tag" :value="tag"/>
        </el-select>
      </el-form-item>
      <el-form-item label="封面图片" >
        <div class="cover-upload">
          <el-upload
            class="avator-upload"
            action="#"
            @before-upload="beforeupload"
            :http-request="handleUploadRequest"
            accept="image/*"
            :show-file-list="false"
          >
           <div v-if="!imageUrl" class="cover-placeholder">
            <p>点击上传封面</p>
          </div>
          <img v-else :src="imageUrl" alt="封面图片" class="cover-image"/>
          </el-upload>
      <div v-if="imageUrl" class="cover-remove">
        <el-button type="danger" @click="handleRemove" >移除封面</el-button>
       </div>
     
        </div>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <rich-text-editor v-model="formData.content"
         placeholder="请输入文章内容，支持富文本格式/n/n可以使用加粗、斜体、列表等格式化功能"
         :max-char-count="5000"
         @change="handleContentChange"
         @created="handleEditorCreated"
         min-height="400px"
        />
      </el-form-item>
 </el-form>
 <div v-if="btnPreview">
  <h3>内容预览</h3>
  <div v-html="formData.content"></div>
 </div>
 <template #footer>
   <el-button @click="btnPreview=!btnPreview">{{ btnPreview ? '隐藏预览' : '预览效果' }}</el-button>
  <el-button @click="handleClose">取 消</el-button>
  <el-button type="primary" @click="handleSubmit" :loading="loading">{{ isEidt ? '更新文章' : '创建文章' }}</el-button>
 </template>
  </el-dialog>
</template>
<script setup>
import { ref,reactive,computed,nextTick,watch } from 'vue';
import { ElMessage } from 'element-plus';
import { uploadFile, createArticle, updateArticle } from '@/api/admin';
import { fileBaseUrl } from '@/config';
import { normalizeAssetUrl } from '@/utils/assetUrl';
import RichTextEditor from './RichTextEditor.vue';
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  article: {
    type: Object,
    default:null
  }
});
const emit = defineEmits(['update:modelValue','success']);
const modelValue = ref(false);
const handleClose = () => {
    formRef.value.resetFields();
    businessId.value = null;
    formData.tagArray = [];
    handleRemove();
    emit('update:modelValue', false);
}

const isEidt = computed(() => {
  return !!props.article?.id;
});
const dialogVisible = computed({
 get() {
   return props.modelValue;
 },
  set(val) {
   emit('update:modelValue', val);
  }
});
watch(() => props.article, (newArticle) => {
  if (newArticle) {
   nextTick(() => {
       Object.assign(formData,newArticle); 
     businessId.value = newArticle.id;
     imageUrl.value = normalizeAssetUrl(fileBaseUrl + newArticle.coverImage);
   })
    
}});

const formData = reactive({
  "title":'',
  "content":"",
  "coverImage":"",
  "categoryId":"",
  "summary":"",
  "tags":"",
  "id":""
});
const rules=reactive({
  title:[
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  categoryId:[
    { required: true, message: '请选择所属分类', trigger: 'blur' }
  ],
  summary:[
    { required: false, message: '请输入文章摘要', trigger: 'blur' }
  ],
  content:[
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    {max:5000, message: '文章内容不能超过5000字', trigger: 'blur' }
  ]
});
const commonTags = [
  '情绪管理', '焦虑', '抑郁', '压力', '睡眠', 
  '冥想', '正念', '放松', '心理健康', '自我成长',
  '人际关系', '工作压力', '学习方法', '生活技巧'
]
const beforeupload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isImage) {
    ElMessage.error('只能上传图片文件');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB');
    return false;
  }
  return true;
}
const businessId = ref('');
const handleUploadRequest = async ({ file }) => {
 businessId.value=crypto.randomUUID();
  const fileRes = await uploadFile(file, 
  { businessId:businessId.value });
  imageUrl.value = normalizeAssetUrl(fileBaseUrl + fileRes.filePath);
  formData.coverImage = fileRes.filePath;
}
const imageUrl = ref('');

const handleRemove = () => {
  imageUrl.value = '';
  formData.coverImage = '';
}
const handleContentChange = (data) => {
  formData.content = data.html;
}
const editorInstance = ref(null);
const handleEditorCreated = (editor) => {
  editorInstance.value = editor;
  if(formData.content&&editor){ {
    nextTick(() => {
      editor.setHtml(formData.content);
    });
  }
}
}
const btnPreview = ref(false);
const loading = ref(false);
const formRef = ref();
const handleSubmit =() => {
  formRef.value.validate( (valid,fields) => {
    if (valid) {
      loading.value = true;
  }
  const submitData = {
    ...formData,
    tags: formData.tagArray ? formData.tagArray.join(',') : ''
  }
  delete submitData.tagArray;
  if(!isEidt.value){
    submitData.id = businessId.value;
    createArticle(submitData).then(res => {
    loading.value = false;
    emit('success');
  
  });
  }else{
    updateArticle(props.article.id, submitData).then(res => {
      loading.value = false;
      emit('success');
    });
  }
  
  });
}
</script>
<style lang="scss" scoped>
.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 120px;
  flex-direction: column;
  color: #8b949e;
  background: #f6f8fa;
}
.cover-image {
  width: 200px;
  height: 120px;
  display: block;
}
</style>
