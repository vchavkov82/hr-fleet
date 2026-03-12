# Figma ↔ HR App alignment

This folder holds specs and mapping so Figma frames stay aligned with the HR app and design stays in sync.

## Files

| File | Purpose |
|------|--------|
| **REQUIRED_FRAMES.md** | Spec for Figma Make (or manual creation): list of frames to create and a copy-paste prompt. |
| **FEATURES_FRAME_SPEC.md** | **Features page:** Navy-deep hero, 3 FeatureRows (mock dashboard + text, one reversed), Roadmap (5 cards), CTA. Use so the Figma Features frame matches www. |
| **HELP_CENTER_FRAME_SPEC.md** | **Help Center only:** Section-by-section layout for Help Center (home), Category, and Article so the Figma frame matches the www implementation (navy-deep hero, quick links, categories, popular articles, still need help). |
| **HR_TO_FIGMA_MAPPING.json** | Mapping: HR routes → Figma frame names and (optional) node IDs. Update `figmaNodeId` and `figmaFileKey` after creating frames. Help Center entries reference `layoutSpec` for HELP_CENTER_FRAME_SPEC.md. |
| **DESIGN_ALIGNMENT.md** | Design tokens and patterns: colors, typography, spacing, components. Use to align Figma with the app. Includes navy-deep and Help Center notes. |

## Workflow

1. **Create frames in Figma**  
   Use the prompt in `REQUIRED_FRAMES.md` with Figma Make, or create frames manually using the frame list there.

2. **Fill in the mapping**  
   In `HR_TO_FIGMA_MAPPING.json`, set `figmaFileKey` and add each frame's `figmaNodeId` (from the Figma URL `node-id=...`, stored as `X:Y` in the JSON).

3. **Align design**  
   In Figma, apply colors, type styles, and layout from `DESIGN_ALIGNMENT.md` so frames match the app.

4. **Code Connect (optional)**  
   With the Figma MCP authenticated, use the Code Connect skill and the `sharedComponents` in the mapping to link Figma components to `www/src/components/...` files.

## Figma MCP

The Figma MCP must be **authenticated** to create frames or push mappings from the IDE. If auth was skipped, run the auth flow (e.g. call `mcp_auth` for the Figma server), then you can use Figma tools to create frames and run Code Connect from Cursor.
