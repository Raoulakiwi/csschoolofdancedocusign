import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  try {
    // Initialize Resend only when the route is called, not at build time
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const resend = new Resend(resendApiKey)
    const body = await request.json()

    const emailHtml = `
      <h2>New Consent Form Submission</h2>
      <p><strong>Name:</strong> ${body.fullName}</p>
      <p><strong>Email:</strong> ${body.email}</p>
      <p><strong>Phone:</strong> ${body.phone}</p>
      <p><strong>Date of Birth:</strong> ${body.dateOfBirth}</p>
      <p><strong>Guardian Name:</strong> ${body.guardianName || 'N/A'}</p>
      <p><strong>Guardian Relationship:</strong> ${body.guardianRelationship || 'N/A'}</p>
      
      <h3>Consent Given:</h3>
      <ul>
        <li>Medical Treatment: ${body.consentMedical ? 'Yes' : 'No'}</li>
        <li>Data Processing: ${body.consentData ? 'Yes' : 'No'}</li>
        <li>Photography: ${body.consentPhotography ? 'Yes' : 'No'}</li>
      </ul>
      
      <p><strong>Signature:</strong> ${body.signature ? 'Provided' : 'Not provided'}</p>
      <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
    `

    const { data, error } = await resend.emails.send({
      from: 'Consent Form <onboarding@resend.dev>',
      to: process.env.NOTIFICATION_EMAIL || 'your-email@example.com',
      subject: `New Consent Form - ${body.fullName}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
