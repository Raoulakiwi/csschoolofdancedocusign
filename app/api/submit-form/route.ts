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

async function generatePDF(body: Record<string, unknown>): Promise<string> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 20
  const margin = 20
  const lineHeight = 7
  const sectionSpacing = 5

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y)
    return lines.length * (fontSize * 0.4)
  }

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPos = margin
    }
  }

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Caroline Small School of Dance', pageWidth / 2, yPos, { align: 'center' })
  yPos += 8
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Child Photography & Video Consent Form', pageWidth / 2, yPos, { align: 'center' })
  yPos += sectionSpacing + 5

  // Organisation Details
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Organisation Details', margin, yPos)
  yPos += lineHeight
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Organisation Name: Caroline Small School of Dance', margin, yPos)
  yPos += sectionSpacing + lineHeight

  // Child Details
  checkNewPage(30)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Child Details', margin, yPos)
  yPos += lineHeight
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  yPos += addText(`Child's Full Name: ${body.childName || '—'}`, margin, yPos, pageWidth - margin * 2)
  yPos += addText(`Date of Birth: ${body.childDOB || '—'}`, margin, yPos, pageWidth - margin * 2)
  yPos += addText(`Address: ${body.childAddress || '—'}`, margin, yPos, pageWidth - margin * 2)
  yPos += sectionSpacing

  // Parent/Guardian Details
  checkNewPage(30)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('2. Parent / Guardian Details', margin, yPos)
  yPos += lineHeight
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  yPos += addText(`Full Name: ${body.parentName || '—'}`, margin, yPos, pageWidth - margin * 2)
  yPos += addText(`Relationship to Child: ${body.relationshipToChild || '—'}`, margin, yPos, pageWidth - margin * 2)
  yPos += addText(`Phone: ${body.parentPhone || '—'}`, margin, yPos, pageWidth - margin * 2)
  yPos += addText(`Email: ${body.parentEmail || '—'}`, margin, yPos, pageWidth - margin * 2)
  yPos += sectionSpacing

  // Consent for Photography & Video
  checkNewPage(20)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('3. Consent for Photography & Video', margin, yPos)
  yPos += lineHeight
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const photographyConsent = body.photographyConsent === 'yes' 
    ? '✓ I DO give consent for my child to be photographed and/or videoed.'
    : body.photographyConsent === 'no'
    ? '✓ I DO NOT give consent for my child to be photographed and/or videoed.'
    : '—'
  yPos += addText(photographyConsent, margin, yPos, pageWidth - margin * 2)
  yPos += sectionSpacing

  // Use of Images and Video
  checkNewPage(20)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('4. Use of Images and Video', margin, yPos)
  yPos += lineHeight
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const useConsent = body.useOfImagesConsent 
    ? '✓ I consent to the use of my child\'s images and/or video for all of the purposes listed above.'
    : '—'
  yPos += addText(useConsent, margin, yPos, pageWidth - margin * 2)
  yPos += sectionSpacing

  // Duration of Consent
  checkNewPage(20)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('5. Duration of Consent', margin, yPos)
  yPos += lineHeight
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const duration = [
    body.durationCurrentYear && '✓ Applies for the current calendar year only',
    body.durationFullInvolvement && '✓ Applies for the duration of my child\'s involvement with the organisation',
    body.durationOther && (body.durationOtherText ? `✓ Other: ${body.durationOtherText}` : '✓ Other'),
  ].filter(Boolean).join('\n') || '—'
  yPos += addText(duration, margin, yPos, pageWidth - margin * 2)
  yPos += sectionSpacing

  // Safety Considerations
  checkNewPage(30)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('6. Medical / Safety Considerations', margin, yPos)
  yPos += lineHeight
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const safetyConcerns = body.safetyConcerns === 'yes' ? 'Yes' : 'No'
  yPos += addText(`Are there any legal, custody, or safety concerns regarding publication of your child's image? ${safetyConcerns}`, margin, yPos, pageWidth - margin * 2)
  if (body.safetyConcerns === 'yes' && body.safetyConcernsDetails) {
    yPos += addText(`Details: ${body.safetyConcernsDetails}`, margin, yPos, pageWidth - margin * 2)
  }
  yPos += sectionSpacing

  // Signature
  checkNewPage(40)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('7. Parent / Guardian Signature', margin, yPos)
  yPos += lineHeight
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const signature = body.signature
  const signatureType = body.signatureType
  
  if (signature && signatureType === 'draw' && typeof signature === 'string' && signature.startsWith('data:image')) {
    // Draw signature - embed image
    try {
      const imgData = signature
      const imgWidth = 80
      const imgHeight = 30
      doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight)
      yPos += imgHeight + 5
    } catch (err) {
      console.error('Error adding signature image:', err)
      doc.text('Signature: Provided (image)', margin, yPos)
      yPos += lineHeight
    }
  } else if (signature && signatureType === 'type' && typeof signature === 'string') {
    // Typed signature
    doc.setFont('helvetica', 'italic')
    yPos += addText(`Signature: ${signature}`, margin, yPos, pageWidth - margin * 2)
    doc.setFont('helvetica', 'normal')
  } else {
    doc.text('Signature: Not provided', margin, yPos)
    yPos += lineHeight
  }

  yPos += 5
  const submissionDate = body.submissionDate
    ? new Date(String(body.submissionDate)).toLocaleDateString('en-AU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : new Date().toLocaleDateString('en-AU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
  doc.text(`Date: ${submissionDate}`, margin, yPos)

  // Return PDF as base64 string
  // Use arraybuffer and convert to base64
  const arrayBuffer = doc.output('arraybuffer')
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString('base64')
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

    // School email is hardcoded as requested
    const schoolEmail = 'cs.schoolofdance@gmail.com'

    const resend = new Resend(resendApiKey)
    const body = (await request.json()) as Record<string, unknown>
    const childName = typeof body.childName === 'string' ? body.childName : 'Consent form'
    const parentEmail = typeof body.parentEmail === 'string' && body.parentEmail.includes('@') 
      ? body.parentEmail 
      : null

    // Generate PDF
    let pdfBase64: string
    try {
      pdfBase64 = await generatePDF(body)
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError)
      return NextResponse.json(
        { error: 'Failed to generate PDF document' },
        { status: 500 }
      )
    }

    const from = 'Caroline Small School of Dance <carolinesmall@wiland.com.au>'
    const emailHtml = buildEmailHtml(body)
    const pdfFilename = `Consent-Form-${childName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`

    // Prepare PDF attachment
    const pdfAttachment = {
      filename: pdfFilename,
      content: pdfBase64,
    }

    // Send to school (cs.schoolofdance@gmail.com)
    const schoolSubject = `New Photo Consent Form: ${childName}`
    const { data, error } = await resend.emails.send({
      from,
      to: schoolEmail,
      subject: schoolSubject,
      html: emailHtml,
      attachments: [pdfAttachment],
    })

    if (error) {
      console.error('Resend error (school email):', JSON.stringify(error, null, 2))
      return NextResponse.json(
        {
          error: 'Failed to send email to school',
          hint: 'On Resend free tier you can only send to the email you signed up with until you verify a domain. Set NOTIFICATION_EMAIL to that address, or verify your domain at resend.com.',
        },
        { status: 500 }
      )
    }

    // Send confirmation to parent with PDF
    if (parentEmail) {
      const parentHtml = `
        <p>Dear ${escapeHtml(String(body.parentName || 'Parent/Guardian'))},</p>
        <p>This confirms we have received your photo and video consent form for <strong>${escapeHtml(String(childName))}</strong>.</p>
        <p>Please find a copy of your completed consent form attached to this email for your records.</p>
        <p>If you have any questions or need to withdraw consent, please contact Caroline Small School of Dance.</p>
        <p>Best regards,<br>Caroline Small School of Dance</p>
      `
      const parentSubject = `Your Photo & Video Consent Form - Caroline Small School of Dance`
      const parentResult = await resend.emails.send({
        from,
        to: parentEmail,
        subject: parentSubject,
        html: parentHtml,
        attachments: [pdfAttachment],
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
