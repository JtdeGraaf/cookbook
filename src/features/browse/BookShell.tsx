import type { ReactNode } from 'react'
import { FolderTree } from './FolderTree'
import './browse.css'

type BookShellProps = {
  /** The folder open in the tree; "" for the top of the book. */
  currentPath: string
  children: ReactNode
}

/** The frame of every index page (the contents, each folder, search): the folder tree beside one column. */
export function BookShell({ currentPath, children }: BookShellProps) {
  return (
    <div className="browser">
      <aside className="browser__tree">
        <FolderTree currentPath={currentPath} />
      </aside>
      <div className="browser__main">{children}</div>
    </div>
  )
}
