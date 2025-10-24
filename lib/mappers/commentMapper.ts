import type { CommentResponseDto } from "../types";

export type UIReactionMeta = {
  likes: number;
  myReactionIsPositive: boolean | null; 
};

export type UIComment = CommentResponseDto & {
  depth: number;
  likes: number;
  isLiked: boolean;
  children: UIComment[];
};

const withReaction = (
  c: CommentResponseDto,
  meta?: UIReactionMeta
): Pick<UIComment, "likes" | "isLiked"> => ({
  likes: meta?.likes ?? 0,
  isLiked: meta?.myReactionIsPositive === true,
});

export function mapCommentsToUITree(
  comments: CommentResponseDto[],
  metaById?: Record<string, UIReactionMeta>,
  maxDepth = 2
): UIComment[] {
  const mapNode = (node: CommentResponseDto, depth: number): UIComment => {
    const meta = withReaction(node, metaById?.[node.id]);
    const canHaveChildren = depth < maxDepth;
    const childrenSrc = Array.isArray(node.replies) ? node.replies : [];

    return {
      ...node,
      ...meta,
      depth,
      children: canHaveChildren
        ? childrenSrc.map((child) => mapNode(child, depth + 1))
        : [], 
    };
  };

  return comments.map((c) => mapNode(c, 0));
}

export function updateCommentLikeOptimistic(
  tree: UIComment[],
  commentId: string,
  toLiked: boolean
): UIComment[] {
  const walk = (nodes: UIComment[]): UIComment[] =>
    nodes.map((n) => {
      if (n.id === commentId) {
        const delta = toLiked ? +1 : -1;
        return {
          ...n,
          isLiked: toLiked,
          likes: Math.max(0, (n.likes ?? 0) + delta),
        };
      }
      return { ...n, children: walk(n.children ?? []) };
    });

  return walk(tree);
}

export function insertReplyIntoTree(
  tree: UIComment[],
  parentId: string,
  created: CommentResponseDto,
  maxDepth = 2
): UIComment[] {
  const walk = (nodes: UIComment[]): UIComment[] =>
    nodes.map((n) => {
      if (n.id === parentId) {
        const childDepth = n.depth + 1;
        if (childDepth <= maxDepth) {
          const uiChild: UIComment = {
            ...created,
            depth: childDepth,
            likes: 0,
            isLiked: false,
            children: [],
          };
          return { ...n, children: [...(n.children ?? []), uiChild] };
        }
        return n; 
      }
      return { ...n, children: walk(n.children ?? []) };
    });
  return walk(tree);
}

export function findCommentById(
  tree: UIComment[],
  id: string
): UIComment | undefined {
  for (const n of tree) {
    if (n.id === id) return n;
    const hit = findCommentById(n.children ?? [], id);
    if (hit) return hit;
  }
  return undefined;
}