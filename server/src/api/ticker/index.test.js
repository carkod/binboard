import request from 'supertest'
import { apiRoot } from '../../config'
import express from '../../services/express'
import routes, { Ticker } from '.'

const app = () => express(apiRoot, routes)

let ticker

beforeEach(async () => {
  ticker = await Ticker.create({})
})

test('GET /ticker 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}`)
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /ticker/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`${apiRoot}/${ticker.id}`)
  expect(status).toBe(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(ticker.id)
})

test('GET /ticker/:id 404', async () => {
  const { status } = await request(app())
    .get(apiRoot + '/123456789098765432123456')
  expect(status).toBe(404)
})
