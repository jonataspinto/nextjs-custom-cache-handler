type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

type PostComment = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};
