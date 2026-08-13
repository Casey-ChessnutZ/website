# Major Event Divisions Design

## Content model

`Event` gains two optional fields: `divisions`, an ordered list of links to other Event entries, and `pairingUrl`, an external URL for the pairing provider. The parent event uses `divisions`; child division events remain standalone Event entries and do not link back to the parent.

## Rendering

The event route resolves one level of linked division entries and shows a Divisions section only when the parent has entries. Each division card retains its own link, friendly date, and format. A Pairings section shows a safe external “View pairings” link only if `pairingUrl` is present. Pairing pages are not embedded yet.

## Seed content

Create a published `2026 Koshnitsky Cup` parent event with Major, Minor, and Rookies child events. Because the supplied reference URL uses a JavaScript cookie challenge, details are explicitly realistic test data rather than extracted source data. The supplied URL is used as each event’s pairing URL.

## Validation

Unit-test resolution of pairing links and event divisions, run offline verification, then publish via the existing explicit Contentful sync command and inspect the Delivery API response.
