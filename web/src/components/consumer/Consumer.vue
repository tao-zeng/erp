<template>
  <Table
    ref="module"
    :title="title"
    api="consumers"
    :header="tableHeader"
    :editData="edit"
    :onEdit="onEdit"
    :onSave="onSave"
    :onEditEnd="onEditEnd"
  >

    <template slot="editor">
      <Form
        ref="editForm"
        :model="editData"
        :rules="editRule"
        :label-width="100"
      >
        <Form-item
          label="姓名"
          prop="name"
        >
          <Input v-model="editData.name"></Input>
        </Form-item>
        <Form-item
          label="会员卡号"
          prop="card"
        >
          <Input v-model="editData.card"></Input>
        </Form-item>
        <Form-item
          label="折扣"
          prop="discount"
        >
          <Input
            v-model="editData.discount"
            :number="true"
          >
          <span slot="append">折</span></Input>
        </Form-item>

        <Form-item
          label="积分"
          prop="score"
        >
          <Input
            v-model="editData.score"
            :number="true"
          ></Input>
        </Form-item>

        <Form-item
          label="禁用积分"
          prop="disableScore"
        >
          <i-switch v-model="editData.disableScore"></i-switch>
        </Form-item>

        <Form-item
          label="电话"
          prop="phone"
        >
          <Input v-model="editData.phone"></Input>
        </Form-item>
        <Form-item
          label="微信号"
          prop="weixin"
        >
          <Input v-model="editData.weixin"></Input>
        </Form-item>
        <Form-item
          label="备注"
          prop="comment"
        >
          <Input
            v-model="editData.comment"
            type="textarea"
          ></Input>
        </Form-item>
      </Form>
    </template>
  </Table>
</template>
<script>
import Table from '@/components/Table'
const title = '客户'
export default {
	data() {
		return {
			title,
			edit: null,
			editData: {},
			editRule: {
				name: [
					{ required: true, message: `${title}名称不能为空`, trigger: 'blur' },
					{ type: 'string', min: 3, message: `${title}名称不能少于3位`, trigger: 'blur' }
				],
				card: [],
				discount: [
					{
						required: true,
						type: 'number',
						min: 6,
						max: 10,
						message: `商品折扣: 6 折 ~ 10 折`,
						trigger: 'blur'
					}
				],
				phone: [],
				weixin: [],
				disableScore: [],
				score: [
					{
						required: true,
						type: 'number',
						min: 0,
						message: `请输入积分`,
						trigger: 'blur'
					}
				],
				comment: []
			},
			tableHeader: [
				{
					title: '姓名',
					key: 'name'
				},
				{
					title: '会员卡号',
					key: 'card'
				},
				{
					title: '积分',
					key: 'score'
				},
				{
					title: '电话',
					key: 'phone'
				},
				{
					title: '微信',
					key: 'weixin'
				},
				{
					title: '折扣',
					key: 'discount'
				}
			]
		}
	},
	methods: {
		onEdit(data) {
			this.setEdit(Object.assign({ discount: 8.8, score: 0, disableScore: false }, data))
		},
		onSave(data) {
			return new Promise((resolve, reject) => {
				this.$refs.editForm.validate(rs => {
					const data = this.editData
					rs
						? resolve(
								Object.keys(this.editRule).reduce(
									(obj, key) => ((obj[key] = data[key] === null ? undefined : data[key]), obj),
									{ id: data.id }
								)
						  )
						: reject()
				})
			})
		},
		onEditEnd() {
			this.setEdit()
			this.$refs.editForm.resetFields()
		},
		setEdit(data) {
			this.edit = data
			this.editData = data || {}
		}
	},
	components: {
		Table
	}
}
</script>