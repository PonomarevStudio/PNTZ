import TeleBot from "telebot"

const intro = [`Приветствую Вас, я бортовой компьютер Первого Новотрубного Телепорта к Звездам. 
Совсем скоро, 23 декабря, мы совершим стыковку к ТМКс (Трубной металлургической космической станции). 
Здесь я поделюсь информацией и указаниями по подготовке к телепортации и стыковке 🚀🚀🚀`, `Следите за новостями и готовьтесь к полету вместе со мной!`],
    echo = 'Бортовой компьютер ПНТЗ взял ваш запрос в обработку'

export class Bot extends TeleBot {
    constructor(...args) {
        super(...args)
        this.on('text', msg => this.constructor.isCommand(msg.text) ? null : msg.reply.text(echo));
        this.on('/start', async msg => await intro.forEachAsync(msg.reply.text))
        this.mod('message', data => {
            if (this.constructor.isCommand(data.message.text))
                data.message.payload = data.message.text.split(' ').splice(1).join(' ')
            return data;
        });
    }

    static isCommand = text => text[0] === '/'
}

Array.prototype.forEachAsync = async function (fn) {
    for (let t of this) await fn(t)
}

export default new Bot(process.env.TELEGRAM_BOT_TOKEN)
