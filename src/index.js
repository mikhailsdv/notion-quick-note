const config = require("./config")
const Parser = require("./parser")
const Converter = require("./converter")
const {extractTitle, log, arrEnd, trimMessage} = require("./utils")

const {Telegraf, Telegram} = require("telegraf")
const telegram = new Telegram(config.BOT_TOKEN)
const bot = new Telegraf(config.BOT_TOKEN)

const {Client} = require("@notionhq/client")
const notion = new Client({
	auth: config.NOTION_SECRET,
	timeoutMs: 8000,
})

bot.catch((err, ctx) => {
	log(`Error for ${ctx.updateType}`, err)
})

bot.start(async ctx => {
	ctx.reply(
		trimMessage(`
			Привет. С помощью этого бота можно делать быстрые заметки в Notion.

			Возможности бота:
			• Бот автоматически создает заголовок для заметки. Это либо первое предложение, либо первые 96 символов заметки. По такому заголовку можно прямо из меню понять, о чем заметка, не заходя в нее. Если заметка будет без текста, то в качестве заголовка будет сегодняшняя дата.
			• Если начать заметку с эмодзи, то оно будет использовано в качестве иконки заметки. Если эмодзи нет, то будет просто «📝».
			• Бот отлично понимает форматирование текста. Можно скормить боту текст с жирными, курсивными, моноширинными, зачеркнутыми или подчеркнутыми словами и он это все правильно распарсит. Ссылки и переносы строк тоже работают.
			• Можно присылать до одной фотографии с текстом или без. Фото тоже уйдет в заметку.

			Шорткат чата с ботом можно положить на главный экран и не ждать 7-8 секунд, пока запускает N.

			А теперь пришли мне любой текст.
	`)
	)
})

bot.on("message", async ctx => {
	const message = ctx.message
	const text = message.text || message.caption
	const photoUrl = message.photo ? await telegram.getFileLink(arrEnd(message.photo).file_id) : null

	if (!text && !photoUrl) {
		return ctx.reply(
			trimMessage(`
			❌ В этом сообщении нет текста или фото
		`)
		)
	}

	const entities = message.entities || message.caption_entities
	const messageId = message.message_id
	const chatId = ctx.chat.id
	const title = extractTitle({text, isPhoto: Boolean(photoUrl)})

	try {
		const children = []
		if (text) {
			const blocks = new Parser({
				text,
				entities,
			}).parse()
			children.push(
				...new Converter({
					blocks,
					breakParagraphs: true,
				}).convert()
			)
		}

		if (photoUrl) {
			children.unshift({
				type: "image",
				image: {
					type: "external",
					external: {
						url: photoUrl,
					},
				},
			})
		}

		const messageFromBot = await ctx.reply("💾 Сохраняю заметку...")

		const {results} = await notion.search()
		const parentPage = results.find(item => item.parent.type === "workspace")
		const {url} = await notion.pages.create({
			parent: {
				page_id: parentPage.id,
			},
			icon: {
				type: "emoji",
				emoji: title.emoji,
			},
			properties: {
				title: [
					{
						text: {
							content: title.text,
						},
					},
				],
			},
			children,
		})

		await telegram.editMessageText(chatId, messageFromBot.message_id, null, "✅ Заметка сохранена. Нажмите на кнопку, чтобы посмотреть.")
		await telegram.editMessageReplyMarkup(chatId, messageFromBot.message_id, null, {
			inline_keyboard: [
				[
					{
						text: "Открыть в Notion",
						url,
					},
				],
			],
		})
	} catch (err) {
		console.log(err)
		ctx.reply(
			trimMessage(`
			❌ Во время сохранения заметки произошла ошибка. Попробуй прислать тот же текст еще раз.
		`)
		)
	}
})

bot.launch()

//start - 😎 Начать
//hints - 💡 Советы
