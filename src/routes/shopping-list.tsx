import { createFileRoute } from '@tanstack/react-router'
import { ShoppingListPage } from '@/features/shopping/ShoppingListPage'

export const Route = createFileRoute('/shopping-list')({
  component: ShoppingListPage,
})
