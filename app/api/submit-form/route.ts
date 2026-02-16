import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function buildEmailHtml(body: Record<string, unknown>) {
  const childName = body.childName ?? '—'
  const childDOB = body.childDOB ?? '—'
  const childAddress = body.childAddress ?? '—'
  const parentName = body.parentName ?? '—'
  const relationshipToChild = body.relationshipToChild ?? '—'
  const parentPhone = body.parentPhone ?? '—'
  const parentEmail = body.parentEmail ?? '—'
  const photographyConsent = body.photographyConsent === 'yes' ? 'Yes' : body.photographyConsent === 'no' ? 'No' : '—'
  const useOfImagesConsent = body.useOfImagesConsent ? 'Yes' : 'No'
  const duration = [
    body.durationCurrentYear && 'Current calendar year only',
    body.durationFullInvolvement && 'Duration of involvement',
    body.durationOther && (body.durationOtherText ? `Other: ${body.durationOtherText}` : 'Other'),
  ].filter(Boolean).join('; ') || '—'
  const safetyConcerns = body.safetyConcerns === 'yes' ? 'Yes' : 'No'
  const safetyDetails = body.safetyConcernsDetails ? String(body.safetyConcernsDetails) : '—'
  const submissionDate = body.submissionDate
    ? new Date(String(body.submissionDate)).toLocaleString()
    : new Date().toLocaleString()

  return `
    <h2>New Photo & Video Consent Form Submission</h2>
    <h3>Child details</h3>
    <p><strong>Child's name:</strong> ${escapeHtml(String(childName))}</p>
    <p><strong>Date of birth:</strong> ${escapeHtml(String(childDOB))}</p>
    <p><strong>Address:</strong> ${escapeHtml(String(childAddress))}</p>
    <h3>Parent / Guardian</h3>
    <p><strong>Name:</strong> ${escapeHtml(String(parentName))}</p>
    <p><strong>Relationship:</strong> ${escapeHtml(String(relationshipToChild))}</p>
    <p><strong>Phone:</strong> ${escapeHtml(String(parentPhone))}</p>
    <p><strong>Email:</strong> ${escapeHtml(String(parentEmail))}</p>
    <h3>Consent</h3>
    <p><strong>Photography/video consent:</strong> ${photographyConsent}</p>
    <p><strong>Use of images consent:</strong> ${useOfImagesConsent}</p>
    <p><strong>Duration:</strong> ${escapeHtml(String(duration))}</p>
    <p><strong>Safety concerns:</strong> ${safetyConcerns}</p>
    ${safetyConcerns === 'Yes' ? `<p><strong>Safety details:</strong> ${escapeHtml(safetyDetails)}</p>` : ''}
    <p><strong>Signature:</strong> ${body.signature ? 'Provided' : 'Not provided'}</p>
    <p><strong>Submitted:</strong> ${submissionDate}</p>
  `
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error: RESEND_API_KEY is missing. Add it in Vercel → Project → Settings → Environment Variables.' },
        { status: 500 }
      )
    }

    const schoolEmail = process.env.NOTIFICATION_EMAIL
    if (!schoolEmail || schoolEmail === 'your-email@example.com') {
      console.error('NOTIFICATION_EMAIL is not set or is still the placeholder')
      return NextResponse.json(
        { error: 'Server configuration error: NOTIFICATION_EMAIL is not set. Add it in Vercel → Project → Settings → Environment Variables (e.g. your school email).' },
        { status: 500 }
      )
    }

    const resend = new Resend(resendApiKey)
    const body = (await request.json()) as Record<string, unknown>
    const childName = typeof body.childName === 'string' ? body.childName : 'Consent form'
    const parentEmail = typeof body.parentEmail === 'string' ? body.parentEmail : null

    const emailHtml = buildEmailHtml(body)
    const from = 'Caroline Small School of Dance <onboarding@resend.dev>'
    const subject = `New Photo Consent Form: ${childName}`

    // Send to school
    const { data, error } = await resend.emails.send({
      from,
      to: schoolEmail,
      subject,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        {
          error: 'Failed to send email',
          hint: 'On Resend free tier you can only send to the email you signed up with until you verify a domain. Set NOTIFICATION_EMAIL to that address, or verify your domain at resend.com.',
        },
        { status: 500 }
      )
    }

    // Optionally send confirmation to parent (same Resend call limits apply)
    if (parentEmail && parentEmail.includes('@') && parentEmail !== schoolEmail) {
      const parentHtml = `
        <p>Dear ${escapeHtml(String(body.parentName || 'Parent/Guardian'))},</p>
        <p>This confirms we have received your photo and video consent form for <strong>${escapeHtml(String(childName))}</strong>.</p>
        <p>Caroline Small School of Dance</p>
      `
      const parentResult = await resend.emails.send({
        from,
        to: parentEmail,
        subject: `Your Photo & Video Consent Form - Caroline Small School of Dance`,
        html: parentHtml,
      })
      if (parentResult.error) {
        console.error('Resend error (parent email):', JSON.stringify(parentResult.error, null, 2))
        // Don’t fail the request; school email already sent
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
