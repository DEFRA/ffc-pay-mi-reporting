const moment = require('moment')
const formatDate = require('./format-date')
const getFirstEvent = require('./get-first-event')
const getLatestEvent = require('./get-latest-event')

const parseEventData = (eventData) => {
  const { id, sequence, paymentData, batchExportDate } = getFirstEvent(eventData)

  if (!paymentData) {
    return {}
  }

  const { status, eventRaised } = getLatestEvent(eventData)

  return {
    id,
    frn: paymentData.frn,
    claimNumber: paymentData.contractNumber,
    agreementNumber: paymentData.agreementNumber,
    schemeYear: paymentData.marketingYear,
    invoiceNumber: paymentData.invoiceNumber,
    preferredPaymentCurrency: paymentData.currency,
    paymentInvoiceNumber: paymentData.paymentRequestNumber,
    totalAmount: paymentData.value,
    batchId: sequence,
    batchCreatorId: paymentData.sourceSystem,
    batchExportDate: formatDate(batchExportDate),
    status,
    lastUpdated: formatDate(eventRaised, moment.ISO_8601)
  }
}

module.exports = parseEventData
