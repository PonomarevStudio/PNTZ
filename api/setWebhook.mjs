import bot from '../bot.mjs'
import {serializeError} from "serialize-error";

const isDev = process.env.VERCEL_ENV === 'development',
    webHookURL = host => `https://${host}/api/telegram.mjs`

export default async ({body: {url = undefined}, headers}, {json}) =>
    json(await bot.setWebhook(isDev && url ? url : webHookURL(headers['x-forwarded-host'])).catch(serializeError))
