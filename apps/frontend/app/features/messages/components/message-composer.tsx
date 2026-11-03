import { CornerUpLeft, Pencil, Send, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { v7 as uuidv7 } from "uuid";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTypingEmitter } from "@/features/realtime/hooks/use-typing-emitter";

import { useEditMessage, useSendMessage } from "../api/use-message-service";
import { useComposerStore } from "../stores/composer-store";

const MAX_LENGTH = 2000; // websocket limit (REST allows 4000)

export function MessageComposer({ roomId }: { roomId: string }) {
  const [text, setText] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);

  const replyTo = useComposerStore((s) => s.replyTo[roomId]);
  const editing = useComposerStore((s) => s.editing[roomId]);
  const { setReplyTo, setEditing } = useComposerStore();

  const send = useSendMessage(roomId);
  const edit = useEditMessage(roomId);
  const typing = useTypingEmitter(roomId);

  // Entering edit mode loads the message body; reply mode just focuses.
  useEffect(() => {
    if (editing) setText(editing.body ?? "");
    if (editing || replyTo) input.current?.focus();
  }, [editing, replyTo]);

  const body = text.trim();
  const canSend = body.length > 0;

  const submit = () => {
    if (!canSend) return;
    typing.stop();

    if (editing) {
      if (body && body !== editing.body)
        edit.mutate({ id: editing.id, body });
      setEditing(roomId, undefined);
      setText("");
      return;
    }

    send.mutate({
      clientMessageId: uuidv7(),
      body: body || undefined,
      replyToId: replyTo?.id,
    });
    setText("");
    setReplyTo(roomId, undefined);
  };

  const cancelContext = () => {
    setReplyTo(roomId, undefined);
    if (editing) {
      setEditing(roomId, undefined);
      setText("");
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      cancelContext();
    }
  };

  return (
    <div className="shrink-0 px-4 pb-4 md:px-6 md:pb-5">
      <div className="bg-card focus-within:border-ring focus-within:ring-ring/20 rounded-xl border shadow-sm transition-[border-color,box-shadow] focus-within:ring-4">
        {(replyTo || editing) && (
          <div className="text-muted-foreground flex items-center gap-2 border-b px-3 py-1.5 text-xs">
            {editing ? <Pencil className="size-3" /> : <CornerUpLeft className="size-3" />}
            <span className="flex-1 truncate">
              {editing
                ? "Editing message"
                : `Replying to ${replyTo?.sender.name}: ${replyTo?.body ?? "Attachment"}`}
            </span>
            <button type="button" onClick={cancelContext} aria-label="Cancel">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-1 p-1.5">
          <Textarea
            ref={input}
            value={text}
            rows={1}
            maxLength={MAX_LENGTH}
            placeholder="Write a message…"
            onChange={(e) => {
              setText(e.target.value);
              if (!editing && e.target.value) typing.notify();
            }}
            onKeyDown={onKeyDown}
            className="max-h-40 min-h-9 resize-none border-0 bg-transparent px-2 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Button size="icon" aria-label="Send" disabled={!canSend} onClick={submit}>
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}
