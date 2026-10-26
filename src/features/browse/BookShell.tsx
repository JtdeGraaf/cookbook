import type { ReactNode } from 'react'
import { hasSeveralChapters, type Book } from '@/lib/book'
import type { FilterSearch } from '@/lib/filters'
import { book } from '@/features/book/book-data'
import { FolderTree } from './FolderTree'
import './browse.css'

type BookShellProps = {
  /** The folder open in the tree; "" for the top of the book. */
  currentPath: string
  /** The book as the tree shows it: the whole book, unless the page is filtered. */
  shownBook?: Book
  /** The filters of the page, carried over by the folder links in the tree. */
  filterSearch?: FilterSearch
  children: ReactNode
}

/**
 * The frame of every index page (the contents, each folder, search): the folder tree beside one column. With a single
 * chapter the tree has nothing to move between, so the column stands alone.
 */
export function BookShell({ currentPath, shownBook = book, filterSearch = {}, children }: BookShellProps) {
  const showTree = hasSeveralChapters(book)
  return (
    <div className="browser" data-tree={showTree}>
      {showTree && (
        <aside className="browser__tree">
          <FolderTree shownBook={shownBook} currentPath={currentPath} filterSearch={filterSearch} />
        </aside>
      )}
      <div className="browser__main">{children}</div>
    </div>
  )
}
