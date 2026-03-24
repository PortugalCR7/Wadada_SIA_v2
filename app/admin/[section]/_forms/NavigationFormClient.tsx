"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/actions/types"
import type { NavLink } from "@/lib/content/types"

interface NavigationFormClientProps {
  links: NavLink[]
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
}

const initial: ActionState = { success: false, error: null }

export function NavigationFormClient({ links, action }: NavigationFormClientProps) {
  const [state, formAction] = useActionState(action, initial)

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black uppercase tracking-tighter">Navigation Links</h2>
      <p className="text-zinc-400 text-sm">
        These links appear in the hero nav bar and in the footer Quick Links section.
        Use <code className="text-zinc-300">#section-id</code> for page anchors, or a full URL for external links.
      </p>
      {state.success && (
        <div className="bg-green-950 border border-green-700 text-green-300 px-4 py-3 text-sm">Saved!</div>
      )}
      {state.error && (
        <div className="bg-red-950 border border-red-700 text-red-300 px-4 py-3 text-sm">{state.error}</div>
      )}
      <form action={formAction} className="space-y-4">
        <div className="space-y-3" id="nav-link-rows">
          {links.map((link) => (
            <div key={link.id} className="flex gap-3 items-center">
              <input
                type="text"
                name="label"
                defaultValue={link.label}
                placeholder="Label"
                className="w-32 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
              />
              <input
                type="text"
                name="href"
                defaultValue={link.href}
                placeholder="#section or https://..."
                className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
              />
              <label className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest whitespace-nowrap">
                {/* Hidden input ensures a value is always submitted even when unchecked */}
                <input type="hidden" name="open_in_new_tab" value="false" />
                <input
                  type="checkbox"
                  name="open_in_new_tab"
                  value="true"
                  defaultChecked={link.open_in_new_tab}
                  className="accent-white"
                />
                New tab
              </label>
            </div>
          ))}
          {/* Empty row for adding a new link */}
          <div className="flex gap-3 items-center opacity-50">
            <input
              type="text"
              name="label"
              placeholder="New label"
              className="w-32 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
            />
            <input
              type="text"
              name="href"
              placeholder="#section or https://..."
              className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-white"
            />
            <label className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-widest whitespace-nowrap">
              <input type="hidden" name="open_in_new_tab" value="false" />
              <input
                type="checkbox"
                name="open_in_new_tab"
                value="true"
                className="accent-white"
              />
              New tab
            </label>
          </div>
        </div>
        <p className="text-zinc-600 text-xs">To remove a link, clear its Label field and save.</p>
        <button
          type="submit"
          className="bg-white text-black font-black uppercase tracking-widest px-8 py-3 hover:bg-zinc-200 transition-colors"
        >
          Save
        </button>
      </form>
    </div>
  )
}
