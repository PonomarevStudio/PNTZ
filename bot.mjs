import {readFileSync} from "fs"
import TeleBot from "telebot"
import Subscriber from "./subscriber.mjs"

const messages = JSON.parse(readFileSync('./bot/messages.json').toString())

export class Bot extends TeleBot {
    constructor(...args) {
        super(...args)
        this.on('/start', msg => messages.intro.forEachAsync(msg.reply.text).then(this.handleSubscriberState.bind(this, msg)))
        this.on('*', msg => this.constructor.isCommand(msg.text) ? null : msg.reply.text(messages.echo).then(this.handleSubscriberState.bind(this, msg)))
        this.mod('message', data => {
            if (this.constructor.isCommand(data.message.text)) data.message.payload = data.message.text.split(' ').splice(1).join(' ')
            return data;
        });
    }

    static isCommand = text => text && text[0] === '/'

    async handleSubscriberState({chat: chatData}) {
        const subscriber = await new Subscriber(chatData),
            handleMessageBroadcast = (subscriber, message) => this.handleMessageBroadcast(message, subscriber)
        return await messages._broadcastFeed.filter(item => !subscriber.data[item]).forEachAsync(handleMessageBroadcast.bind(this, subscriber))
    }

    async handleMessageBroadcast(message, subscriber) {
        return await subscriber.set(message, true) && await this.handleMessageTask(messages[message], subscriber.data.id)
    }

    async handleMessageTask(message, chatId) {
        const queue = Array.isArray(message) ? message : [message]
        return await queue.forEachAsync(async message => {
            let args = [], method = 'sendMessage'
            if (typeof message === 'object') {
                if (message._method && this[message._method]) method = message._method
                if (message._args && Array.isArray(message._args)) args = message._args
            } else args.push(message)
            return await this[method](chatId, ...args).catch(console.debug)
        })
    }

    async broadcast(message) {
        if (!message || !messages._broadcastFeed.includes(message)) throw Error('Wrong message');
        const subscribers = await Subscriber.subscribers.find({[message]: {$ne: true}}).toArray();
        await subscribers.forEachAsync(subscriber =>
            new Subscriber(subscriber).then(this.handleMessageBroadcast.bind(this, message)))
        return {message: messages[message], count: subscribers.length};
    }
}

Array.prototype.forEachAsync = async function (fn = t => t()) {
    for (let t of this) await fn(t)
}

export default new Bot({
    token: process.env.TELEGRAM_BOT_TOKEN,
    usePlugins: ['shortReply'],
    pluginFolder: '../../../bot/',
    buildInPlugins: false
})
