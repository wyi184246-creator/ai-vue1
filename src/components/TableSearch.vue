<template>
 <el-form ref="ruleFormRef" :model="formData"> 
  <el-row :gutter="24">
    <template v-for="item in formItemAttrs" :key="item.prop">
      <el-col v-bind="item.col">
      <el-form-item :label="item.label" :prop="item.prop">
  <el-select
    v-if="item.comp === 'select'"
    v-model="formData[item.prop]"
    :placeholder="item.placeholder"
  >
    <el-option
      v-for="option in item.options || []"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>

  <component
    v-else
    :is="isComp(item.comp)"
    v-model="formData[item.prop]"
    :placeholder="item.placeholder"
  />
</el-form-item>

      </el-col>
    </template>
  </el-row>
   <el-row>
     <el-button type="primary" @click="handleSearch">查询</el-button>
    <el-button @click="handleReset(ruleFormRef)">重置</el-button>
   </el-row>
   
  </el-form>
</template>
<script setup>

import{ref,reactive,computed} from 'vue';
const formData = reactive({});

const props = defineProps({
  formitem: {
    type: Array,
    default: () => []
  }
});
 const emit = defineEmits(['search']);
  const formItemAttrs= computed(() => {
    const {formitem} = props;
    formitem.forEach(item => {
     item.col={xs: 24, sm: 12, md: 8, lg: 6, xl: 6};
    });
    return formitem;
  });
 const isComp = (comp) => {
  return {
    input: 'el-input',
    select: 'el-select'
  }[comp] || 'el-input';
}
 const handleSearch = () => {
   emit('search', formData);
}; 
const ruleFormRef = ref(null);
const handleReset = (formEl) => {
  if (!formEl) return;
  formEl.resetFields();
  emit('search', formData);
};

</script>
<style lang="scss" scoped>
</style>