import React, { useEffect, useState, useRef, useCallback } from 'react';

interface Message {
  id: number;
  sender_name: string;
  subject: string;
  body: string;
  created_at: string;
  parent?: number;
}

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

export default function ChatRoomPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [senderName, setSenderName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chat_sender_name');
    if (saved) setSenderName(saved);
  }, []);

  useEffect(() => {
    if (senderName.trim()) localStorage.setItem('chat_sender_name', senderName.trim());
  }, [senderName]);

  const scrollToBottom = () => {
    setTimeout(() => {
      containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
    }, 100);
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/messages/');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const msgs = Array.isArray(data) ? data : data.results;
      msgs.sort((a: Message, b: Message) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setMessages(msgs);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !body.trim()) {
      setError('Enter name and message');
      return;
    }

    const payload = {
      sender_name: senderName.trim(),
      subject,
      body,
      ...(replyTo && { parent: replyTo.id })
    };

    try {
      const url = editingMessage 
        ? `http://127.0.0.1:8000/messages/${editingMessage.id}/`
        : 'http://127.0.0.1:8000/messages/';
      
      const res = await fetch(url, {
        method: editingMessage ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('failed to send message');

      setSubject('');
      setBody('');
      setReplyTo(null);
      setEditingMessage(null);
      setError(null);
      await fetchMessages();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    setSubject(msg.subject?.startsWith('Re:') ? msg.subject : `Re: ${msg.subject || ''}`);
    setEditingMessage(null);
  };

  const handleEdit = (msg: Message) => {
    setEditingMessage(msg);
    setSubject(msg.subject || '');
    setBody(msg.body);
    setReplyTo(null);
  };

  const handleDelete = async (msgId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/messages/${msgId}/`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      setDeletingMessageId(null);
      await fetchMessages();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">💬 Chat Room</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Real-time messaging • Auto-refresh every 10s
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div
              ref={containerRef}
              className="h-80 overflow-y-auto space-y-3"
            >
              {loading && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading...</p>
              )}
              
              {error && (
                <p className="text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded p-3">
                  {error}
                </p>
              )}
              
              {!loading && messages.length === 0 && (
                <p className="text-center text-gray-400 dark:text-gray-500 py-8">
                  No messages yet. Start chatting!
                </p>
              )}

              {messages.map((msg) => {
                const isMe = msg.sender_name === senderName.trim();
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-lg ${
                        isMe
                          ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-semibold">
                          {isMe ? 'You' : msg.sender_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>

                      {msg.subject && (
                        <div className="font-semibold mb-1 text-sm">
                          {msg.subject}
                        </div>
                      )}

                      <div className="text-sm mb-1">{msg.body}</div>

                      <div className="flex items-center justify-between">
                        {!isMe && (
                          <button
                            onClick={() => handleReply(msg)}
                            className="text-xs text-blue-600 dark:text-blue-400 font-medium"
                          >
                            Reply
                          </button>
                        )}
                        
                        {isMe && (
                          <div className="flex items-center gap-1">
                            {deletingMessageId === msg.id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDelete(msg.id)}
                                  className="text-xs px-2 py-1 bg-red-600 text-white rounded"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeletingMessageId(null)}
                                  className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEdit(msg)}
                                  className="p-1 text-blue-600 dark:text-blue-400"
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  onClick={() => setDeletingMessageId(msg.id)}
                                  className="p-1 text-red-600 dark:text-red-400"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {(replyTo || editingMessage) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-yellow-800 dark:text-yellow-200">
                  {replyTo ? `Replying to ${replyTo.sender_name}` : 'Editing message'}
                </span>
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setEditingMessage(null);
                    setSubject('');
                    setBody('');
                  }}
                  className="text-red-600 dark:text-red-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                  required
                  disabled={!!editingMessage}
                />
                <input
                  type="text"
                  placeholder="Subject (optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="sm:col-span-2 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <textarea
                  placeholder="Type your message... *"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:text-white resize-none"
                  rows={2}
                  required
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white font-medium text-sm ${
                    editingMessage 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {editingMessage ? 'Update' : 'Send'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}