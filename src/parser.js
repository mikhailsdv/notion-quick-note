class Parser {
	constructor({text, entities}) {
		this.text = text
		this.entities = entities
		this.blocks = []
		this.possibleAnotations = ["bold", "italics", "underline", "strikethrough", "code", "pre", "text_link", "url"]
	}

	_findBlock({offset, length}) {
		return this.blocks.find(item => item.offset === offset && item.length === length) || null
	}

	_pushBlock({block}) {
		const existingBlock = this._findBlock({
			offset: block.offset,
			length: block.length,
		})
		if (existingBlock) {
			existingBlock.annotations.push(...block.annotations)
		} else {
			const lastBlockIndex = this.blocks.length - 1
			const lastBlock = this.blocks[lastBlockIndex]
			if (lastBlock && lastBlock.offset === block.offset && lastBlock.length > block.length) {
				this.blocks = this.blocks.slice(0, lastBlockIndex)
				this.blocks.push(
					this._createBlock({
						annotations: lastBlock.annotations.concat(block.annotations),
						offset: block.offset,
						length: block.length,
						text: block.text,
					})
				)
				this.blocks.push(
					this._createBlock({
						annotations: lastBlock.annotations,
						offset: block.end,
						length: lastBlock.length - block.length,
						text: lastBlock.text.substring(block.length, lastBlock.length),
					})
				)
			} else {
				this.blocks.push(block)
			}
		}
	}

	_createBlock({offset, text, annotations, url}) {
		const length = text.length
		return {
			annotations: annotations.filter(item => this.possibleAnotations.includes(item)),
			offset,
			length,
			end: offset + length,
			text,
			url,
		}
	}

	parse() {
		if (this.entities) {
			this.entities.forEach((entity, index, entities) => {
				const prevEntity = entities[index - 1] || null
				entity.end = entity.offset + entity.length

				if (!prevEntity && entity.offset > 0) {
					this._pushBlock({
						block: this._createBlock({
							offset: 0,
							annotations: [],
							url: null,
							text: this.text.substring(0, entity.offset),
						}),
					})
				}

				if (prevEntity && prevEntity.end < entity.offset) {
					this._pushBlock({
						block: this._createBlock({
							offset: prevEntity.end,
							annotations: [],
							url: null,
							text: this.text.substring(prevEntity.end, entity.offset),
						}),
					})
				}

				this._pushBlock({
					block: this._createBlock({
						offset: entity.offset,
						annotations: [entity.type === "url" ? "text_link" : entity.type],
						url: entity.type === "text_link" ? entity.url : entity.type === "url" ? this.text.substring(entity.offset, entity.end) : null,
						text: this.text.substring(entity.offset, entity.end),
					}),
				})

				if (entities.length - 1 === index && entity.end < this.text.length && !this.blocks.find(item => item.end === this.text.length)) {
					this._pushBlock({
						block: this._createBlock({
							offset: entity.end,
							annotations: [],
							url: null,
							text: this.text.substring(entity.end, this.text.length),
						}),
					})
				}
			})
		} else {
			this._pushBlock({
				block: this._createBlock({
					offset: 0,
					annotations: [],
					text: this.text,
				}),
			})
		}

		return this.blocks
	}
}

module.exports = Parser
