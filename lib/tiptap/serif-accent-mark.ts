import { Mark, mergeAttributes } from "@tiptap/core"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    serifAccent: {
      toggleSerifAccent: () => ReturnType
    }
  }
}

export const SerifAccent = Mark.create({
  name: "serifAccent",

  parseHTML() {
    return [{ tag: "span.font-accent" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { class: "font-accent italic" }),
      0,
    ]
  },

  addCommands() {
    return {
      toggleSerifAccent:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    }
  },

  addKeyboardShortcuts() {
    return {
      // Ctrl/Cmd + Shift + A = toggle Serif Accent
      "Mod-Shift-a": () => this.editor.commands.toggleSerifAccent(),
    }
  },
})
