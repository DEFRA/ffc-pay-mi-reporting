const { queryEntitiesByTimestamp, writeFile, connect } = require('./storage')
const buildReport = require('./mi-report')
const { reportName } = require('./config')

module.exports = async (context, miReportTimer) => {
  connect()
  const timeStamp = new Date().toISOString()
  context.log('Sourcing report data')
  const events = await queryEntitiesByTimestamp()
  if (events.length) {
    context.log('Report creation started')
    const csvData = buildReport(events)
    await writeFile(reportName, csvData)
    context.log('Report created')
  }
  context.log('Node timer trigger function ran', timeStamp)
}
