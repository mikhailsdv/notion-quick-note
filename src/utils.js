const trimMessage = str => str.replace(/\t+/gm, "")

const zeroFirst = s => {
	return `0${s}`.substr(-2)
}

const arrEnd = arr => (arr.length === 0 ? null : arr[arr.length - 1])

const getDateString = () => {
	const d = new Date()
	return `${zeroFirst(d.getDate())}.${zeroFirst(d.getMonth() + 1)}.${d.getFullYear()} ${zeroFirst(d.getHours())}:${zeroFirst(d.getMinutes())}:${zeroFirst(d.getSeconds())}`
}

const log = (...args) => console.log(`${getDateString()}:`, ...args)

const extractTitle = ({text, isPhoto}) => {
	const defaultEmoji = isPhoto ? "🖼" : "📝"
	const date = new Date()
	const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
	const defaultTitle = `${isPhoto ? "Фото" : "Заметка"} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} г.`
	if (!text) {
		return {
			text: defaultTitle,
			emoji: defaultEmoji,
		}
	}
	const fistSentenceMatch = text.match(/^(.+?)[\.\n]/)
	let title = fistSentenceMatch ? fistSentenceMatch[1] : text

	const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi
	const emojiMatch = title.match(emojiRegex)

	title = emojiMatch ? title.replace(emojiRegex, "") : title
	const maxLength = 96
	title = title.length > maxLength ? `${title.substring(0, 96).trim()}...` : title.trim() || defaultTitle

	return {
		text: title,
		emoji: emojiMatch ? emojiMatch[0] : defaultEmoji,
	}
}

module.exports = {
	trimMessage,
	zeroFirst,
	getDateString,
	arrEnd,
	log,
	extractTitle,
	arrEnd,
}
