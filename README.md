# SEA Captain

SEA Captain is a tool for browsing and refactoring code. SEA stands for Software Engineering Artifacts.

## Extractor

The extractor uses [depends](https://github.com/multilang-depends/depends) to extract structural information and [gitchurn](https://github.com/jlefever/gitchurn) to extract historical information. This data is stored in a relational database and then dumped to JSON for the user interface.

## User Interface

The UI is written in TypeScript and is deployable as a static site.