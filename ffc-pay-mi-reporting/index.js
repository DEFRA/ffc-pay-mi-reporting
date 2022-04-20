const { queryEntitiesByTimestamp, writeFile, connect } = require('./storage')
const buildMiReport = require('./mi-report')
const { reportName } = require('./config')

module.exports = async (context, miReportTimer) => {
  connect()
  const timeStamp = new Date().toISOString()
  context.log('Sourcing report data')
  const events = await queryEntitiesByTimestamp()
  if (events.length) {
    context.log('Report creation started')
    const csvData = buildMiReport(events)
    await writeFile(reportName, csvData)
    context.log('Report created')
  }

  if (miReportTimer.isPastDue) {
    context.log('Node is running late')
  }
  context.log('Node timer trigger function ran', timeStamp)
}
