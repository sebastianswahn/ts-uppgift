import { Timestamp } from "firebase/firestore";

type ThreadCategory = string;

export type Comment = {
  id: string;
  threadId: string;
  content: string;
  creator: string;
  createdAt: Timestamp;
};

export type ThreadCategory = "THREAD" | "QNA";

export type Thread = {
  markedAnswerId: null;
  id: string;
  title: string;
  category: ThreadCategory;
  creationDate: string;
  description: string;
  creator: string;
  locked: boolean;
};

export type User = {
  id: string;
  firstName: string;
  userName: string;
  password: string;
  userUID: string;
};
