# Deployment Guide - Step by Step

This guide will walk you through deploying your enrollment form to Vercel.

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Resend account (sign up at resend.com)
- [ ] Vercel account (sign up at vercel.com)
- [ ] Your document text ready to add

## Step 1: Add Your Document Text

Before deploying, you should add your actual enrollment agreement text.

### Edit the Form Display

1. Open `app/page.tsx`
2. Find the section around line 166 with this placeholder:

```tsx
<div className="prose prose-sm max-w-none p-6 bg-gray-50 rounded-lg border border-gray-200">
  <p className="text-gray-700 leading-relaxed">
    <strong>ENROLLMENT AGREEMENT</strong>
  </p>
  <p className="text-gray-700 leading-relaxed mt-4">
    [Your document text will appear here...]
  </p>
</div>
```

3. Replace with your actual document text, for example:

```tsx
<div className="prose prose-sm max-w-none p-6 bg-gray-50 rounded-lg border border-gray-200">
  <p className="text-gray-700 leading-relaxed">
    <strong>ENROLLMENT AGREEMENT</strong>
  </p>
  <p className="text-gray-700 leading-relaxed mt-4">
    Welcome to Caroline Small School of Dance. This enrollment agreement 
    outlines the terms and conditions...
  </p>
  <p className="text-gray-700 leading-relaxed mt-4">
    <strong>Payment Terms:</strong> Tuition is due on the first of each month...
  </p>
  <!-- Add as many paragraphs as you need -->
</div>
```

### Edit the PDF Generation

1. Open `app/api/submit-form/route.ts`
2. Find the section around line 56:

```typescript
addText('ENROLLMENT AGREEMENT', 14, true)
yPosition += 2

addText('[Your document text will appear here...]')
yPosition += 3
```

3. Replace with your actual document text:

```typescript
addText('ENROLLMENT AGREEMENT', 14, true)
yPosition += 2

addText('Welcome to Caroline Small School of Dance. This enrollment agreement outlines the terms and conditions...')
yPosition += 3

addText('PAYMENT TERMS', 12, true)
addText('Tuition is due on the first of each month...')
yPosition += 3

// Add all your document sections
```

**Important**: Make sure both the form display and PDF generation contain the same document text.

## Step 2: Get Your Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address
4. Navigate to "API Keys" in the dashboard
5. Click "Create API Key"
6. Give it a name (e.g., "Dance School Forms")
7. Copy the API key (you won't be able to see it again!)
8. Save it somewhere safe temporarily

**Free Tier Limits**: 
- 3,000 emails per month
- 100 emails per day
- Perfect for enrollment forms!

## Step 3: Push to GitHub

1. Initialize git repository (if not already done):
```bash
cd dance-school-forms
git init
git add .
git commit -m "Initial commit - Dance school enrollment form"
```

2. Create a new repository on GitHub:
   - Go to github.com
   - Click "New repository"
   - Name it "dance-school-forms" (or any name you prefer)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/dance-school-forms.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New..." → "Project"
4. Import your `dance-school-forms` repository
5. Configure your project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

6. **Add Environment Variable**:
   - Click "Environment Variables"
   - Name: `RESEND_API_KEY`
   - Value: [paste your Resend API key]
   - Click "Add"

7. Click "Deploy"
8. Wait 2-3 minutes for deployment to complete

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [Select your account]
# - Link to existing project? No
# - What's your project's name? dance-school-forms
# - In which directory is your code located? ./
# - Want to override settings? No

# Add environment variable
vercel env add RESEND_API_KEY

# When prompted, paste your Resend API key
# Select: Production, Preview, and Development

# Deploy to production
vercel --prod
```

## Step 5: Verify Deployment

1. Once deployed, Vercel will give you a URL like:
   `https://dance-school-forms.vercel.app`

2. Test the form:
   - Visit the URL
   - Fill out all required fields
   - Submit the form
   - Check both email addresses for the PDFs

## Step 6: Custom Domain (Optional)

If you want to use a custom domain like `forms.carolinesmallschoolofdance.com`:

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to update your DNS records
5. Wait for DNS propagation (usually 10-30 minutes)

## Step 7: Configure Production Emails

For production, you should verify your domain with Resend:

1. Go to your Resend dashboard
2. Click "Domains" → "Add Domain"
3. Enter your domain (e.g., `carolinesmallschoolofdance.com`)
4. Add the DNS records Resend provides to your domain host
5. Wait for verification (usually a few hours)

6. Update the email sender in `app/api/submit-form/route.ts`:

```typescript
// Change from:
from: 'Caroline Small School of Dance <onboarding@resend.dev>',

// To your verified domain:
from: 'Caroline Small School of Dance <forms@carolinesmallschoolofdance.com>',
```

7. Push the changes and Vercel will auto-deploy:
```bash
git add .
git commit -m "Update email sender"
git push
```

## Step 8: Final Testing

1. Submit a test enrollment from the live site
2. Verify emails arrive at:
   - cs.schoolofdance@gmail.com
   - The parent's email address
3. Check that PDFs are attached and formatted correctly
4. Test on mobile devices
5. Test both signature methods (draw and type)

## Monitoring & Maintenance

### Check Email Delivery

- Resend Dashboard: View all sent emails, delivery status, and errors
- URL: [resend.com/emails](https://resend.com/emails)

### Check Deployment Logs

- Vercel Dashboard: View deployment logs and errors
- Go to your project → "Deployments" → Click on a deployment

### Update Form Text

Whenever you need to update the document text:

1. Edit both `app/page.tsx` and `app/api/submit-form/route.ts`
2. Commit and push to GitHub
3. Vercel will automatically deploy the changes

## Troubleshooting

### "Emails not sending"

1. Check Resend dashboard for error messages
2. Verify RESEND_API_KEY is correctly set in Vercel
3. Check you haven't exceeded free tier limits
4. Ensure the school email cs.schoolofdance@gmail.com is correct

### "Form submission fails"

1. Check Vercel deployment logs
2. Open browser console to see error messages
3. Verify all required fields are filled
4. Check that signature is provided

### "PDF looks wrong"

1. Check the PDF generation code in `route.ts`
2. Verify document text is properly formatted
3. Test with shorter text to see if it's a length issue

## Need Help?

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Resend Documentation: [resend.com/docs](https://resend.com/docs)
- Next.js Documentation: [nextjs.org/docs](https://nextjs.org/docs)

---

**Congratulations!** Your enrollment form is now live and ready to accept enrollments! 🎉
