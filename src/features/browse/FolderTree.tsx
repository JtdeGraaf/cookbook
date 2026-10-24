import { useTranslation } from 'react-i18next'
import { BookLink } from '@/components/BookLink'
import { Icon } from '@/components/Icon'
import { recipesInside, type Book, type Folder } from '@/lib/book'
import type { FilterSearch } from '@/lib/filters'
import { useLocalized } from '@/features/settings/useLanguage'
import { useExpandedFolders } from './useExpandedFolders'

type FolderTreeProps = {
  /** The whole book, or only its matching recipes when the page is filtered. */
  shownBook: Book
  currentPath: string
  filterSearch: FilterSearch
}

/** The recipes folder as a tree, like the folder panel of a file browser. */
export function FolderTree({ shownBook, currentPath, filterSearch }: FolderTreeProps) {
  const { t } = useTranslation()
  const expanded = useExpandedFolders(currentPath)
  return (
    <nav className="folder-tree" aria-label={t('browse.treeLabel')}>
      <ul className="folder-tree__list">
        {shownBook.chapters.map((chapter) => (
          <TreeFolder
            key={chapter.path}
            folder={chapter}
            currentPath={currentPath}
            filterSearch={filterSearch}
            expanded={expanded}
          />
        ))}
      </ul>
    </nav>
  )
}

type TreeFolderProps = {
  folder: Folder
  currentPath: string
  filterSearch: FilterSearch
  expanded: ReturnType<typeof useExpandedFolders>
}

function TreeFolder({ folder, currentPath, filterSearch, expanded }: TreeFolderProps) {
  const { t } = useTranslation()
  const localized = useLocalized()
  const open = expanded.isOpen(folder.path)
  const name = localized(folder.title)
  return (
    <li data-color={folder.color}>
      <div className="folder-tree__row">
        <button
          type="button"
          className="folder-tree__toggle"
          aria-expanded={open}
          aria-label={open ? t('browse.close', { name }) : t('browse.open', { name })}
          onClick={() => expanded.toggle(folder.path)}
        >
          <Icon name={open ? 'down' : 'right'} size={16} />
        </button>
        <BookLink
          path={folder.path}
          filterSearch={filterSearch}
          className="folder-tree__link"
          aria-current={folder.path === currentPath ? 'page' : undefined}
        >
          <span className="folder-tree__icon">
            <Icon name="folder" size={18} />
          </span>
          <span className="folder-tree__name">{name}</span>
          <span className="folder-tree__count numbers">{recipesInside(folder).length}</span>
        </BookLink>
      </div>
      {open && (
        <ul className="folder-tree__children">
          {folder.recipes.map((recipe) => (
            <li key={recipe.path}>
              <BookLink path={recipe.path} className="folder-tree__link folder-tree__link--recipe">
                <span className="folder-tree__icon">
                  <Icon name="recipe" size={18} />
                </span>
                <span className="folder-tree__name">{localized(recipe.title)}</span>
              </BookLink>
            </li>
          ))}
          {folder.folders.map((child) => (
            <TreeFolder
              key={child.path}
              folder={child}
              currentPath={currentPath}
              filterSearch={filterSearch}
              expanded={expanded}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
