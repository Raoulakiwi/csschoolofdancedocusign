# Customization Guide

This guide shows you how to customize the enrollment form for your specific needs.

## Table of Contents

1. [Adding Your Document Text](#adding-your-document-text)
2. [Changing Colors & Branding](#changing-colors--branding)
3. [Adding/Removing Form Fields](#addingremoving-form-fields)
4. [Modifying Email Content](#modifying-email-content)
5. [Customizing the PDF Layout](#customizing-the-pdf-layout)

---

## Adding Your Document Text

### Where to Add Text

You need to update the document text in TWO places:

#### 1. Form Display (`app/page.tsx`)

Find this section around line 166:

```tsx
<div className="prose prose-sm max-w-none p-6 bg-gray-50 rounded-lg border border-gray-200">
  <p className="text-gray-700 leading-relaxed">
    <strong>ENROLLMENT AGREEMENT</strong>
  </p>
  <p className="text-gray-700 leading-relaxed mt-4">
    [Placeholder text...]
  </p>
</div>
```

Replace with your actual text:

```tsx
<div className="prose prose-sm max-w-none p-6 bg-gray-50 rounded-lg border border-gray-200">
  <p className="text-gray-700 leading-relaxed">
    <strong>ENROLLMENT AGREEMENT</strong>
  </p>
  
  <p className="text-gray-700 leading-relaxed mt-4">
    Thank you for choosing Caroline Small School of Dance. This agreement 
    outlines the terms and conditions of enrollment.
  </p>
  
  <p className="text-gray-700 leading-relaxed mt-4">
    <strong>1. Tuition and Fees</strong><br />
    Monthly tuition is due on the 1st of each month. A late fee of $25 
    will be applied to payments received after the 5th.
  </p>
  
  <p className="text-gray-700 leading-relaxed mt-4">
    <strong>2. Attendance Policy</strong><br />
    Regular attendance is essential for student progress. Please notify 
    the studio 24 hours in advance if your child will miss a class.
  </p>
  
  <p className="text-gray-700 leading-relaxed mt-4">
    <strong>3. Dress Code</strong><br />
    Students must wear appropriate dance attire and shoes for each class.
  </p>
  
  <!-- Add as many sections as needed -->
</div>
```

#### 2. PDF Generation (`app/api/submit-form/route.ts`)

Find this section around line 56:

```typescript
// Document content
addText('ENROLLMENT AGREEMENT', 14, true)
yPosition += 2

addText('[Placeholder text...]')
yPosition += 3
```

Replace with the SAME text (plain text version):

```typescript
// Document content
addText('ENROLLMENT AGREEMENT', 14, true)
yPosition += 2

addText('Thank you for choosing Caroline Small School of Dance. This agreement outlines the terms and conditions of enrollment.')
yPosition += 3

addText('1. TUITION AND FEES', 12, true)
addText('Monthly tuition is due on the 1st of each month. A late fee of $25 will be applied to payments received after the 5th.')
yPosition += 3

addText('2. ATTENDANCE POLICY', 12, true)
addText('Regular attendance is essential for student progress. Please notify the studio 24 hours in advance if your child will miss a class.')
yPosition += 3

addText('3. DRESS CODE', 12, true)
addText('Students must wear appropriate dance attire and shoes for each class.')
yPosition += 3
```

**Tips:**
- Use `addText(text, fontSize, isBold)` for each paragraph
- Increase `yPosition` between sections for spacing
- Use fontSize 14 for main headers, 12 for subheaders, 11 for body text
- Set `isBold: true` for headers

---

## Changing Colors & Branding

### School Name

Change the title in `app/page.tsx` (line 109):

```tsx
<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
  Caroline Small School of Dance
</h1>
```

And in `app/layout.tsx` (line 5):

```typescript
title: 'Caroline Small School of Dance - Enrollment Form',
```

### Color Scheme

The form uses a purple theme. To change colors, search and replace these Tailwind classes in `app/page.tsx`:

**Purple Buttons** → Change to your color:
```tsx
// Current:
className="bg-purple-600 hover:bg-purple-700"

// Examples:
className="bg-pink-600 hover:bg-pink-700"      // Pink
className="bg-blue-600 hover:bg-blue-700"      // Blue
className="bg-teal-600 hover:bg-teal-700"      // Teal
className="bg-rose-600 hover:bg-rose-700"      // Rose
```

**Focus Rings** → Match your button color:
```tsx
// Current:
className="focus:ring-purple-500"

// Change to match:
className="focus:ring-pink-500"
```

**Background Gradient** → Change the page background (line 99):
```tsx
// Current:
className="bg-gradient-to-br from-purple-50 to-pink-50"

// Examples:
className="bg-gradient-to-br from-blue-50 to-teal-50"
className="bg-gradient-to-br from-pink-50 to-rose-50"
```

### PDF Header Color

Change the PDF header color in `app/api/submit-form/route.ts` (line 40):

```typescript
// Current (purple):
pdf.setFillColor(147, 51, 234)

// RGB color examples:
pdf.setFillColor(236, 72, 153)   // Pink
pdf.setFillColor(59, 130, 246)    // Blue
pdf.setFillColor(20, 184, 166)    // Teal
```

### Adding a Logo

To add a logo, you'll need to:

1. Add your logo image to `public/logo.png`
2. Update the header in `app/page.tsx`:

```tsx
<div className="text-center mb-8">
  <img 
    src="/logo.png" 
    alt="School Logo" 
    className="h-20 mx-auto mb-4"
  />
  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
    Caroline Small School of Dance
  </h1>
</div>
```

---

## Adding/Removing Form Fields

### Adding a New Field

Example: Adding "Student Age" field

**Step 1**: Add to form state in `app/page.tsx` (line 10):

```typescript
const [formData, setFormData] = useState({
  studentName: '',
  studentAge: '',  // ADD THIS
  parentName: '',
  contactNumber: '',
  email: '',
  termsAccepted: false,
  photoConsent: false,
})
```

**Step 2**: Add the input field in the form (after studentName):

```tsx
<div>
  <label htmlFor="studentAge" className="block text-sm font-medium text-gray-700 mb-1">
    Student Age <span className="text-red-500">*</span>
  </label>
  <input
    type="number"
    id="studentAge"
    name="studentAge"
    value={formData.studentAge}
    onChange={handleInputChange}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    placeholder="Enter student's age"
  />
</div>
```

**Step 3**: Add validation in `validateForm()` (line 34):

```typescript
if (!formData.studentAge.trim()) return 'Student age is required'
```

**Step 4**: Add to PDF in `app/api/submit-form/route.ts`:

```typescript
// In the POST function, destructure it:
const {
  studentName,
  studentAge,  // ADD THIS
  parentName,
  // ...rest
} = data

// Add to PDF (line 75):
addText(`Student Name: ${studentName}`, 11, true)
addText(`Student Age: ${studentAge}`, 11, true)  // ADD THIS
```

**Step 5**: Add to emails (line 129):

```typescript
html: `
  <h2>New Student Enrollment</h2>
  <p><strong>Student Name:</strong> ${studentName}</p>
  <p><strong>Student Age:</strong> ${studentAge}</p>
  <!-- rest of email -->
`
```

### Removing a Field

To remove the optional photo consent:

1. Remove from state in `app/page.tsx`
2. Remove the checkbox HTML
3. Remove from validation (if it was required)
4. Remove from PDF generation
5. Remove from email templates

### Making a Field Optional

Change a required field to optional:

1. Remove `required` attribute from the input
2. Remove the red asterisk `<span className="text-red-500">*</span>`
3. Remove validation check from `validateForm()`

---

## Modifying Email Content

### School Email

Edit in `app/api/submit-form/route.ts` (line 127):

```typescript
await resend.emails.send({
  from: 'Caroline Small School of Dance <onboarding@resend.dev>',
  to: 'cs.schoolofdance@gmail.com',
  subject: `New Enrollment: ${studentName}`,
  html: `
    <h2>New Student Enrollment</h2>
    <!-- Customize this HTML -->
    <p>Add any custom message or branding here</p>
    <p><strong>Student Name:</strong> ${studentName}</p>
    <!-- Add/remove fields as needed -->
  `,
  attachments: [/* ... */],
})
```

### Parent Email

Edit in `app/api/submit-form/route.ts` (line 148):

```typescript
await resend.emails.send({
  from: 'Caroline Small School of Dance <onboarding@resend.dev>',
  to: email,
  subject: 'Your Enrollment Form - Caroline Small School of Dance',
  html: `
    <h2>Welcome to Our Dance Family!</h2>
    <p>Dear ${parentName},</p>
    <!-- Customize your welcome message -->
    <p>Thank you for enrolling ${studentName}...</p>
    <!-- Add any additional information, links, or next steps -->
  `,
  attachments: [/* ... */],
})
```

### Email Styling

Add inline CSS for better email rendering:

```typescript
html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #9333ea; color: white; padding: 20px; text-align: center;">
      <h1>Caroline Small School of Dance</h1>
    </div>
    <div style="padding: 20px; background-color: #f9fafb;">
      <p>Dear ${parentName},</p>
      <p>Thank you for enrolling...</p>
    </div>
  </div>
`,
```

---

## Customizing the PDF Layout

### Font Sizes

Available sizes in the PDF:

```typescript
addText('Large Header', 14, true)      // Main section headers
addText('Sub Header', 12, true)        // Subsection headers
addText('Normal text', 11, false)      // Body text
addText('Small text', 9, false)        // Fine print
```

### Spacing

Control spacing with `yPosition`:

```typescript
addText('Section 1')
yPosition += 3    // Small gap

addText('Section 2')
yPosition += 8    // Large gap

addText('Section 3')
yPosition += 15   // Extra large gap
```

### Adding Lines/Borders

Add horizontal lines:

```typescript
pdf.setDrawColor(200, 200, 200)  // Light gray
pdf.line(margin, yPosition, pageWidth - margin, yPosition)
yPosition += 5
```

### Adding More Checkboxes

Copy the checkbox drawing code:

```typescript
// Draw checkbox
pdf.rect(margin, yPosition - 3, 4, 4)
if (fieldIsChecked) {
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition - 1, margin + 2, yPosition + 1)
  pdf.line(margin + 2, yPosition + 1, margin + 4, yPosition - 3)
}
pdf.text('Checkbox label text', margin + 6, yPosition)
yPosition += 7
```

### Multi-Column Layout

For side-by-side content:

```typescript
const col1X = margin
const col2X = pageWidth / 2

pdf.text('Left Column', col1X, yPosition)
pdf.text('Right Column', col2X, yPosition)
yPosition += 7
```

---

## Testing Your Changes

After making any customizations:

1. Test locally: `npm run dev`
2. Fill out and submit a test form
3. Check the form displays correctly
4. Verify the PDF looks right
5. Confirm emails are received
6. Test on mobile devices
7. Push to GitHub when satisfied

---

## Need More Help?

- Review the comments in the code files
- Check the main README.md for technical details
- See DEPLOYMENT_GUIDE.md for publishing changes

**Pro Tip**: Make changes incrementally and test after each change to catch issues early!
