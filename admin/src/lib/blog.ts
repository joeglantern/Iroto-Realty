'use server'

import { columns } from './db'
import { asAdmin } from './session'
import type { BlogPost, BlogCategory } from './types'

// Blog Posts CRUD operations
export async function getBlogPosts() {
  return asAdmin(tx => tx<any[]>`
    select b.*,
      (select json_build_object('name', c.name, 'slug', c.slug) from blog_categories c where c.id = b.category_id) as blog_categories
    from blog_posts b
    order by b.created_at desc`)
}

export async function getBlogPost(id: string) {
  return asAdmin(async tx => {
    const [post] = await tx<any[]>`
      select b.*,
        (select json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) from blog_categories c where c.id = b.category_id) as blog_categories
      from blog_posts b
      where b.id = ${id}`
    if (!post) throw new Error('Blog post not found')
    return post
  })
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) {
  return asAdmin(async tx => {
    const [created] = await tx<any[]>`insert into blog_posts ${tx(columns(post))} returning *`
    return created
  })
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>) {
  return asAdmin(async tx => {
    const [updated] = await tx<any[]>`
      update blog_posts set ${tx(columns({ ...updates, updated_at: new Date().toISOString() }))}
      where id = ${id}
      returning *`
    if (!updated) throw new Error('Blog post not found')
    return updated
  })
}

export async function deleteBlogPost(id: string) {
  await asAdmin(tx => tx<any[]>`delete from blog_posts where id = ${id}`)
}

// Blog Categories CRUD operations
export async function getBlogCategories() {
  return asAdmin(tx => tx<any[]>`select * from blog_categories order by name`)
}

export async function createBlogCategory(category: Omit<BlogCategory, 'id' | 'created_at'>) {
  return asAdmin(async tx => {
    const [created] = await tx<any[]>`insert into blog_categories ${tx(columns(category))} returning *`
    return created
  })
}

export async function updateBlogCategory(id: string, updates: Partial<BlogCategory>) {
  return asAdmin(async tx => {
    const [updated] = await tx<any[]>`
      update blog_categories set ${tx(columns(updates))} where id = ${id} returning *`
    if (!updated) throw new Error('Blog category not found')
    return updated
  })
}

export async function deleteBlogCategory(id: string) {
  await asAdmin(tx => tx<any[]>`delete from blog_categories where id = ${id}`)
}
