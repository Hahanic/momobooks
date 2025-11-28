import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getDocument } from "../services/documentService";
import { useUserStore } from "../store/userStore";

interface DocumentData {
  _id: string;
  title: string;
  owner_id: string;
  is_public: boolean;
}

export const useDocument = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUserStore();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id || !user) return;

      try {
        setLoading(true);
        const res = await getDocument(id);
        setDocument(res);
      } catch (err) {
        setError("Failed to load document");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, user]);

  return { document, loading, error };
};
