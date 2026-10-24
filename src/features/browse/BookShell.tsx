import type { ReactNode } from 'react'
import type { Book } from '@/lib/book'
import { book } from '@/features/book/book-data'
import { FolderTree } from './FolderTree'
import './browse.css'

type BookShellProps = {
  /** The folder open in the tree; "" for the top of the book. */
  currentPath: string
  /** The book as the tree shows it: the whole book, unless the contents page is filtered. */
  shownBook?: Book
  children: ReactNode
}

/** The frame of every index page (the contents, each folder, search): the folder tree beside one column. */
export function BookShell({ currentPath, shownBook = book, children }: BookShellProps) {
  return (
    <div className="browser">
      <aside className="browser__tree">
        <FolderTree shownBook={shownBook} currentPath={currentPath} />
      </aside>
      <div className="browser__main">{children}</div>
    </div>
  )
}
