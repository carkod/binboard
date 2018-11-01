import mongoose, { Schema } from 'mongoose'

const orderSchema = new Schema({
  symbol: {
    type: String
  },
  orderId: {
    type: String
  },
  clientOrderId: {
    type: String
  },
  transactTime: {
    type: String
  },
  price: {
    type: String
  },
  origQty: {
    type: String
  },
  executedQty: {
    type: String
  },
  cummulativeQuoteQty: {
    type: String
  },
  status: {
    type: String
  },
  timeInForce: {
    type: String
  },
  type: {
    type: String
  },
  side: {
    type: String
  },
  fills: Array
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

orderSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      symbol: this.symbol,
      orderId: this.orderId,
      clientOrderId: this.clientOrderId,
      transactTime: this.transactTime,
      price: this.price,
      origQty: this.origQty,
      executedQty: this.executedQty,
      cummulativeQuoteQty: this.cummulativeQuoteQty,
      status: this.status,
      timeInForce: this.timeInForce,
      type: this.type,
      side: this.side,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Order', orderSchema)

export const schema = model.schema
export default model
