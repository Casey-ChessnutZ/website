# Contract: Contentful Content Model

## Overview

This contract defines the content types that drive the public site.

## Event

- Required: title, slug
- Optional: summary, description, eventDate, locationName, locationDetails, status, heroMedia, registrationUrl, format, schedule, prizeInformation, eligibility, organizer, tags
- Public routing: slug maps to the event detail page path

## Landing Page

- Required: title
- Optional: heroHeadline, heroDescription, featuredEvents, sections, seo
- Composition: sections must reference supported reusable section blocks

## Section Block

- Supported blocks: featured events, editorial text, banner callout, stats or highlights, sponsor strip, FAQ, media/text split
- Unknown blocks: should not break the page

## Site Settings

- Shared values: site name, logo, default SEO, social links, footer text

## Contract Expectations

- Published entries are the only public content.
- Missing optional fields are allowed.
- Content model changes should preserve the existing route and page contracts whenever possible.
