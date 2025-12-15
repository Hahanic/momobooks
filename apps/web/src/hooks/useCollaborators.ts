import { useEffect, useRef, useState } from "react";

import { useEditorStore } from "../store/editorStore";

interface CollaboratorUser {
  name: string;
  color: string;
  avatar?: string;
  id?: string;
}

interface Collaborator {
  clientId: number;
  user: CollaboratorUser;
}

export const useCollaborators = () => {
  const { provider } = useEditorStore();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Map<clientId, UserData>
  const collaboratorsMap = useRef<Map<number, CollaboratorUser>>(new Map());

  useEffect(() => {
    if (!provider || !provider.awareness) return;

    const awareness = provider.awareness;

    // 利用 Y.js awareness 的 'change' 事件提供的 diff 信息
    // { added: number[], updated: number[], removed: number[] }
    const handleAwarenessChange = ({
      added,
      updated,
      removed,
    }: {
      added: number[];
      updated: number[];
      removed: number[];
    }) => {
      let hasContentChange = false;

      // 处理新增用户
      added.forEach((clientId) => {
        if (clientId === awareness.clientID) return; // 过滤自己
        const state = awareness.getStates().get(clientId);
        if (state?.user) {
          collaboratorsMap.current.set(clientId, state.user as CollaboratorUser);
          hasContentChange = true;
        }
      });

      // 处理移除用户
      removed.forEach((clientId) => {
        if (collaboratorsMap.current.has(clientId)) {
          collaboratorsMap.current.delete(clientId);
          hasContentChange = true;
        }
      });

      // 处理更新
      // 因为用户的信息可能会变化（如颜色、名称等）
      // 而且光标移动也会触发 updated，所以需要过滤掉这种情况，防止频繁更新
      updated.forEach((clientId) => {
        if (clientId === awareness.clientID) return;

        const state = awareness.getStates().get(clientId);
        const newUser = state?.user as CollaboratorUser | undefined;
        const oldUser = collaboratorsMap.current.get(clientId);

        if (!newUser) {
          // 如果更新后没有 user 数据了，视为移除
          if (oldUser) {
            collaboratorsMap.current.delete(clientId);
            hasContentChange = true;
          }
          return;
        }

        // 如果之前没记录这个用户，现在有了，视为新增
        if (!oldUser) {
          collaboratorsMap.current.set(clientId, newUser);
          hasContentChange = true;
          return;
        }

        if (JSON.stringify(newUser) !== JSON.stringify(oldUser)) {
          collaboratorsMap.current.set(clientId, newUser);
          hasContentChange = true;
        }
      });

      // 只有当 用户列表 或 用户信息 真正发生变化时，才更新 React State
      if (hasContentChange) {
        const list = Array.from(collaboratorsMap.current.entries())
          .map(([clientId, user]) => ({
            clientId,
            user,
          }))
          .sort((a, b) => a.clientId - b.clientId);

        setCollaborators(list);
      }
    };

    // 组件挂载时，先读取一次当前的完整状态
    const initialMap = new Map<number, CollaboratorUser>();
    awareness.getStates().forEach((state, clientId) => {
      if (clientId !== awareness.clientID && state.user) {
        initialMap.set(clientId, state.user as CollaboratorUser);
      }
    });
    collaboratorsMap.current = initialMap;
    setCollaborators(
      Array.from(initialMap.entries())
        .map(([clientId, user]) => ({ clientId, user }))
        .sort((a, b) => a.clientId - b.clientId),
    );

    awareness.on("change", handleAwarenessChange);

    return () => {
      awareness.off("change", handleAwarenessChange);
    };
  }, [provider]);

  return collaborators;
};
