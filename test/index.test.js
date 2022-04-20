const mockContext = require('./mock-context')
const mockTimer = require('./mock-timer')
const mockUpload = jest.fn()
jest.mock('@azure/storage-blob', () => {
  return {
    BlobServiceClient: {
      fromConnectionString: jest.fn().mockImplementation(() => {
        return {
          getContainerClient: jest.fn().mockImplementation(() => {
            return {
              createIfNotExists: jest.fn(),
              getBlockBlobClient: jest.fn().mockImplementation(() => {
                return {
                  upload: mockUpload
                }
              })
            }
          })
        }
      })
    }
  }
})
let mockEvents = []
jest.mock('@azure/data-tables', () => {
  return {
    odata: jest.fn(),
    TableClient: {
      fromConnectionString: jest.fn().mockImplementation(() => {
        return {
          listEntities: jest.fn().mockImplementation(() => {
            return mockEvents
          })
        }
      })
    }
  }
})
const generateReport = require('../ffc-pay-mi-reporting')

describe('report', () => {
  beforeEach(() => {
    mockEvents = [{
      partitionKey: 'partition',
      EventType: 'batch-processing',
      Payload: '{"type":"info","message":"Payment request created from batch file","data":{"filename":"SITIELM0003_AP_20220412114822998.dat","sequence":"0003","paymentRequest":{"sourceSystem":"SFIP","deliveryBody":"RP00","invoiceNumber":"SFI00036146","frn":"3000006147","marketingYear":"2022","paymentRequestNumber":1,"agreementNumber":"SIP003000006147","contractNumber":"SFIP036146","currency":"GBP","schedule":"Q4","dueDate":"2022-12-01","value":100,"correlationId":"000026c9-fb51-491b-9272-1ef6ccd68f15","invoiceLines":[{"schemeCode":"80001","accountCode":"SOS273","fundCode":"DRD10","description":"G00 - Gross value of claim","value":100}]}},"timestamp":"2022-04-14T10:34:46.241Z"}'
    }, {
      partitionKey: 'partition',
      EventType: 'payment-request-enrichment',
      Payload: '{"type":"info","message":"Payment request enriched","data":{"originalPaymentRequest":{"sourceSystem":"SFIP","deliveryBody":"RP00","invoiceNumber":"SFI00037229","frn":"3000007230","marketingYear":"2022","paymentRequestNumber":1,"agreementNumber":"SIP003000007230","contractNumber":"SFIP037229","currency":"GBP","schedule":"Q4","dueDate":"2022-12-01","value":100,"correlationId":"00001395-52e9-4606-8536-842e500e0f45","invoiceLines":[{"schemeCode":"80001","accountCode":"SOS273","fundCode":"DRD10","description":"G00 - Gross value of claim","value":100}]},"paymentRequest":{"sourceSystem":"SFIP","deliveryBody":"RP00","invoiceNumber":"S0037229SFIP037229V001","frn":"3000007230","marketingYear":"2022","paymentRequestNumber":1,"agreementNumber":"SIP003000007230","contractNumber":"SFIP037229","currency":"GBP","schedule":"Q4","dueDate":"01/12/2022","value":10000,"correlationId":"00001395-52e9-4606-8536-842e500e0f45","invoiceLines":[{"schemeCode":"80001","accountCode":"SOS273","fundCode":"DRD10","description":"G00 - Gross value of claim","value":10000}],"schemeId":2,"ledger":"AP"}},"timestamp":"2022-04-13T19:54:28.774Z"}'
    }]
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should write file to share', async () => {
    await generateReport(mockContext, mockTimer)
    expect(mockUpload).toHaveBeenCalled()
  })
})
