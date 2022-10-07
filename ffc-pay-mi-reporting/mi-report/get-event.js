const getEvent = (data, eventType) => {
  return data.find(x => x.EventType === eventType)
}

module.exports = getEvent
