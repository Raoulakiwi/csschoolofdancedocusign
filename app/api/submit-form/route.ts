import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { jsPDF } from 'jspdf'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      childName,
      childDOB,
      childAddress,
      parentName,
      relationshipToChild,
      parentPhone,
      parentEmail,
      schoolAddress,
      schoolPhone,
      schoolEmail,
      photographed,
      videoRecorded,
      useSocialMedia,
      useWebsite,
      usePromotional,
      useAdvertising,
      useNewsletters,
      useMediaReleases,
      durationCurrentYear,
      durationFullInvolvement,
      durationOther,
      durationOtherText,
      safetyConcerns,
      safetyConcernsDetails,
      signature,
      signatureType,
      submissionDate,
    } = data

    // Generate PDF
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - 2 * margin
    let yPosition = 20

    // Helper function to add text with wrapping
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      pdf.setFontSize(fontSize)
      if (isBold) {
        pdf.setFont('helvetica', 'bold')
      } else {
        pdf.setFont('helvetica', 'normal')
      }
      
      const lines = pdf.splitTextToSize(text, contentWidth)
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
        }
        pdf.text(line, margin, yPosition)
        yPosition += fontSize * 0.5
      })
      yPosition += 2
    }

    // Helper function for checkboxes
    const addCheckbox = (isChecked: boolean, label: string) => {
      pdf.setDrawColor(0, 0, 0)
      pdf.rect(margin, yPosition - 3, 4, 4)
      if (isChecked) {
        pdf.setLineWidth(0.5)
        pdf.line(margin, yPosition - 1, margin + 2, yPosition + 1)
        pdf.line(margin + 2, yPosition + 1, margin + 4, yPosition - 3)
      }
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(label, margin + 6, yPosition)
      yPosition += 6
    }

    // Header
    pdf.setFillColor(147, 51, 234) // Purple
    pdf.rect(0, 0, pageWidth, 35, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Caroline Small School of Dance', pageWidth / 2, 15, { align: 'center' })
    pdf.setFontSize(11)
    pdf.text('Child Photography & Video Consent Form', pageWidth / 2, 25, { align: 'center' })
    
    pdf.setTextColor(0, 0, 0)
    yPosition = 45

    // Organisation Details
    addText('ORGANISATION DETAILS', 12, true)
    addText(`Organisation Name: Caroline Small School of Dance`, 10, false)
    addText(`Address: ${schoolAddress}`)
    addText(`Phone: ${schoolPhone}`)
    addText(`Email: ${schoolEmail}`)
    yPosition += 5

    // 1. Child Details
    addText('1. CHILD DETAILS', 12, true)
    addText(`Child's Full Name: ${childName}`, 10, true)
    addText(`Date of Birth: ${new Date(childDOB).toLocaleDateString('en-AU')}`)
    addText(`Address: ${childAddress}`)
    yPosition += 5

    // 2. Parent/Guardian Details
    addText('2. PARENT / GUARDIAN DETAILS', 12, true)
    addText(`Full Name: ${parentName}`, 10, true)
    addText(`Relationship to Child: ${relationshipToChild}`)
    addText(`Phone: ${parentPhone}`)
    addText(`Email: ${parentEmail}`)
    yPosition += 5

    // 3. Consent for Photography & Video
    addText('3. CONSENT FOR PHOTOGRAPHY & VIDEO', 12, true)
    addText('I give permission for the above-named child to be:', 10, false)
    yPosition += 2
    addCheckbox(photographed, 'Photographed')
    addCheckbox(videoRecorded, 'Video recorded')
    addText('during activities, events, classes, programs, or related activities conducted by Caroline Small School of Dance.', 9, false)
    yPosition += 3

    // 4. Use of Images and Video
    addText('4. USE OF IMAGES AND VIDEO', 12, true)
    addText('I understand and agree that photographs and/or video recordings of my child may be used for the following purposes:', 10, false)
    yPosition += 2
    addCheckbox(useSocialMedia, 'Social media (e.g., Facebook, Instagram, YouTube)')
    addCheckbox(useWebsite, 'Organisation website')
    addCheckbox(usePromotional, 'Promotional materials (print and digital)')
    addCheckbox(useAdvertising, 'Advertising and marketing campaigns')
    addCheckbox(useNewsletters, 'Newsletters')
    addCheckbox(useMediaReleases, 'Media releases')
    yPosition += 2

    addText('I understand that:', 10, true)
    addText('- Images and video may be published online and may be accessible to the public.', 9, false)
    addText('- The organisation will not publish my child\'s full name without additional permission.', 9, false)
    addText('- The organisation will use images respectfully and in a manner consistent with its values and policies.', 9, false)
    addText('- I will not receive payment for the use of these images or recordings.', 9, false)
    yPosition += 3

    // 5. Duration of Consent
    addText('5. DURATION OF CONSENT', 12, true)
    addText('This consent:', 10, false)
    yPosition += 2
    addCheckbox(durationCurrentYear, 'Applies for the current calendar year only')
    addCheckbox(durationFullInvolvement, 'Applies for the duration of my child\'s involvement with the organisation')
    if (durationOther) {
      addCheckbox(true, `Other: ${durationOtherText}`)
    } else {
      addCheckbox(false, 'Other')
    }
    yPosition += 2
    addText('I understand that I may withdraw consent in writing at any time, however withdrawal will not affect materials already published.', 9, false)
    yPosition += 3

    // 6. Medical/Safety Considerations
    addText('6. MEDICAL / SAFETY CONSIDERATIONS', 12, true)
    addText('Are there any legal, custody, or safety concerns regarding publication of your child\'s image?', 10, false)
    yPosition += 2
    addCheckbox(safetyConcerns === 'no', 'No')
    if (safetyConcerns === 'yes') {
      addCheckbox(true, 'Yes')
      yPosition += 2
      addText(`Details: ${safetyConcernsDetails}`, 9, false)
    } else {
      addCheckbox(false, 'Yes')
    }
    yPosition += 5

    // 7. Declaration
    addText('7. DECLARATION', 12, true)
    addText('I confirm that:', 10, true)
    addText('- I am the parent or legal guardian of the above-named child.', 9, false)
    addText('- I have read and understood this consent form.', 9, false)
    addText('- I voluntarily agree to the photography and video recording of my child as outlined above.', 9, false)
    yPosition += 8

    // Signature
    addText('PARENT / GUARDIAN SIGNATURE', 12, true)
    yPosition += 2
    
    if (signatureType === 'draw') {
      try {
        // Add drawn signature
        pdf.addImage(signature, 'PNG', margin, yPosition, 80, 30)
        yPosition += 35
      } catch (error) {
        console.error('Error adding signature image:', error)
        addText(`Signature: ${parentName}`)
      }
    } else {
      // Add typed signature
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'italic')
      pdf.text(signature, margin, yPosition)
      yPosition += 12
    }
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    addText(`Printed Name: ${parentName}`)
    addText(`Date: ${new Date(submissionDate).toLocaleDateString('en-AU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`)

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    const pdfBase64 = pdfBuffer.toString('base64')

    // Format consent selections for email
    const consentTypes = []
    if (photographed) consentTypes.push('Photographed')
    if (videoRecorded) consentTypes.push('Video recorded')

    const useTypes = []
    if (useSocialMedia) useTypes.push('Social media')
    if (useWebsite) useTypes.push('Organisation website')
    if (usePromotional) useTypes.push('Promotional materials')
    if (useAdvertising) useTypes.push('Advertising campaigns')
    if (useNewsletters) useTypes.push('Newsletters')
    if (useMediaReleases) useTypes.push('Media releases')

    let duration = ''
    if (durationCurrentYear) duration = 'Current calendar year only'
    if (durationFullInvolvement) duration = 'Full duration of involvement'
    if (durationOther) duration = `Other: ${durationOtherText}`

    // Send email to school
    await resend.emails.send({
      from: 'Caroline Small School of Dance <onboarding@resend.dev>',
      to: 'cs.schoolofdance@gmail.com',
      subject: `New Photo Consent Form: ${childName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #9333ea; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Caroline Small School of Dance</h1>
            <p style="margin: 5px 0;">New Photo & Video Consent Form</p>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2 style="color: #9333ea;">Child Information</h2>
            <p><strong>Name:</strong> ${childName}</p>
            <p><strong>Date of Birth:</strong> ${new Date(childDOB).toLocaleDateString('en-AU')}</p>
            <p><strong>Address:</strong> ${childAddress}</p>
            
            <h2 style="color: #9333ea; margin-top: 20px;">Parent/Guardian Information</h2>
            <p><strong>Name:</strong> ${parentName}</p>
            <p><strong>Relationship:</strong> ${relationshipToChild}</p>
            <p><strong>Phone:</strong> ${parentPhone}</p>
            <p><strong>Email:</strong> ${parentEmail}</p>
            
            <h2 style="color: #9333ea; margin-top: 20px;">Consent Details</h2>
            <p><strong>Consent Given For:</strong> ${consentTypes.join(', ')}</p>
            <p><strong>Approved Uses:</strong> ${useTypes.join(', ')}</p>
            <p><strong>Duration:</strong> ${duration}</p>
            <p><strong>Safety Concerns:</strong> ${safetyConcerns === 'yes' ? `Yes - ${safetyConcernsDetails}` : 'No'}</p>
            
            <p style="margin-top: 20px;"><strong>Submission Date:</strong> ${new Date(submissionDate).toLocaleString('en-AU')}</p>
            
            <p style="margin-top: 20px; color: #666;">The complete signed consent form is attached as a PDF.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `consent_${childName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
          content: pdfBase64,
        },
      ],
    })

    // Send email to parent/guardian
    await resend.emails.send({
      from: 'Caroline Small School of Dance <onboarding@resend.dev>',
      to: parentEmail,
      subject: 'Your Photo & Video Consent Form - Caroline Small School of Dance',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #9333ea; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Caroline Small School of Dance</h1>
            <p style="margin: 5px 0;">Photo & Video Consent Form Confirmation</p>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <p>Dear ${parentName},</p>
            
            <p>Thank you for completing the photo and video consent form for <strong>${childName}</strong>.</p>
            
            <p>We have received your consent form with the following permissions:</p>
            <ul>
              <li><strong>Consent for:</strong> ${consentTypes.join(', ')}</li>
              <li><strong>Approved uses:</strong> ${useTypes.join(', ')}</li>
              <li><strong>Duration:</strong> ${duration}</li>
            </ul>
            
            <p>A copy of your signed consent form is attached to this email for your records.</p>
            
            <p style="margin-top: 20px; padding: 15px; background-color: #fff; border-left: 4px solid #9333ea;">
              <strong>Important:</strong> You may withdraw this consent at any time by contacting the school in writing. 
              Please note that withdrawal will not affect materials already published.
            </p>
            
            <p style="margin-top: 20px;">If you have any questions or concerns, please don't hesitate to contact us.</p>
            
            <p style="margin-top: 20px;">Best regards,<br>
            Caroline Small School of Dance</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `consent_${childName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
          content: pdfBase64,
        },
      ],
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully' 
    })

  } catch (error) {
    console.error('Error processing form:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process form submission' 
      },
      { status: 500 }
    )
  }
}
