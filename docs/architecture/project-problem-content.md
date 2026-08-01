# Project Pitch-Section Content

## Outcome

The protected project Problem, Solution, Competition, Market, and Business Model pages support flexible, article-like narratives without requiring administrators to edit one large rich-text field. Administrators compose each page from ordered content blocks using the same editing grid.

## Content model

Each supported pitch section is stored independently on the project as an ordered `jsonb` array: `problem_content`, `solution_content`, `competition_content`, `market_content`, and `business_model_content`. Supported block types are `heading`, `paragraph`, `image`, `quote`, `list`, and `statistic`.

Text blocks retain plain text only. Image blocks retain the image source, alternative text, and an optional caption. The current implementation accepts JPG, PNG, and WebP uploads up to 2 MB and stores them as data URLs. Moving these images to approved object storage is deferred; authorization must remain server-side when that occurs.

## Administrator behavior

- Add blocks at the beginning, end, or between existing blocks.
- Edit, reorder, and remove individual blocks.
- Add images at the exact narrative position where they are needed.
- Save the complete ordered document through the administrator-only project dashboard mutation.
- Record the mutation through the existing `project.dashboard_updated` audit event.

## Access and validation

- Reading project content continues to follow project access-level rules.
- Only administrators can mutate pitch-section content.
- The API validates block types, block count, and text/image metadata limits.
- Image alternative text is available for accessibility.

## Deferred work

- Draft/published content versioning
- Object-storage uploads and deletion lifecycle
- Member-facing rendering of every pitch section
- Revision history and per-block audit metadata
