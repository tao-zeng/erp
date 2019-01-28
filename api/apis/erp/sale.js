const defAPI = require('../../api')
const joi = require('joi')

module.exports = defAPI('SaleOrder', [
	defAPI.ruleSave(
		{
			discount: joi
				.number()
				.min(6)
				.max(10),
			discountPrice: joi.number().min(0),
			discountComment: joi.string(),
			pay: joi.number().min(0),
			score: joi.number(),
			payType: joi.string(),
			consumer: joi.string().uuid(),
			items: joi
				.array()
				.min(1)
				.items(
					joi.object({
						id: joi.string().uuid(),
						count: joi
							.number()
							.integer()
							.min(1)
							.required(),
						price: joi
							.number()
							.min(0)
							.required(),
						product: joi
							.string()
							.uuid()
							.required()
					})
				),
			comment: joi.string(),
			createRequires: 'discount,discountPrice,pay,score,payType,consumer,items'
		},
		{
			modelName: 'SaleOrder',
			name: '销售单',
			rels: {
				consumer: {
					lock: true,
					modelName: 'Consumer',
					fk: 'fk_consumer',
					name: '客户'
				},
				items: {
					modelName: 'SaleOrderItem',
					name: '物品清单',
					fk: 'fk_order',
					many: true,
					casecade: true,
					rels: {
						product: {
							lock: true,
							modelName: 'Product',
							fk: 'fk_product',
							name: '商品'
						}
					},
					saveParam(param, desc, ctx) {
						let stock = null
						const product = desc.getProduct().model,
							item = desc.model

						param.purchasePrice = product.purchasePrice

						if (!desc.id) {
							stock = product.stock - param.count
						} else if (param.count && param.count !== item.count) {
							stock = product.stock - (param.count - item.count)
						}
						if (stock !== null) {
							if (stock < 0) throw new Error(`商品 [${product.name}] 库存不足！`)
							product.stock = stock
						}
					},
					save(model, desc, ctx) {
						const product = desc.getProduct().model
						return product.save({ transaction: ctx.transaction })
					}
				}
			},
			save(model, desc, ctx) {
				model.price =
					Math.round(
						desc.getItems().reduce((sum, item) => sum + item.model.count * item.model.price, 0) * 100
					) / 100
			},
			create(model, desc, ctx) {
				const consumer = desc.getConsumer().model
				if (!consumer.disableScore)
					return consumer.update({ score: model.score }, { transaction: ctx.transaction })
				else model.score = 0
			}
		}
	),
	defAPI.list({}, (query, { model, models }) =>
		model.findAndCountAll(
			Object.assign(
				{
					include: [
						//{ model: models.SaleOrderItem, as: 'items' },
						{ model: models.Consumer, as: 'consumer' },
						{ model: models.User, as: 'user' }
					]
				},
				query
			)
		)
	),
	defAPI.info((id, { model, models }) =>
		model.findById(id, {
			include: [
				{ model: models.SaleOrderItem, as: 'items' },
				{ model: models.Consumer, as: 'consumer' },
				{ model: models.User, as: 'user' }
			]
		})
	),
	defAPI.del((id, { model, sequelize, models }) =>
		sequelize.transaction(transaction =>
			models.SaleOrderItem.destroy({
				where: { fk_order: id },
				transaction
			}).then(() => model.destroy({ where: { id }, transaction }))
		)
	)
])
