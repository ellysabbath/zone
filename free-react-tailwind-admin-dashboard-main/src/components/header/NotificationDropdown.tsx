import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Dropdown } from "../ui/dropdown/Dropdown";

// Define types for your messages
interface Message {
  id: number;
  sender_name: string;
  subject: string;
  body: string;
  created_at: string;
  parent?: number;
}

interface SendMessagePayload {
  sender_name: string;
  subject: string;
  body: string;
  parent?: number;
}

// SVG icons to replace react-icons (reduced by 30%)
const EditIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const CheckDoubleIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
  </svg>
);

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
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
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100);
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/messages/');
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      const msgs = Array.isArray(data) ? data : data.results;

      msgs.sort((a: Message, b: Message) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setMessages(msgs);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Unknown error');
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
      setError('Please enter your name and message.');
      return;
    }

    const payload: SendMessagePayload = {
      sender_name: senderName.trim(),
      subject,
      body,
    };
    if (replyTo) payload.parent = replyTo.id;

    try {
      let res;
      if (editingMessage) {
        res = await fetch(`http://127.0.0.1:8000/messages/${editingMessage.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('http://127.0.0.1:8000/messages/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error(editingMessage ? 'Failed to update message' : 'Failed to send');

      setSubject('');
      setBody('');
      setReplyTo(null);
      setEditingMessage(null);
      setError(null);
      await fetchMessages();
    } catch (err) {
      setError((err as Error).message || 'Unknown error');
    }
  };

  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    setSubject(msg.subject?.startsWith('Re:') ? msg.subject : `Re: ${msg.subject || ''}`);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setSubject('');
  };

  const handleEdit = (msg: Message) => {
    setEditingMessage(msg);
    setSubject(msg.subject || '');
    setBody(msg.body);
    setReplyTo(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setSubject('');
    setBody('');
  };

  const confirmDelete = (msgId: number) => {
    setDeletingMessageId(msgId);
  };

  const cancelDelete = () => {
    setDeletingMessageId(null);
  };

  const handleDelete = async (msgId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/messages/${msgId}/`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete message');

      setDeletingMessageId(null);
      await fetchMessages();
    } catch (err) {
      setError((err as Error).message || 'Unknown error');
    }
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };

  // Calculate responsive positioning
  const getDropdownPosition = (): React.CSSProperties => {
    if (typeof window === 'undefined') return {};

    const isSmallScreen = window.innerWidth < 768; // md breakpoint
    
    if (isSmallScreen) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: '90vw',
        maxWidth: '400px',
        maxHeight: '80vh'
      };
    } else {
      return {
        position: 'absolute',
        right: '0',
        top: '100%',
        marginTop: '12px',
        width: '330px',
        height: '420px'
      };
    }
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-8 w-8 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0 z-10 h-1.5 w-1.5 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="16"
          height="16"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.54248 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Overlay for small screens */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-9998 md:hidden"
          onClick={closeDropdown}
        />
      )}

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className={`flex flex-col rounded-xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-700 dark:bg-gray-800 ${
          typeof window !== 'undefined' && window.innerWidth < 768 
            ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-9999 w-11/12 max-w-[400px] max-h-[80vh]'
            : 'absolute right-0 mt-3 w-[330px] h-[420px]'
        }`}
        style={getDropdownPosition()}
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-600">
          <h5 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            💬 Chat Room
          </h5>
          <button
            onClick={closeDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        
        {/* Chat Messages Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto space-y-1.5 mb-2 custom-scrollbar"
          style={{ 
            maxHeight: typeof window !== 'undefined' && window.innerWidth < 768 
              ? 'calc(80vh - 180px)' 
              : '210px' 
          }}
        >
          {loading && <p className="text-center text-gray-500 text-xs dark:text-gray-400">Loading messages...</p>}
          {error && <p className="text-center text-red-600 text-xs dark:text-red-400">{error}</p>}
          {!loading && messages.length === 0 && (
            <p className="text-center text-gray-400 text-xs dark:text-gray-500">No messages yet.</p>
          )}

          {messages.map((msg) => {
            const isMe = msg.sender_name === senderName.trim();
            return (
              <div
                key={msg.id}
                className={`relative max-w-[85%] px-2 py-1.5 rounded-md shadow-sm text-xs ${
                  isMe
                    ? 'ml-auto bg-green-100 text-green-900 text-right dark:bg-green-900 dark:text-green-100'
                    : 'mr-auto bg-gray-100 text-gray-800 text-left dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                <div className="text-xs font-semibold mb-0.5">
                  {isMe ? 'You' : msg.sender_name}
                </div>
                {msg.subject && <div className="font-semibold mb-1 text-xs">{msg.subject}</div>}
                <div className="text-xs">{msg.body}</div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-400 dark:text-gray-500">
                  <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  {isMe && <CheckDoubleIcon />}
                </div>

                {isMe && (
                  <div className="absolute top-0.5 right-0.5 flex items-center space-x-1">
                    {deletingMessageId === msg.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-xs px-1 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="text-xs px-1 py-0.5 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          title="Edit"
                          onClick={() => handleEdit(msg)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <EditIcon />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => confirmDelete(msg.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon />
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!isMe && (
                  <button
                    onClick={() => handleReply(msg)}
                    className="mt-1 text-xs text-blue-500 hover:underline dark:text-blue-400"
                  >
                    Reply
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Reply/Edit Status */}
        {(replyTo || editingMessage) && (
          <div className="bg-yellow-100 border border-yellow-300 px-2 py-1 text-xs text-gray-700 rounded mb-1.5 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-100">
            {replyTo ? (
              <>
                Replying to <strong>{replyTo.sender_name}</strong>
                <button
                  onClick={cancelReply}
                  className="ml-2 text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                Editing message
                <button
                  onClick={cancelEdit}
                  className="ml-2 text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}

        {/* Message Input Form */}
        <form
          onSubmit={handleSend}
          className="bg-white border-t border-gray-200 pt-1.5 flex flex-col gap-1.5 dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Your Name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-1/3 border border-gray-300 rounded px-1.5 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
              disabled={!!editingMessage}
            />
            <input
              type="text"
              placeholder="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-1.5 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-1.5 items-end">
            <textarea
              placeholder="Type your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-1.5 py-1 text-xs resize-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={1}
              required
            />
            <button
              type="submit"
              className={`px-2 py-1 rounded text-white text-xs ${
                editingMessage 
                  ? 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700' 
                  : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
              }`}
            >
              {editingMessage ? 'Update' : 'Send'}
            </button>
          </div>
        </form>
      </Dropdown>
    </div>
  );
}