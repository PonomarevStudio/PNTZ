import bot from '../bot.mjs'
import {serializeError} from "serialize-error"

const isDev = process.env.VERCEL_ENV === 'development'

export default async ({query: {message}}, {json}) => json(isDev ? await bot.broadcast(message).catch(serializeError) : {isDev})
