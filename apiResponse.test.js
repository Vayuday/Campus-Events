const {
  generateTicketId,
  generateQRData,
  verifyQRData
} = require('../../server/src/services/qr.service');

describe('QR Service Unit Tests', () => {
  it('should generate a valid ticket ID format', () => {
    const ticketId = generateTicketId();
    expect(ticketId).toBeDefined();
    expect(ticketId.startsWith('TKT-')).toBe(true);
    expect(ticketId.split('-').length).toBe(3); // TKT - TIMESTAMP - RANDOM
  });

  it('should generate valid JSON QR data', () => {
    const ticketId = 'TKT-123';
    const eventId = 'evt-abc';
    const userId = 'usr-xyz';
    
    const qrData = generateQRData(ticketId, eventId, userId);
    const parsed = JSON.parse(qrData);
    
    expect(parsed.ticketId).toBe(ticketId);
    expect(parsed.eventId).toBe(eventId);
    expect(parsed.userId).toBe(userId);
    expect(parsed.timestamp).toBeDefined();
  });

  it('should verify valid QR data correctly', () => {
    const validData = JSON.stringify({
      ticketId: '123',
      eventId: '456',
      userId: '789'
    });

    const result = verifyQRData(validData);
    expect(result.valid).toBe(true);
    expect(result.data.ticketId).toBe('123');
  });

  it('should fail verification for invalid QR data format', () => {
    const result = verifyQRData('not-a-json-string');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid QR code format');
  });

  it('should fail verification for missing fields', () => {
    const incompleteData = JSON.stringify({ ticketId: '123' }); // Missing eventId and userId
    const result = verifyQRData(incompleteData);
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid QR code data');
  });
});
