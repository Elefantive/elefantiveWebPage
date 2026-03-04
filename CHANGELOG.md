# Changelog - Elefantive CMS Updates

## March 4, 2026

### ✨ New Features & Improvements

#### **Product Links Now Display Correctly in Preview**
When editing product intro text in the CMS, markdown links like `[amazon](https://...)` now display as proper clickable blue links in the preview pane. This helps you see exactly how your product links will appear on the live website before publishing.

**What changed:**
- Product intro text previews now render markdown links as HTML
- Links open in a new tab with proper styling
- Preview matches the live website appearance
- Fixed widget rendering to handle complex URLs

---

#### **Homepage Content Positioning Fixed**
The additional content you add to the homepage now appears in the correct location. Previously it showed below the product grid, but now it displays in the grey header box at the top, exactly as it appears on the live site.

**What changed:**
- Homepage preview now accurately shows content placement
- Content appears in the grey hero section, not below products
- Preview matches live website layout
- Repositioned content intelligently within the header

---

#### **Product Footer Preview Added**
You can now see a live preview of how your product footer text appears at the bottom of product detail pages. The preview shows styling with the "Order by Email" and "Back to Products" buttons, with proper borders and spacing.

**What changed:**
- New preview added for the product footer section
- Shows footer text styling with border and button layout
- Displays in proper context with action buttons
- Helps visualize the complete product page experience

---

#### **Language Switcher Now Stays in Fixed Position**
The language buttons (FR - EN - DE - RO) now always stay in the same order at the top of the page. Previously, switching languages would cause the buttons to shuffle around. Now only the highlight changes, creating a cleaner, less distracting experience.

**What changed:**
- Language buttons maintain consistent order: FR - EN - DE - RO
- Only the "active" highlight moves when switching languages
- Less visual disruption when changing languages
- Quieter, more professional interface

---

#### **"What's New" Button in CMS Admin Panel**
A new button has been added to the CMS backend that displays all the latest changes and improvements. Click the "📣 What's New" button (bottom-right corner) to see what's been updated.

**What changed:**
- Changelog accessible directly in the CMS
- Button positioned securely in bottom-right corner
- Won't overlap with other interface elements
- Responsive design for all screen sizes
- Formatted with proper styling that matches Elefantive design

---

### 🔧 Technical Improvements

- Improved CMS preview component rendering for markdown content
- Enhanced language switcher to use site configuration order
- Fixed preview styling to match website design system
- Optimized widget rendering for product intro field
- Added Decap CMS native widget renderer for better compatibility
- Fixed media folder paths from relative to absolute paths (resolved 404 errors)
- Improved homepage preview with realistic product card examples
- Added responsive button positioning to prevent overlapping
- Fixed JavaScript quote escaping for proper modal rendering

---

### 📊 Summary

**Total commits today: 25**

This comprehensive update focuses on making the CMS preview experience match the live website as closely as possible. When you're editing content in the CMS, you now see exactly how it will appear to visitors - what you see is what you get!

Key improvements:
- ✅ 5 major feature additions/fixes
- ✅ 8 markdown link rendering improvements  
- ✅ 4 product footer preview refinements
- ✅ 3 homepage layout corrections
- ✅ 2 language switcher improvements
- ✅ Multiple bug fixes and quality improvements

---

**Need Help?**
If you have questions about these changes or need assistance editing your content, please reach out. All changes are backwards compatible and don't affect existing content.
