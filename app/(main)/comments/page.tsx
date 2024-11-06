'use client'

import { useState, useTransition, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { Post } from '@/components/post'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPost, getCurrentUser, createComment } from '@/actions/user-comment'

function Comment({ comment }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const maxLength = 100 // Maximum number of characters to show initially

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <li className="border-b border-gray-200 py-4">
      <div className="flex items-center space-x-2 mb-2">
        <Avatar>
          <AvatarImage src={comment.user.image} alt={comment.user.name || ''} />
          <AvatarFallback>{comment.user.name?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{comment.user.name}</p>
          <p className="text-sm text-gray-500">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <div className="break-words overflow-hidden">
        <p
          className={`text-gray-700 ${
            !isExpanded ? "line-clamp-3" : "line-clamp-none"
          } whitespace-pre-wrap break-words`}
        >
          {comment.body}
        </p>
        {!isExpanded && comment.body.length > maxLength && (
          <span
            onClick={toggleExpand}
            className="text-blue-500 cursor-pointer text-sm"
          >
            más...
          </span>
        )}
        {isExpanded && (
          <span
            onClick={toggleExpand}
            className="text-blue-500 cursor-pointer text-sm"
          >
            menos
          </span>
        )}
      </div>
    </li>
  )
}

export default function CommentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [isPending, startTransition] = useTransition()
  const [comments, setComments] = useState([])
  const [post, setPost] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const postId = searchParams.postId as string
    if (!postId) {
      notFound()
    }

    async function loadData() {
      const postResult = await getPost(postId)
      const userResult = await getCurrentUser()

      if (!postResult.success || !postResult.data) {
        notFound()
      }

      setPost(postResult.data)
      setComments(postResult.data.comments)
      setCurrentUser(userResult.success ? userResult.data : null)
    }

    loadData()
  }, [searchParams.postId])

  if (!post) {
    return <div>Loading...</div>
  }

  async function onSubmit(formData: FormData) {
    const body = formData.get('body') as string
    startTransition(async () => {
      await createComment(post.id, body)
      const updatedPostResult = await getPost(post.id)
      if (updatedPostResult.success && updatedPostResult.data) {
        setComments(updatedPostResult.data.comments)
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Post post={post} currentUserId={currentUser?.id} />
      
      <form action={onSubmit} className="mt-4">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={currentUser?.image} alt={currentUser?.name || ''} />
            <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
          </Avatar>
          <textarea
            name="body"
            placeholder="Añade un comentario..."
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-[calc(100%-3rem)] resize-y"
            rows={3}
            required
            aria-label="Texto del comentario"
          />
        </div>
        <Button type="submit" className="mt-2" disabled={isPending}>
          {isPending ? 'Enviando...' : 'Comentar'}
        </Button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Comentarios</h2>
        {comments.length === 0 ? (
          <p>Aún no hay comentarios. ¡Sé el primero en comentar!</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}