import Subscriber from '../subscriber.mjs'
import {serializeError} from "serialize-error"

export default async ({}, {json}) => json(await Subscriber.subscribers.find().count().then(subscribers =>
    ({subscribers})).catch(e => ({error: serializeError(e)})))
