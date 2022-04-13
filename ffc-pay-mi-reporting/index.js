const { queryEntitiesByTimestamp } = require('./storage')
const buildMiReport = require('./mi-report')

module.exports = async (context, miReportTimer) => {
  const timeStamp = new Date().toISOString()
  const events = await queryEntitiesByTimestamp()
  console.log(buildMiReport(events))

  if (miReportTimer.isPastDue) {
    context.log('Node is running late!')
  }

  context.log('Node timer trigger function ran!', timeStamp)
}
