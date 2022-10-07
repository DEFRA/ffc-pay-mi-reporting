const convertToCSV = require('./convert-to-csv')
const groupByPartitionKey = require('./get-by-partition-key')
const parseEventData = require('./parse-event-data')

const buildReport = (events) => {
  const eventByCorrelation = groupByPartitionKey(events)
  const miParsedData = []
  for (const eventGroup in eventByCorrelation) {
    const eventData = eventByCorrelation[eventGroup]
    const parseData = parseEventData(eventData)

    if (Object.keys(parseData).length > 0) {
      miParsedData.push(parseData)
    }
  }
  return miParsedData.length > 0 ? convertToCSV(miParsedData) : ''
}

module.exports = buildReport
