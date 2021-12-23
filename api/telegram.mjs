import bot from '../bot.mjs'
import mongo from '../db.mjs'

const log = mongo.db("PNTZ").collection("Log")

export default async ({body}, {json}) => console.debug(body.message) || await log.insertOne(body) &&
    await json(body && body.update_id ? await bot.receiveUpdates([body]) : {status: false})
