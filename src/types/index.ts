export type Profile = {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  trekker_level: string
  created_at: string
}

export type Post = {
  id: string
  author_id: string
  title: string
  body: string | null
  post_type: string
  tags: string[]
  location: string | null
  data_sections: any
  poll_options: any
  vote_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

export type Comment = {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  body: string
  created_at: string
}

export type Group = {
  id: string
  creator_id: string
  name: string
  description: string | null
  location: string | null
  trek_date: string | null
  max_members: number
  tags: string[]
  status: string
  is_private: boolean
  created_at: string
}

export type GroupMember = {
  id: string
  group_id: string
  user_id: string
  role: string
  joined_at: string
}

export type GroupPost = {
  id: string
  group_id: string
  author_id: string
  body: string
  created_at: string
}

export type Equipment = {
  id: string
  owner_id: string
  title: string
  description: string | null
  category: string
  condition: string
  listing_type: string
  price_per_day: number | null
  location: string | null
  tags: string[]
  images: string[]
  is_available: boolean
  created_at: string
}

export type PostWithAuthor = Post & { profiles: Profile }
export type CommentWithAuthor = Comment & { profiles: Profile }
export type GroupWithAuthor = Group & { profiles: Profile }
export type EquipmentWithOwner = Equipment & { profiles: Profile }
export type GroupMemberWithProfile = GroupMember & { profiles: Profile }
