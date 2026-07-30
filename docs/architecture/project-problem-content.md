# Project Problem Content

## Outcome

The protected project Problem page supports a flexible, article-like narrative without requiring administrators to edit one large rich-text field. Administrators compose the page from ordered content blocks.

## Content model

Problem content is stored on the project as an ordered `jsonb` array. Supported block types are `heading`, `paragraph`, `image`, `quote`, `list`, and `statistic`.

Text blocks retain plain text only. Image blocks retain the image source, alternative text, and an optional caption. The current implementation accepts JPG, PNG, and WebP uploads up to 2 MB and stores them as data URLs. Moving these images to approved object storage is deferred; authorization must remain server-side when that occurs.

## Administrator behavior

- Add blocks at the beginning, end, or between existing blocks.
- Edit, reorder, and remove individual blocks.
- Add images at the exact narrative position where they are needed.
- Save the complete ordered document through the administrator-only project dashboard mutation.
- Record the mutation through the existing `project.dashboard_updated` audit event.

## Access and validation

- Reading project content continues to follow project access-level rules.
- Only administrators can mutate Problem content.
- The API validates block types, block count, and text/image metadata limits.
- Image alternative text is available for accessibility.

## Deferred work

- Draft/published content versioning
- Object-storage uploads and deletion lifecycle
- Member-facing rendering of every pitch section
- Revision history and per-block audit metadata
