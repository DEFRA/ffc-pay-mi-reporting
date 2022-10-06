const getLatestEvent = (data) => {
  const latestEvent = data.sort((a, b) => new Date(b.EventRaised) - new Date(a.EventRaised))[0]
  const latestEventData = latestEvent ? JSON.parse(latestEvent.Payload) : {}
  return { status: latestEventData.message, eventRaised: latestEvent.EventRaised }
}

module.exports = getLatestEvent
