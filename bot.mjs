import TeleBot from "telebot"

const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN), intro = [`Приветствую Вас, я бортовой компьютер Первого Новотрубного Телепорта к Звездам. 
Совсем скоро, 23 декабря, мы совершим стыковку к ТМКс (Трубной металлургической космической станции). 
Здесь я поделюсь информацией и указаниями по подготовке к телепортации и стыковке 🚀🚀🚀`, `Следите за новостями и готовьтесь к полету вместе со мной!`]

bot.on('/start', async msg => await intro.forEachAsync(msg.reply.text))

Array.prototype.forEachAsync = async function (fn) {
    for (let t of this) await fn(t)
}

export default bot
