import express from 'express'

const app = express()

app.get('/', (_req: any, res: any) => {
  res.json({ hello: 'world' })
})

export default app
