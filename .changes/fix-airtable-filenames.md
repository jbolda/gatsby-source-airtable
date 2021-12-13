---
"gatsby-source-airtable": minor
---

This makes the fileNode pull `name` from the airtable metadata instead of the
remote file, because when an airtable user changes the file name, airtable does
not rename the original url. This change makes file name changes in airtable
usable in the fileNode instead of needing to download, rename, and re-upload the
file.
