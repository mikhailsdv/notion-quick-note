# notion-quick-note

Notion-Telegram integration to quickly create notes from Telegram with formatting.

## Launch steps

1. Download and install [Node.js](https://nodejs.org/en/download/).
2. [Download project files](https://github.com/mikhailsdv/notion-quick-note/archive/main.zip) and extract them somewhere on your computer.
3. Open terminal (cmd.exe, PowerShell — any) from the root folder of the project and run:

```
npm i
```

Press Enter and wait until all the dependencies are installed (1-2 mins). On Windows to launch terminal you can open root folder of the project → click «File» on the top left corner → Windows PowerShell.

4. Find `/src/config.example.js` and rename it to `config.js`.
5. Go to [@BotFather](https://t.me/BotFather) and create your Telegram-bot. You will get your bot token at the end. Copy the token → open `/src/config.js` with any text editor → paste it after `BOT_TOKEN` between brakes and save.
6. Go to https://www.notion.so/my-integrations (you will be asked to login) → click «New integration» → give any name and click «Submit» → copy your Internal Integration Token → paste it after `NOTION_SECRET` between brakes and save.
7. Open Notion and create new page «Quick notes» → click «Share» → choose your integration from previous paragraph.
8. Launch you bot. There are a few options.

-   On Windows open `/src/start.cmd`.
-   On other OS open terminal from `/src/` and run `node index.js`.

If you want to stop your bot just close the terminal. To restart your bot it's enough to just repeat paragraph 6 of the instruction.

## Feedback

If you have any issues you can contact me via Telegram [@mikhailsdv](https://t.me/mikhailsdv) or open issue on GitHub.  
My Telegram-channel [@FilteredInternet](https://t.me/FilteredInternet).
