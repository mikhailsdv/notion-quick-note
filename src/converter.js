const isLastItem = (arr, index) => (arr.length === 0 ? true : arr.length - 1 === index)

class Converter {
	constructor({blocks, breakParagraphs}) {
		this.blocks = blocks
		this.breakParagraphs = breakParagraphs
	}

	_breakParagraphs() {
		this.blocks = this.blocks
			.map(block => {
				if (block.text.includes("\n")) {
					return block.text.split(/(?=[\n])|(?<=[\n])/g).map((item, index, arr) => {
						if (item === "\n") {
							return {
								annotations: ["break"],
								text: null,
							}
						} else {
							return {
								annotations: block.annotations,
								text: item,
								url: block.url,
							}
						}
					})
				} else {
					return block
				}
			})
			.flat()
		return this.blocks
	}

	_createParagraphBlock() {
		return {
			object: "block",
			type: "paragraph",
			paragraph: {
				text: [],
			},
		}
	}

	_addToParagraph(ParagraphBlock, TextBlock) {
		ParagraphBlock.paragraph.text.push(TextBlock)
		return ParagraphBlock
	}

	_createTextBlock(block) {
		if (block.annotations[0] === "break") {
			return {
				type: "text",
				annotations: {},
				text: {
					content: null,
				},
			}
		} else {
			return {
				type: "text",
				annotations: Object.fromEntries(block.annotations.filter(item => item !== "text_link").map(item => [item === "pre" ? "code" : item, true])),
				text: {
					content: block.text,
					link: block.annotations.includes("text_link")
						? {
								url: block.url,
						  }
						: null,
				},
			}
		}
	}

	convert() {
		let currentParagraphBlock = this._createParagraphBlock()
		const result = [currentParagraphBlock]
		this.breakParagraphs && this._breakParagraphs()
		this.blocks.forEach(block => {
			if (block.annotations[0] === "break") {
				currentParagraphBlock = this._createParagraphBlock()
				result.push(currentParagraphBlock)
			} else {
				this._addToParagraph(currentParagraphBlock, this._createTextBlock(block))
			}
		})
		return result
	}
}

module.exports = Converter
