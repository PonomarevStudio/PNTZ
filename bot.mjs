import {readFileSync} from "fs"
import TeleBot from "telebot"
import Subscriber from "./subscriber.mjs"

const messages = JSON.parse(readFileSync('./messages.json').toString())

export class Bot extends TeleBot {
    constructor(...args) {
        super(...args)
        this.on('/start', msg =>
            messages.intro.forEachAsync(msg.reply.text).then(this.handleSubscriberState.bind(this, msg)))
        this.on('*', msg => this.constructor.isCommand(msg.text) ? null :
            msg.reply.text(messages.echo).then(this.handleSubscriberState.bind(this, msg)))
        this.mod('message', data => {
            if (this.constructor.isCommand(data.message.text))
                data.message.payload = data.message.text.split(' ').splice(1).join(' ')
            return data;
        });
    }

    static isCommand = text => text && text[0] === '/'

    async handleSubscriberState({chat: chatData}) {
        const subscriber = await new Subscriber(chatData)
        return await messages._broadcastFeed.filter(item => !subscriber.data[item]).forEachAsync(async item =>
            await subscriber.set(item, true) && await this.handleMessageTask(subscriber.data.id, messages[item]))
    }

    async handleMessageTask(chatId, message) {
        const queue = Array.isArray(message) ? message : [message]
        return queue.forEachAsync(async message => {
            let args = [],
                method = 'sendMessage'
            if (typeof message === 'object') {
                if (message._method && this[message._method]) method = message._method
                if (message._args && Array.isArray(message._args)) args = message._args
            } else args.push(message)
            await this[method](chatId, ...args)
        })
    }
}

Array.prototype.forEachAsync = async function (fn = t => t()) {
    for (let t of this) await fn(t)
}

export default new Bot(process.env.TELEGRAM_BOT_TOKEN)
