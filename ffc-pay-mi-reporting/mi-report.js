const moment = require('moment')
const BATCH_PROCESSED_EVENT_TYPE = 'batch-processing'
const PAYMENT_REQUEST_ENRICHMENT_EVENT_TYPE = 'payment-request-enrichment'

const groupByPartitionKey = (events) => {
  return events.reduce((group, event) => {
    const { partitionKey } = event
    group[partitionKey] = group[partitionKey] ?? []
    group[partitionKey].push(event)
    return group
  }, {})
}

const convertToCSV = (data) => {
  let csv = ''
  csv = data.map(row => Object.values(row))
  csv.unshift(Object.keys(data[0]))
  return `"${csv.join('"\n"').replace(/,/g, '","')}"`
}

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

const getEvent = (data, eventType) => {
  return data.find(x => x.EventType === eventType)
}

const getLatestEvent = (data) => {
  const latestEvent = data.sort((a, b) => new Date(b.EventRaised) - new Date(a.EventRaised))[0]
  const latestEventData = latestEvent ? JSON.parse(latestEvent.Payload) : {}
  return { status: latestEventData.message, eventRaised: latestEvent.EventRaised }
}

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
    status: status,
    lastUpdated: formatDate(eventRaised, moment.ISO_8601)
  }
}

const buildMiReport = (events) => {
  const eventByCorrelation = groupByPartitionKey(events)
  const miParsedData = []
  for (const eventGroup in eventByCorrelation) {
    const eventData = eventByCorrelation[eventGroup]
    const parseData = parseEventData(eventData)

    if (Object.keys(parseData).length > 0) {
      miParsedData.push(parseData)
    }
  }

  return convertToCSV(miParsedData)
}

const formatDate = (dateToFormat, currentDateFormat = 'DD/MM/YYYY') => {
  if (dateToFormat) {
    return moment(dateToFormat, currentDateFormat).format('DD/MM/YYYY')
  }
  return 'Unknown'
}

module.exports = buildMiReport
