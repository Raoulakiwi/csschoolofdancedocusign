# Caroline Small School of Dance - Photo & Video Consent Form Platform

A professional, DocuSign-style photo and video consent form platform built specifically for Caroline Small School of Dance. Parents can fill out comprehensive consent details, provide digital signatures, and automatically receive PDF copies via email.

## Features

- ✅ Professional, responsive design with school branding
- ✅ Comprehensive consent form matching your document exactly
- ✅ Organisation, child, and parent/guardian information collection
- ✅ Detailed consent options for photography and video recording
- ✅ Multiple use case permissions (social media, website, promotional materials, etc.)
- ✅ Duration of consent options
- ✅ Safety considerations section
- ✅ Dual signature options: draw or type
- ✅ Automatic date stamping
- ✅ PDF generation with complete form data
- ✅ Email delivery to both school and parent
- ✅ Full form validation
- ✅ Mobile-friendly interface
- ✅ Vercel-ready deployment

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Signature**: react-signature-canvas
- **Email**: Resend API
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+ installed
- A Resend account (free tier available)
- A Vercel account (free tier available)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
RESEND_API_KEY=your_resend_api_key_here
```

**Getting your Resend API Key:**
1. Sign up at [resend.com](https://resend.com)
2. Verify your email
3. Go to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env.local` file

**Important**: For production use, you'll need to verify your domain with Resend to send emails from your custom domain. For development/testing, you can use the default `onboarding@resend.dev` sender.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Vercel

### Method 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - Add `RESEND_API_KEY` with your Resend API key
6. Click "Deploy"

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add your environment variables when asked
```

### Post-Deployment Steps

1. **Set up custom domain** (optional):
   - Go to your project settings in Vercel
   - Add your custom domain
   
2. **Configure Resend for production**:
   - Verify your domain in Resend dashboard
   - Update the `from` email in `app/api/submit-form/route.ts`:
   ```typescript
   from: 'Caroline Small School of Dance <forms@yourdomain.com>',
   ```

3. **Test the form**:
   - Submit a test enrollment
   - Verify emails are received by both addresses

## Email Configuration

The system sends two emails upon form submission:

1. **To the school** (`cs.schoolofdance@gmail.com`):
   - Subject: "New Photo Consent Form: [Child Name]"
   - Contains all form details including consent selections
   - Includes PDF attachment

2. **To the parent/guardian**:
   - Subject: "Your Photo & Video Consent Form - Caroline Small School of Dance"
   - Confirmation message with consent summary
   - Includes PDF attachment for their records
   - Reminder about withdrawal rights

## Form Sections

The form includes all sections from your consent document:

**Organisation Details:**
- School Address, Phone, Email (all required)

**1. Child Details:**
- Child's Full Name
- Date of Birth  
- Address

**2. Parent/Guardian Details:**
- Full Name
- Relationship to Child
- Phone
- Email

**3. Consent for Photography & Video:**
- Photographed (checkbox)
- Video recorded (checkbox)
- At least one must be selected

**4. Use of Images and Video:**
- Social media (Facebook, Instagram, YouTube)
- Organisation website
- Promotional materials
- Advertising campaigns
- Newsletters
- Media releases
- At least one must be selected
- Includes understanding statements

**5. Duration of Consent:**
- Current calendar year only
- Full duration of involvement
- Other (with text field)
- Exactly one must be selected

**6. Medical/Safety Considerations:**
- Yes/No radio buttons
- Text area for details if "Yes"

**7. Declaration:**
- Automatic confirmation statements
- Signature (drawn or typed)
- Auto-dated

## Signature Options

Users can choose between two signature methods:

1. **Draw Signature**: 
   - Draw directly on the canvas with mouse/touch
   - Clear and redraw option available

2. **Type Signature**: 
   - Type full name in cursive-style font
   - Legally binding digital signature

## PDF Generation

The generated PDF includes:
- Professional header with school branding
- Complete document text
- All form responses
- Signature (embedded image or typed)
- Automatic date stamping
- Checkbox indicators

## Security & Privacy

- All data is transmitted securely via HTTPS
- No data is stored on the server (stateless)
- PDFs are generated on-demand and sent directly via email
- API keys are stored as environment variables

## Customization Options

### Colors & Branding

Edit the Tailwind classes in `app/page.tsx` to match your brand:

```tsx
// Purple theme (current)
className="bg-purple-600 text-white"

// Change to your brand colors
className="bg-pink-600 text-white"
```

### Form Fields

To add additional fields, edit `app/page.tsx`:

1. Add to the `formData` state
2. Create the input element
3. Update the API route in `app/api/submit-form/route.ts` to include the new field in the PDF

## Troubleshooting

### Emails not sending

- Check that your `RESEND_API_KEY` is correctly set
- Verify your Resend account is active
- Check Resend logs for error messages
- Ensure you haven't exceeded free tier limits (3,000 emails/month)

### Signature not appearing in PDF

- Check browser console for errors
- Ensure the signature canvas is not empty when submitting
- Verify the signature data is being passed to the API

### PDF not generating

- Check server logs in Vercel dashboard
- Ensure jsPDF is properly installed
- Verify the PDF generation code doesn't have syntax errors

## Support

For issues or questions:
- Email: cs.schoolofdance@gmail.com
- Check Vercel deployment logs for errors
- Review Resend dashboard for email delivery status

## License

Private use for Caroline Small School of Dance.

---

Built with ❤️ for Caroline Small School of Dance
