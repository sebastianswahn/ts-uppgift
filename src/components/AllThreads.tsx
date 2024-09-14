import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Thread, User } from "@/types/types";
import { Timestamp } from "firebase/firestore";

function AllThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "threads"));
      const threadsData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Thread)
      );

      threadsData.sort((a, b) => {
        const dateA =
          a.creationDate instanceof Timestamp
            ? a.creationDate.toDate()
            : new Date(a.creationDate);
        const dateB =
          b.creationDate instanceof Timestamp
            ? b.creationDate.toDate()
            : new Date(b.creationDate);
        return dateB.getTime() - dateA.getTime();
      });

      setThreads(threadsData);

      const userPromises = threadsData.map((thread) => {
        if (thread.creator) {
          return getDoc(doc(db, "users", thread.creator));
        }
        return null;
      });

      const validUserPromises = userPromises.filter(
        (promise): promise is Promise<any> => promise !== null
      );

      const userDocs = await Promise.all(validUserPromises);
      const usersData = userDocs.reduce((acc, userDoc) => {
        if (userDoc && userDoc.exists()) {
          acc[userDoc.id] = userDoc.data() as User;
        }
        return acc;
      }, {} as { [key: string]: User });
      setUsers(usersData);
    }

    fetchData();
  }, []);

  return (
    <div
      className="p-10 fixed bg-slate-200 shadow-lg dark:bg-gray-900 rounded-lg w-2/3"
      style={{ top: "30%", left: "50%", transform: "translate(-50%, -50%)" }}
    >
      <h2 className="font-bold text-xl pb-3">All Threads</h2>
      {threads.length > 0 ? (
        <ul>
          {threads.map((thread) => (
            <li key={thread.id} className="">
              <Link href={`/threads/${thread.id}`} className="block">
                <div className="bg-white shadow-md rounded-lg p-6 mb-6 hover:opacity-65">
                  <div className="flex">
                    <h2 className="font-semibold flex-1 dark:text-black text-lg">
                      {thread.title}
                    </h2>
                    <span className="bg-gray-700 text-white px-2 py-1 text-sm rounded-md">
                      {thread.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Posted by {users[thread.creator]?.userName || "Unknown"} at{" "}
                    {thread.creationDate
                      ? new Intl.DateTimeFormat("sv-SE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }).format(
                          thread.creationDate instanceof Timestamp
                            ? thread.creationDate.toDate() // Convert Firestore Timestamp to JS Date
                            : new Date(thread.creationDate) // Use JavaScript Date if already a date
                        )
                      : "Unknown date"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

//Added a type guard in the filter method to ensure TypeScript understands that validUserPromises contains only non-null promises.

export default AllThreadsPage;
