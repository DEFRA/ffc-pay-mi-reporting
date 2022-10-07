const getEvent = require('./get-event')

const BATCH_PROCESSED_EVENT_TYPE = 'batch-processing'
const PAYMENT_REQUEST_ENRICHMENT_EVENT_TYPE = 'payment-request-enrichment'

const getFirstEvent = (data) => {
  const eventData = getEvent(data, BATCH_PROCESSED_EVENT_TYPE) ?? getEvent(data, PAYMENT_REQUEST_ENRICHMENT_EVENT_TYPE)
  const event = eventData ? JSON.parse(eventData.Payload) : {}
  const paymentData = event.data?.paymentRequest
  return {
    id: eventData?.partitionKey,
    sequence: event.data?.sequence,
    batchExportDate: event.data?.batchExportDate,
    paymentData
  }
}

module.exports = getFirstEvent
