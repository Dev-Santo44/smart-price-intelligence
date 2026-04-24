"use client";
import React, { useState } from "react";
import { CheckCircle2, Clock, XCircle, Send, MessageSquare } from "lucide-react";

const STEPS = [
  { key: "draft", label: "Draft", icon: Clock },
  { key: "submitted", label: "Submitted", icon: Send },
  { key: "approved", label: "Approved", icon: CheckCircle2 },
];

export default function ApprovalWorkflow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [comments, setComments] = useState([
    { user: "Shantanu M.", text: "Proposing 7.5% increase based on ML recommendation and market shift.", time: "2 hours ago" },
    { user: "Priya K.", text: "Looks reasonable. Can we see impact on SMB segment?", time: "1 hour ago" },
  ]);
  const [newComment, setNewComment] = useState("");

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { user: "You", text: newComment, time: "Just now" }]);
    setNewComment("");
  };

  const advance = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const reject = () => setCurrentStep(0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="mb-4">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wide">Plan</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">Approval Workflow</h3>
      </div>

      {/* Status Stepper */}
      <div className="flex items-center gap-1 mb-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <React.Fragment key={step.key}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${isDone ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : isActive ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-2 ring-blue-300 dark:ring-blue-700" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                <Icon className="w-3.5 h-3.5" />
                {step.label}
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${isDone ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex gap-2 mb-4">
        {currentStep < STEPS.length - 1 && (
          <button onClick={advance} className="text-[11px] px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold">
            {currentStep === 0 ? "Submit for Review" : "Approve"}
          </button>
        )}
        {currentStep > 0 && currentStep < STEPS.length - 1 && (
          <button onClick={reject} className="text-[11px] px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-semibold flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Reject
          </button>
        )}
        {currentStep === STEPS.length - 1 && (
          <div className="text-[11px] px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Active
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
        <div className="flex items-center gap-1.5 mb-2 text-xs text-slate-500"><MessageSquare className="w-3 h-3" /> Comments</div>
        <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
          {comments.map((c, i) => (
            <div key={i} className="text-[11px] p-2 rounded bg-slate-50 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{c.user}</span>
              <span className="text-slate-400 ml-2">{c.time}</span>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()}
            placeholder="Add a comment..." className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-1 focus:ring-blue-500" />
          <button onClick={addComment} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">Send</button>
        </div>
      </div>
    </div>
  );
}
