import request from 'supertest';
import app from '../../index';

describe('POST /api/send-email', () => {
  const testEmail = 'sanithjithnuka@gmail.com';

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should send an email successfully without attachments', async () => {
    const response = await request(app)
      .post('/api/send-email')
      .send({
        to: testEmail,
      })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Email sent successfully');
  });

  it.only('should send an email successfully with attachments', async () => {
    const response = await request(app)
      .post('/api/send-email')
      .attach('file', Buffer.from('Sample content'), 'testfile.txt')
      .field({
        to: testEmail,
      })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Email sent successfully');
  });

  it('should return 500 if there is an error sending the email', async () => {
    // Temporarily simulate an error
    const originalSendEmail = require('../../services/emailService').sendEmail;
    const mockSendEmail = jest.fn().mockRejectedValue(new Error('Simulated error'));
    require('../../services/emailService').sendEmail = mockSendEmail;

    const response = await request(app)
      .post('/api/send-email')
      .send({
        to: testEmail,
      })
      .expect(500);

    expect(response.body).toHaveProperty('message', 'Failed to send email');

    // Restore original function
    require('../../services/emailService').sendEmail = originalSendEmail;
  });
});
