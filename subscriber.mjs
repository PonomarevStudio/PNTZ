import mongo from './db.mjs';

const defaultState = 'start';

export default class Subscriber {
    static subscribers = mongo.db("PNTZ").collection("Subscribers");

    constructor(data) {
        return this.init(data).then(() => this)
    }

    get state() {
        return this.data.state || defaultState;
    }

    set state(value) {
        return this.set('state', value);
    }

    async init(data) {
        const {id} = data;
        const subscribers = this.constructor.subscribers;
        const findSubscriber = async id => await subscribers.findOne({id})
        this.data = await findSubscriber(id) || await subscribers.insertOne(data).then(async () => await findSubscriber(id))
        if (!this.data.state) this.state = defaultState;
    }

    async set(field, value) {
        const id = this.data.id;
        this.data[field] = value;
        return await this.constructor.subscribers.updateOne({id}, {$set: {[field]: value}})
    }
}
