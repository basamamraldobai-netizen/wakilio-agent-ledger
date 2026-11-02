<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Excel import/matching logic lives in pure functions in src/lib/wakilio/engine.ts (tested); UI in src/components/wakilio. Data is kept in browser localStorage for now — no backend yet.
- Keep the shared WAKILIO store provider and workspace shell in the root layout so dashboard, imports, agents and suggestions share existing records and aliases across navigation.
- Express workspace styling through semantic global tokens and the shared Button variants to keep the reference design consistent without coupling it to Excel engine logic.
