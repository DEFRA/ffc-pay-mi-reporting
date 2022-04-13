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

const getEvent = (data) => {
  const eventData = data.find(x => x.EventType === 'batch-processing')
  const event = eventData ? JSON.parse(eventData.Payload) : {}
  const paymentData = event?.data?.paymentRequest
  return { id: eventData.partitionKey, sequence: event.data.sequence, paymentData }
}

const getLatestEvent = (data) => {
  const latestEvent = data.sort((a, b) => new Date(b.EventRaised) - new Date(a.EventRaised))[0]
  const latestEventData = latestEvent ? JSON.parse(latestEvent.Payload) : {}
  return { status: latestEventData.message, eventRaised: latestEvent.EventRaised }
}

const parseEventData = (eventData) => {
  const { id, sequence, paymentData } = getEvent(eventData)
  const { status, eventRaised } = getLatestEvent(eventData)

  return {
    id,
    frn: paymentData.frn,
    claimNumber: paymentData.contractNumber,
    agreementNumber: paymentData.agreementNumber,
    schemeYear: paymentData.marketingYear,
    invoiceNumber: paymentData.invoiceNumber,
    preferedPaymentCurrency: paymentData.currency,
    paymentInvoiceNumber: paymentData.paymentRequestNumber,
    totalAmount: paymentData.value,
    batchId: sequence,
    batchCreatorId: paymentData.sourceSystem,
    status: status,
    lastUpdated: eventRaised
  }
}

const buildMiReport = (events) => {
  const eventByCorrelation = groupByPartitionKey(events)
  const miParsedData = []

  for (const eventGroup in eventByCorrelation) {
    const eventData = eventByCorrelation[eventGroup]
    miParsedData.push(parseEventData(eventData))
  }

  return convertToCSV(miParsedData)
}

module.exports = buildMiReport
