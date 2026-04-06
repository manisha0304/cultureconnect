import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export async function sendWelcomeEmail(email, name) {
  try {
    // Skip if email credentials not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured. Skipping welcome email to:', email);
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"CultureConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to CultureConnect - Your Gateway to Indian Culture!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #ee7712 0%, #f19434 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #333; margin-top: 0; }
            .content p { color: #666; line-height: 1.6; }
            .button { display: inline-block; background: #ee7712; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            .features { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .features li { color: #555; padding: 8px 0; }
            .footer { background: #333; color: #999; padding: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to CultureConnect!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for joining CultureConnect - your one-stop destination for discovering and celebrating the rich cultural heritage of India!</p>
              
              <div class="features">
                <p><strong>With CultureConnect, you can:</strong></p>
                <ul>
                  <li>🎊 Explore festivals and events from all across India</li>
                  <li>👗 Get dress recommendations for every occasion</li>
                  <li>📞 Connect with trusted event managers</li>
                  <li>🏨 Find nearby hotels and accommodations</li>
                  <li>📍 Discover venues with integrated maps</li>
                  <li>💳 Book events securely with easy payments</li>
                </ul>
              </div>
              
              <p>Start exploring the vibrant traditions and celebrations of India today!</p>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Explore Events</a>
            </div>
            <div class="footer">
              <p>© 2024 CultureConnect. Celebrating India's Cultural Diversity.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

export async function sendBookingConfirmation(email, name, bookingDetails) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured. Skipping booking confirmation to:', email);
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"CultureConnect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Booking Confirmed - ${bookingDetails.eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .booking-card { background: #f9f9f9; border-radius: 12px; padding: 25px; margin: 20px 0; }
            .booking-card h3 { margin-top: 0; color: #333; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { color: #666; }
            .detail-value { color: #333; font-weight: 600; }
            .total { background: #ee7712; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
            .footer { background: #333; color: #999; padding: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Great news! Your booking has been confirmed. Here are the details:</p>
              
              <div class="booking-card">
                <h3>Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Booking ID</span>
                  <span class="detail-value">${bookingDetails.bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Event</span>
                  <span class="detail-value">${bookingDetails.eventName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date</span>
                  <span class="detail-value">${new Date(bookingDetails.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Venue</span>
                  <span class="detail-value">${bookingDetails.venue}</span>
                </div>
                <div class="total">
                  <strong>Total Paid: ₹${bookingDetails.amount?.toLocaleString('en-IN')}</strong>
                </div>
              </div>
              
              <p>If you have any questions, feel free to contact us. Have a wonderful celebration!</p>
            </div>
            <div class="footer">
              <p>© 2024 CultureConnect. Celebrating India's Cultural Diversity.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation sent to:', email);
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
}
