# Changelog

## \[2.3.0]

- This makes the fileNode pull `name` from the airtable metadata instead of the
  remote file, because when an airtable user changes the file name, airtable does
  not rename the original url. This change makes file name changes in airtable
  usable in the fileNode instead of needing to download, rename, and re-upload the
  file.
  - [4c107f6](https://github.com/jbolda/gatsby-source-airtable/commit/4c107f63af56b7e1a3f6d54d22b840c98a638c3d) Adding change file on 2021-12-13
  - [0d8c3f2](https://github.com/jbolda/gatsby-source-airtable/commit/0d8c3f2c52cb98064ccfc2852afb5d9135160c3a) Copy/pasted from the example without changing the type, oops! on 2021-12-13
  - [d7200c0](https://github.com/jbolda/gatsby-source-airtable/commit/d7200c0be3c5b5896fa9d479836b8d5d33ee6b03) apply suggestions from code review on 2022-05-21

## \[2.2.1]

- Add logging statement
  - [3c53464](https://github.com/jbolda/gatsby-source-airtable/commit/3c53464f075d8931da91d6762d0b6949d703f897) Add logging message in catch on 2021-07-11

## \[2.2.0]

- Initialize covector to perform versioning and publishing of `gatsby-source-airtable`.
  - [3e65bed](https://github.com/jbolda/gatsby-source-airtable/commit/3e65bed25d7226d69efd908de4f6f549e2ebb209) add covector on 2021-05-24
- Add custom node property with fetched records order
  - [0880d57](https://github.com/jbolda/gatsby-source-airtable/commit/0880d573a7280984abe276a0db8999391ddca6bb) Create change file & add usage example on 2021-05-26
- Upgrade `airtable.js` to `^0.11.1`. This will remove transitive dependencies on outdated libs.
  - [ef7a49f](https://github.com/jbolda/gatsby-source-airtable/commit/ef7a49f9a2b47b5968436aacca9bfdd3309ccf8e) fix(deps): update dependency airtable to ^0.11.0 on 2021-05-24
