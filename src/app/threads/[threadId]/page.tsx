'use client';

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "@/components/layout/Header";
import { Thread, User, Comment } from "@/types/types";
import CommentOnComment from "@/components/CommentOnComment";

const ThreadDetailPage: React.FC = () => {
  const pathname = usePathname();
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});
  const [currentUserUID, setCurrentUserUID] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [markedAnswerId, setMarkedAnswerId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUserUID(user.uid);

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setCurrentUserName(userData.userName);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    const pathSegments = pathname?.split("/");
    const threadId = pathSegments ? pathSegments[pathSegments.length - 1] : null;
    
    if (threadId) {
      const fetchThread = async () => {
        try {
          const threadDoc = await getDoc(doc(db, "threads", threadId));
          if (threadDoc.exists()) {
            const threadData = threadDoc.data() as Thread;
            setThread({ ...threadData, id: threadDoc.id });
            setIsLocked(threadData.locked);
            setMarkedAnswerId(threadData.markedAnswerId || null);

            const userDoc = await getDoc(doc(db, "users", threadData.creator));
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              setCreatorName(userData.userName);
            }
          }
        } catch (error) {
          console.error("Error fetching thread:", error);
        }
      };

      const fetchComments = async () => {
        try {
          const commentsQuery = query(
            collection(db, "comments"),
            where("threadId", "==", threadId)
          );
          const commentsSnapshot = await getDocs(commentsQuery);
          const commentsData = commentsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: (data.createdAt as Timestamp) || Timestamp.now(),
            };
          }) as Comment[];
          setComments(commentsData);

          const usernamesMap: { [key: string]: string } = {};
          await Promise.all(
            commentsData.map(async (comment) => {
              if (!usernamesMap[comment.creator]) {
                const userDoc = await getDoc(doc(db, "users", comment.creator));
                if (userDoc.exists()) {
                  const userData = userDoc.data() as User;
                  usernamesMap[comment.creator] = userData.userName;
                }
              }
            })
          );
          setUsernames(usernamesMap);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      };

      fetchThread();
      fetchComments();
    }
  }, [pathname]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pathSegments = pathname?.split("/");
    const threadId = pathSegments ? pathSegments[pathSegments.length - 1] : null;
    if (threadId && newComment.trim() && currentUserUID) {
      try {
        const newCommentData = {
          content: newComment,
          createdAt: serverTimestamp(),
          creator: currentUserUID,
          threadId: threadId,
          markedAsAnswer: false,
        };
        const docRef = await addDoc(collection(db, "comments"), newCommentData);
        const addedComment = {
          ...newCommentData,
          id: docRef.id,
          createdAt: Timestamp.now(),
        } as Comment;
        setComments([...comments, addedComment]);
        setNewComment("");

        if (!usernames[currentUserUID]) {
          const userDoc = await getDoc(doc(db, "users", currentUserUID));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUsernames((prevUsernames) => ({
              ...prevUsernames,
              [currentUserUID]: userData.userName,
            }));
          }
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const handleMarkAsAnswer = async (commentId: string) => {
    if (thread && thread.creator === currentUserUID) {
      const newMarkedAnswerId = markedAnswerId === commentId ? null : commentId;
      setMarkedAnswerId(newMarkedAnswerId);
      try {
        await updateDoc(doc(db, "threads", thread.id), {
          markedAnswerId: newMarkedAnswerId,
        });
      } catch (error) {
        console.error("Error marking comment as answer:", error);
      }
    }
  };

  const sortedComments = comments.sort((a, b) => {
    if (a.id === markedAnswerId) return -1;
    if (b.id === markedAnswerId) return 1;
    return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
  });

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6 max-w-4xl">
        {thread ? (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300 uppercase">
                {thread.title}
              </h1>
              {isLoggedIn && thread.creator === currentUserUID && (
                <button
                  onClick={async () => {
                    try {
                      await updateDoc(doc(db, "threads", thread.id), {
                        locked: !isLocked,
                      });
                      setIsLocked(!isLocked);
                    } catch (error) {
                      console.error("Error updating thread lock status:", error);
                    }
                  }}
                  className={`p-3 rounded-md text-white font-semibold ${
                    isLocked ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  } transition-all`}
                >
                  {isLocked ? "Unlock Thread" : "Lock Thread"}
                </button>
              )}
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-4 whitespace-pre-wrap">
              {thread.description}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              <p>Created by: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{creatorName}</span></p>
              <p>Created at: {new Date(thread.creationDate).toLocaleString()}</p>
              <p>Category: <span className="font-semibold">{thread.category}</span></p>
            </div>
          </div>
        ) : (
          <p>Loading thread...</p>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Comments</h2>
          {isLoggedIn && !isLocked && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white transition-all"
                placeholder="Add a comment..."
                required
              />
              <button
                type="submit"
                className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-indigo-700 transition-all"
              >
                Submit Comment
              </button>
            </form>
          )}
          
          {sortedComments.length > 0 ? (
            sortedComments.map((comment) => (
              <div
                key={comment.id}
                className={`bg-gray-100 dark:bg-gray-700 shadow-lg rounded-lg p-6 mb-6 relative ${
                  comment.id === markedAnswerId ? "border-4 border-green-600" : ""
                }`}
              >
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-semibold">
                    Comment by: {usernames[comment.creator] || "Unknown"}
                  </p>
                  {isLoggedIn && thread?.creator === currentUserUID && (
                    <button
                      onClick={() => handleMarkAsAnswer(comment.id)}
                      className="text-blue-500 dark:text-blue-300 text-xs hover:underline"
                    >
                      {comment.id === markedAnswerId
                        ? "Unmark as Answer"
                        : "Mark as Answer"}
                    </button>
                  )}
                </div>
                <p className="mt-2 text-gray-700 dark:text-gray-100 whitespace-pre-wrap">{comment.content}</p>
                <p className="mt-4 text-gray-500 dark:text-gray-400 text-xs">
                  {comment.createdAt.toDate().toLocaleString()}
                </p>
                {comment.id === markedAnswerId && (
                  <p className="text-green-500 text-xs mt-2">Marked as Top Comment</p>
                )}
                <hr className="mt-4" />
                <CommentOnComment />
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-300">{isLocked ? "This thread is locked." : "No comments yet."}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadDetailPage;
